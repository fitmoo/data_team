var expect = require('expect.js'),
	_ = require('underscore'),
	async = require('async'),
	request = require('request');

var DatabaseManager = require('../data/'),
	configs = require('../utils/configs');
//?assetName=Double Road Race 15K Challenge&current_page=0&api_key=6et7a8xrw3v57vumt54e68sp
var eventParser = require('../scraper/active/eventParser'),
	URI = 'http://api.amp.active.com/v2/search',
	api_key = '6et7a8xrw3v57vumt54e68sp',
	parentEvent = {assetName : 'Double Road Race Pleasanton 10k +5k', current_page : 0, api_key : api_key};

var events = [];

var db = new DatabaseManager(configs);

describe('Test Scraper Active API', function(){
	it('Search by Parent eventName', function(done){
		defaultOption = {
			url: 'http://api.amp.active.com/v2/search',
			method: 'GET',
			headers: {Accept: 'application/json'}
		},
		defaultOption.qs = {assetName: 'Double Road Race Pleasanton 10k +5k', current_page : "0", api_key : api_key};
		request(defaultOption, function(err, response, body){
			expect(err).to.eql(null);
			result = JSON.parse(body);
			expect(result.results).not.to.eql(null);
			expect(result.results.length).to.be.above(0);
			eventArray = eventParser.parseArray(result.results);
			events.push(eventArray[0]);
			done();
			//{"_id" : "7acd47221dc7412f9d634297e13f1c9e"}
		});
  	})

  	it('Search  activity', function(done){
		defaultOption = {
			url: 'http://api.amp.active.com/v2/search',
			method: 'GET',
			headers: {Accept: 'application/json'},
			qs : {assetName: '', current_page : "0", api_key : api_key}
		},
		async.mapSeries(events[0].activities, 
			function(activity, done){
				defaultOption.qs.assetName = activity.name;
				request(defaultOption, function(err, response, body){
					expect(err).to.eql(null);
					result = JSON.parse(body);
					expect(result.results).not.to.eql(null);
					expect(result.results.length).to.be.above(0);
					eventArray = eventParser.parseArray(result.results);
					events.push(eventArray[0]);
					setTimeout(function(){ done() }, 2000);
				});
			},
			function(err, result){
				console.log('Total event found: ' + events.length);
				expect(events.length).to.eql(4);
				//console.log(events[1]);
				//console.log(events[2]);
				//console.log(events[3]);

				done();
			}
		)
  	})

  	it('Insert to DB', function(done){
		db.init(['Event'], function(){
			var eventService = db.getInstance('Event');
			eventService.createBundle(events, function(err, totalRecords){
				console.log('%s have been saved.', totalRecords);
				done();
			})

		});

  	})

});
