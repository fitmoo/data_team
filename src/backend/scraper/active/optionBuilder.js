var async = require('async'),
	_ = require('underscore'),
	request = require('request'),
	dateUtils = require('../../utils/dateUtils.js');

	apiKey = '6et7a8xrw3v57vumt54e68sp';//'sqq35zvx6a8rgmxhy9csm8qj';6et7a8xrw3v57vumt54e68sp
	defaultOption = {
		url: 'http://api.amp.active.com/v2/search',
		method: 'GET',
		headers: {Accept: 'application/json'}
	},

	keyword = "Running, cycling, swimming, triathlons, duathlons, walking, mountain biking, adventure racing, Crossfit competitions, Aerobics, dance, zumba, yoga, Pilates, ballet, Sailing, hiking, climbing, kayaking, rafting, fishing, hunting",

	//keyword = "Running";
	keywordArray = keyword.split(','),
	
	PAGE_SIZE = 80,
	filterCriteriaArray = [];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Generate an array of filter criteria to retrieve data from active.com

/*
*	@db: DB instance
*	@option: 2 values: reset | 	continue
*/
function generateFilterCriteria(db, option, callback){
   	db.init(['EventRequest'], function(err){
		if (err) console.log(err);
		else {
			console.log('Init EventRequest service');
			//Save option request to DB incase the system error while running
			if (option === 'reset'){
				async.mapSeries(keywordArray, getTotalRecordsByKeyword, function(err, result){

					db.getInstance('EventRequest').removeAllRequests(function(){
						db.getInstance('EventRequest').createBundle(filterCriteriaArray, function(){
							callback && callback(err, filterCriteriaArray);
						});
					});
				
				})
			//Else load jobs to continue
			} else {
				db.getInstance('EventRequest').loadRequests(function(err, requests){
					callback && callback(err, requests);
				});
			}	
		};
	});
}

function getTotalRecordsByKeyword(keyword, callback){
	var option = buildQuery(keyword.trim(), 1, 0);

	request(option, function(err, response, body){
		if(err) return callback(err);
		var result = JSON.parse(body);

		pageCount = Math.ceil(result.total_results / PAGE_SIZE);
		//pageCount = 1;
		for(pageIndex = 0; pageIndex < pageCount; pageIndex++){
			filterCriteriaArray.push(buildQuery(keyword, PAGE_SIZE, pageIndex));
		}
		setTimeout(function(){callback()}, 500);
	}); 
}

function buildQuery(keyword, pagesize, currentPage){
	var obj = new Object();
	var end_date = dateUtils.getCurrentDateString() + '..';

	_.extend(obj, defaultOption);
	pagesize = pagesize || 1;
	currentPage = currentPage || 0;

	obj.qs = {query: keyword, per_page: pagesize, current_page : currentPage, api_key: apiKey, end_date: end_date};
	obj.finished = false;
	return obj;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.generateFilterCriteria = generateFilterCriteria;