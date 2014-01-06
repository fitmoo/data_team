var geocoder = require('geocoder'),
	async = require('async');
	_ = require('underscore');
	util = require('util');

var geocoderParser = require('./geocoderParser'),
	facilityParser = require('./facilityParser'),
	dateUtils = require('../../utils/dateUtils'),
	configs = require('../../utils/configs'),
	DatabaseManager = require('../../data/');

var MODEL_NAME = 'Facility';

//module.exports = {
var test = {
	//DatabaseManager instance
	db : null,
	facilityService : null,
	
	//Start scraping map.crossfit.com
	start : function(fn){
		self = this;
		this.init(function(err){
			var tasks = [
							function(fn){ 
								self.facilityService.findMissingFacilities(function(err, results){
									fn && fn(err, results);
								});
							}, 
							function(facilities, fn){ self.geocoding(facilities, fn) }
						];
			async.waterfall(tasks, function(err, result){
				fn && fn(err, result);
			});
		});
	},

	init: function(fn){
       	this.db = new DatabaseManager(configs);
       	self = this;
       	this.db.init([MODEL_NAME], function(err){
			if (err) console.log(err);
			else{
				self.facilityService = self.db.getInstance(MODEL_NAME);
				console.log('Init facility service');
			};
			fn && fn(err);
		});
	},

	/*
	* Load facilities from DB
	*/
	geocoding: function(facilities, fn){
		self = this;
		console.log(facilities.length);
		var count = 0;
		async.mapSeries(facilities,
			function(facility, done){
				//Reverse Geocoding
				
					geocoder.reverseGeocode(facility.lat, facility.lng, function ( err, data ) {
						if (!err){
							if (data.status === 'OVER_QUERY_LIMIT'){
								done(data.status);
							}
							else{
								code = geocoderParser.parse(data.results);
								console.log('%s %s %j', count, facility._id, code);
								count ++;

								self.facilityService.updateData(facility._id, code, function(err, updatedObject){
									if (err) console.log(err);
									setTimeout(function(){ done && done(null, updatedObject); }, 350);
								});	
							}	
						}
						else
							setTimeout(function(){ done && done(null, null); }, 350);
						
					});
			
			},
			fn
		);
	}
}

test.start(function(err, results){
	if(err) console.log(err);
	console.log('finished');
})


// geocoder.reverseGeocode(40.707620545275,22.9409658908844, function ( err, data ) {
// 	code = geocoderParser.parse(data.results);
// 	console.log('%j', code);
// });


// http://maps.googleapis.com/maps/api/geocode/json?latlng=40.6376175,22.9425158&sensor=false -> 52737c825c4c8caa0300110a
