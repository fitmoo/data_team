var request = require('request'),
	_ = require('underscore'),
	async = require('async');

var facilityParser = require('./facilityParser'),
	dateUtils = require('../../utils/dateUtils'),
	configs = require('../../utils/configs'),
	DatabaseManager = require('../../data/');

var	VARIABLE_NAME = 'var cfaloc2 = [',
	REDUNDANCE_STR = '];',
	CARGO_PAYLOAD = 100,
	//Model Name
	MODEL_NAME = 'Facility';

var hotfix = {

	//DatabaseManager instance
	db : null,

	//Start scraping map.crossfit.com
	start : function(fn){
		self = this;
	
		this.init(function(err){
			var tasks = [function(fn){ self.getAllFacilityGeoCodes(fn); }, function(facilityGeocodes, fn) {self.getAllFacilityInfo(facilityGeocodes, fn)}];
			async.waterfall(tasks, function(err, result){
				fn && fn(err, result);
			});
		});
	},

	init: function(fn){
       	this.db = new DatabaseManager(configs);
       	this.db.init([MODEL_NAME], function(err){
			if (err) console.log(err);
			else{
				console.log('Init facility service');
			};
			fn && fn(err);
		});
	},



	//Get all facility Geocode from map.crossfit.com
	getAllFacilityGeoCodes: function(callback){
		var option = {
			url: 'http://map.crossfit.com/js/cfaffmapdata.js',
			method: 'GET'
		};

		request(option, function(err, response, body){
			facilityGeocodes = body.split(',');

			//Remove Variable Name
			if (facilityGeocodes[0].indexOf(VARIABLE_NAME) === 0){
				facilityGeocodes[0] = facilityGeocodes[0].replace(VARIABLE_NAME, '');
			} else {
				return callback('map.crossfit.com changed data format', null);
			}

			//Remove redundance character the last item on array
			len = facilityGeocodes.length;
			if (facilityGeocodes[len - 1].indexOf(REDUNDANCE_STR)){
				facilityGeocodes[len - 1] = facilityGeocodes[len - 1].replace(REDUNDANCE_STR, '');
			} else{
				return callback('map.crossfit.com changed data format', null);
			}
			callback(null, facilityGeocodes);
		});

	},

	
	getAllFacilityInfo: function(facilityGeocodes, callback){
		
		//Organize facilityGeocodes to an array of object
		var facilities = [];
		service = this.db.getInstance(MODEL_NAME);

		for(var i = 0, len = facilityGeocodes.length; i < len; i+=3){
			facilities.push({
				facilityID : facilityGeocodes[i],
				lat : facilityGeocodes[i + 1],
				lng : facilityGeocodes[i + 2]}
			);

		}
		async.mapSeries(facilities, function(facility, fn){
			console.log('Update facilityID ' + facility.facilityID);
			service.updateLatLng(facility.facilityID, facility.lat, facility.lng, function(err, updated){
				if(err) console.log(err);
				fn && fn(err, 1);
			});
		}, function(err, results){
			callback(err, results);
		})

		
	},
};

hotfix.start(function(err, result){
	console.log('Finish');
	console.log(result.length);
});
