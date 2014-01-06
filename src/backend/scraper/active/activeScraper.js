var request = require('request'),
	async = require('async'),
	_ = require('underscore'),
	optionBuilder = require('./optionBuilder'),
	extend = require('../../utils/extend.js'),
	nconf = require('nconf'),
	
	CARGO_PAYLOAD = 1,
	MODEL_NAME = 'Event',
	MODEL_CRAWLSTATUS = 'CrawlStatus',
	dateUtils = require('../../utils/dateUtils'),
	configs = require('../../utils/configs'),
	eventParser = require('./eventParser'),
	DatabaseManager = require('../../data/');


////////////////////////////////////////////////////////////////////////////////////
// Consume Active API object
////////////////////////////////////////////////////////////////////////////////////

var activeScraper = {
	//async cargo object to handle the insert function with specific PAY_LOAD
	cargo : null,

	//DatabaseManager instance
	db : null,

	//Result object:
	scraperResult : {

		//ID to keep track process in DB: collection crawlStatus
		crawlStatusID : null,

		//Total requests need to send
		totalRequests : 0,

		//Total requests have been sent
		sentRequests : 0,
		
		//All requests are sent
		sendingFinish : false,
		
		//ResponseCode from active.com api
		responseCode : 200,
		
		//Error
		err : null,
		
		//All data saved
		savedAll : false,
		
		//Total records have been saved.
		totalSavedRecords : 0,
		
		//Total response data have been saved.
		totalSavedResponse : 0
	},

	//Start scrapping process
	start: function(crawlStatusID, option, fn){
		var self = this;

		this.scraperResult.crawlStatusID = crawlStatusID;
		console.log('Start active scraper at %s mode' , option);

		this.init(function(err){
			self.cargo.drain = function(){ self.checkDone(fn); };
			var tasks = [

				function(fn){ 
					optionBuilder.generateFilterCriteria(self.db, option, function(err, results){
						fn && fn(err, self.cargo, results);
					});
				}
				,
				function (cargo, items, callback){
					self.consumeActiveApi(cargo, items, callback);
				}
				];
			async.waterfall(tasks, function(err, result){
				self.scraperResult.sendingFinish = true;
				fn && fn(err, self.scraperResult);
			});
		});
	},

	checkDone: function(fn){
		console.log('Sent %s/%s requests to active.com', this.scraperResult.sentRequests, this.scraperResult.totalRequests);
		if (this.scraperResult.totalRequests === this.scraperResult.sentRequests && this.scraperResult.totalSavedResponse ===  this.scraperResult.sentRequests){
			//Notify total response data have been saved.
			var temp = _.omit(this.scraperResult);
			temp.savedAll = true;
			
			//Update crawl event status to DB
			var currentDate = new Date();

			this.db.getInstance(MODEL_CRAWLSTATUS).updateData(this.scraperResult.crawlStatusID, {sentRequests : this.scraperResult.sentRequests, endDate : currentDate, status: "Finish"}, function(err, count){
				console.log(err);
				console.log('Count' + count);
				fn && fn(err, temp);
			});
		}
	},

	reset: function(){
		//Reset value incase error
		this.cargo = null;
		if (this.db) this.db.destroy();
		this.scraperResult.totalRequests = 0;
		this.scraperResult.sentRequests = 0;
		this.scraperResult.sendingFinish = false,
		this.scraperResult.responseCode = 200,
		this.scraperResult.err = null,
		this.scraperResult.savedAll = false,
		this.scraperResult.totalSavedRecords = 0,
		this.scraperResult.totalSavedResponse = 0

	},

	init: function(fn){
		this.cargo = this.getCargoObject();
       	this.db = new DatabaseManager(configs);
       	this.db.init([MODEL_NAME, MODEL_CRAWLSTATUS], function(err){
			if (err) console.log(err);
			else{
				console.log('Init %s, %s service', MODEL_NAME, MODEL_CRAWLSTATUS);
			};
			fn && fn(err);
		});
	},

	getCargoObject : function(){
		if(this.cargo) return this.cargo;
		self = this;
		this.cargo = async.cargo(
			function(items, fn){ 
				self.storeEvent(self.db, items, fn); 
			}
			, CARGO_PAYLOAD);
		return this.cargo;
	},


	//Retrieve events from active.com
	consumeActiveApi: function(cargo, items, done){
		var len = items.length;

		console.log('Active Scrapper: Going to send %s request(s) to active.com at %s', len, dateUtils.getCurrentTime());
		this.scraperResult.totalRequests = len;
		var self = this;

		this.db.getInstance(MODEL_CRAWLSTATUS).updateData(this.scraperResult.crawlStatusID, {totalRequests : this.scraperResult.totalRequests}, function(err, count){
			if(err) done(err, self.scraperResult);
			else{

				async.mapSeries(items,
							function(option, callback){
								//request lib get error when pass option object(load from DB). So have to go around:
								temp = {
									option: {
										url: 'http://api.amp.active.com/v2/search',
										method: 'GET',
										qs: {
											query: option.qs.query, per_page: option.qs.per_page, current_page : option.qs.current_page, api_key: '6et7a8xrw3v57vumt54e68sp'
										}
									},
									_id : option._id
								};
								
								request(temp.option, function(err, response, body){

									//DEBUG ONLY
									//if (self.scraperResult.sentRequests == 1)
									//	response.statusCode = 405;
									if (!err && response.statusCode == 200) {
										cargo.push({body : body, request: temp}, function(err){
											if(err) return callback(err);
										});
										self.scraperResult.sentRequests += 1;
										setTimeout(function(){callback();}, 500);
									}
									else {
										self.scraperResult.responseCode = response && response.statusCode;
										done(err, self.scraperResult);
									}
								});
							},
							function(err, result){
								done(err, this.scraperResult);
							}
						);
			}
		})
	},
	
	//Parsing then save to DB
	storeEvent : function(db, jsonDatas, async_callback){
		self = this;
		async.map(
			jsonDatas,
			function(jsonData, callback){
				try{
					results = JSON.parse(jsonData.body).results;
				}catch(err){
					results = [];
					console.log(jsonData.body);
				}
				eventArray = eventParser.parseArray(results);
				if (eventArray && eventArray.length > 0){
					db.getInstance(MODEL_NAME).createBundle(eventArray, function(err, totalSavedRecords){
						db.getInstance('EventRequest').removeRequestById(jsonData.request._id);
						callback(err, totalSavedRecords);
					});
				}
				else{
					callback(null, 0);
				}
			},
			function(err, totalSavedRecord){
				console.log('Saved %s event record', totalSavedRecord);
				self.scraperResult.totalSavedRecords +=  parseInt(totalSavedRecord);
				self.scraperResult.totalSavedResponse += 1;
				async_callback(err);
			}
		);
	}

};

module.exports = activeScraper;
