var async = require('async'),
	path = require('path'),
	_ = require('underscore');
	

var configs = require('../../utils/configs'),
	dateUtils = require('../../utils/dateUtils'),
	DatabaseManager = require('../../data/');

var services = ['Facility', 'Event', 'FacilityEvent'],
	db = new DatabaseManager(configs);

module.exports = {
	facilityService : null,
	eventService : null,
	facilityEventService : null,
	

	link: function(done){
		var self = this;
		var tasks = [
			function(fn){ self.init(fn) },
			function(fn){ self.start(fn) },
		];

		async.waterfall(tasks, function(err, result){
			if(err) console.log(err);
			else
				done && done();
		});
	},

	init: function(fn){
		var self = this;
		db.init(services, function(){
			self.facilityService = db.getInstance(services[0]);
			self.eventService = db.getInstance(services[1]);
			self.facilityEventService = db.getInstance(services[2]);
			fn && fn(null);
		});
	},

	//Total facility have event 22
	//Total event : 23058

	start : function(fn){
		
		var facilityEvent = [];
		//52737f615c4c8caa030013bd
		//52737f615c4c8caa030013bd
		//527381145c4c8caa03001556
		var self = this;

		this.facilityService.getAllFacility(function(err, facilities){
		//this.facilityService.modelClass.find({"_id" : { $in : ["52737f615c4c8caa030013bd"]}} , function(err, facilities){
			
			var index = 0;
			var facility;
			console.log(err);
			var len = facilities.length;

			
			console.log('Reach %s facilities', len);
			

			async.eachLimit(facilities, 50, function(facility, done){
				
				var address = '';
				var city = '';
				var state = '';

				if(facility.address && facility.address.length > 0){
					address = facility.address;
				}

				if(facility.city && facility.city.length > 0){
					city = facility.city;
				}

				if(facility.state && facility.state.length > 0){
					state = facility.state;
				}
			
				self.eventService.modelClass.find({
					$and : [
						{ address1 :  { $regex: address, $options: 'i' } },
						{ city :  { $exists: true } },
						{ city :  { $regex: city, $options: 'i' } },
						{ stateProvinceCode :  { $exists: true } },
						{ stateProvinceCode :  { $regex: state, $options: 'i' } }
					]
				}, function(err, events){
					console.log('%s : %s', index++, len);
					if(events && events.length  > 0) {
						_.map(events, function(item){

							facilityEvent.push({
								facilityId : facility._id,
								eventId : item._id
							});
							self.facilityEventService.createBundle([{
								facilityId : facility._id,
								eventId : item._id
							}], function(err, count){
								console.log('Added');
								setTimeout(function(){ done(null); }, 10);
							})
						});
					} 
					else{
						setTimeout(function(){ done(null); }, 10);
					}
				})
			}, function(err, results){
				console.log('Total events %s', facilityEvent.length);
				
			})
		})
	},
}