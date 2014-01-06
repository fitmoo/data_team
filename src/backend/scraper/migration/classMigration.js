var async = require('async'),
	lazy = require('lazy'),
	path = require('path'),
	_ = require('underscore'),
	async = require('async');
	fs = require('fs');

var classFileName =  path.resolve(__dirname, 'Fm_tbl_classes.csv'),
	configs = require('../../utils/configs'),
	dateUtils = require('../../utils/dateUtils'),
	DatabaseManager = require('../../data/');

var db = new DatabaseManager(configs);
var services = ['Facility', 'Class'];

var parserUtil = require('../../utils/parserUtil');

module.exports = {

	facilityService : null,
	classService : null,
	dayOfWeeks : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],

	migrate: function(done){
		var self = this;
		var tasks = [
			function(fn){ self.init(fn) },
			function(fn){ self.start(fn) },
		];

		async.waterfall(tasks, function(err, result){
			if(err) console.log(err);
			else
				done && done(err, result);
		});
	},

	init: function(fn){
		var self = this;
		db.init(services, function(){
			self.facilityService = db.getInstance(services[0]);
			self.classService = db.getInstance(services[1]);
			fn && fn(null);
		});
	},

	start : function(fn){
		var index = 0,
			readStream = fs.createReadStream(classFileName, { encoding : 'utf8'}),
			classArray = [];
			keys = [];
		var self = this;

		lazy(readStream)
     	.lines
     	.forEach(
     		function(line){
     			if(index === 0){
	     			keys = self.getKeys(line);
	     		} else{
	     			var rawObject = self.assignValue(keys, line);
	     			var classObject = self.mapObjectToFitmooModel(rawObject);
	     			if(classObject)
	     				classArray.push(classObject);
				}
				index++;
     		}
     	).on('pipe', function(){
     		setTimeout(function(){
     			console.log('Going to update database: %s records', classArray.length);
     			self.updateDB(classArray, fn);
     		}, 2*1000);
     	});
	},

	getKeys : function(data){
		var array = data.toString().split(',');
		var keys = [];

		_.map(array, function(item){
			var property = item.trim().replace(" ", "");
			keys.push(property);
		});
		return keys;
	},

	assignValue: function(keys, data){
		var valueArray = parserUtil.cSVToArray(data.toString(), ",");
		var object = {};
		var index = 0;

		if(valueArray.length >= 1){
			_.map(keys, function(key){
				Object.defineProperty(object, key, {
					value : valueArray[0][index].trim(),
					writable : true,
					enumerable: true,
					configurable: true
				});
				index ++;
			});
		}
		return object;
	},

	updateDB: function(bundle, fn){
		//Assign facilityID
		var self = this;
		var countError = 0;
		var index = 0;

		async.mapSeries(bundle,
			function(classObject, done){

				index++;
				self.facilityService.getOne({fitmooFacilityID : classObject.fitmooFacilityID}, function(err, facility){
					if(err || !facility){
						countError++;
						console.log(classObject);
						classObject.migrationStatus = 0;
						classObject.migrationNote = 'Facility not exist';
					} else{
						classObject.facilityID = facility._id;
						classObject.facilityName = facility.facilityName;
						classObject.migrationStatus = 1;
					}
					console.log('index: %s', index);
					self.classService.createClass(classObject, done);
				})
			},
			function(err, results){
				console.log('Total error: %s', countError);
				fn && fn(err, results);
			}
		);

		
	},

	/*
	* Map existing object to fitmoo data model
	* OLD model:
		'Id',
		'Facility_id',
		'Class_name',
		'Dow',
		'Start_hour',
		'Start_minute',
		'Start_am_pm',
		'End_hour',
		'End_minute',
		'End_am_pm'
	*Example:
		{"Id":"1",
		"Facility_id":"1",
		"Class_name":"test1",
		"Dow":"1",
		"Start_hour":"1",
		"Start_minute":"0",
		"Start_am_pm":"PM",
		"End_hour":"2",
		"End_minute":"0",
		"End_am_pm":"PM"}
	*/
	mapObjectToFitmooModel: function(rawObject){
		var classObject = Object();
		classObject.fitmooFacilityID = rawObject.Facility_id;
		classObject.className = rawObject.Class_name;
		var dayOfWeek = dateUtils.getDayOfWeek(rawObject.Dow);

		var	starthour = rawObject.Start_hour &&  rawObject.Start_hour.length == 1 ? '0' + rawObject.Start_hour : rawObject.Start_hour;
		var	startmins = rawObject.Start_minute &&  rawObject.Start_minute.length == 1 ? '0' + rawObject.Start_minute : rawObject.Start_minute;

		var	endhour = rawObject.End_hour &&  rawObject.End_hour.length == 1 ? '0' + rawObject.End_hour : rawObject.End_hour;
		var	endmins = rawObject.End_minute &&  rawObject.End_minute.length == 1 ? '0' + rawObject.End_minute : rawObject.End_minute;
		var startTime = starthour + ':' + startmins + ' ' + rawObject.Start_am_pm;
		var endTime = endhour + ':' + endmins + ' ' + rawObject.End_am_pm;

		classObject.dayOfWeek = dayOfWeek;
		classObject.schedule = [];
		var scheduleItem = {
			dayOfWeek : dayOfWeek,
			times: [
				{startTime : startTime, endTime: endTime}
			]
		}
		classObject.schedule.push(scheduleItem);

		//ignore class doesn't informative
		if(!_.contains(this.dayOfWeeks, classObject.dayOfWeek)){
			return null;
		}
		return classObject;
	},

}

