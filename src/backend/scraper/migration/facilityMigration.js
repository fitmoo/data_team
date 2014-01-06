var async = require('async'),
	lazy = require('lazy'),
	path = require('path'),
	_ = require('underscore'),
	fs = require('fs');

var facilityFileName =  path.resolve(__dirname, 'Fm_tbl_data.csv'),
	classFileName =  path.resolve(__dirname, 'Fm_tbl_classes.csv'),
	configs = require('../../utils/configs'),
	DatabaseManager = require('../../data/');

var db = new DatabaseManager(configs);
var services = ['Facility'];

var parserUtil = require('../../utils/parserUtil');


module.exports = {

	facilityService : null,

	migrateFacility: function(done){
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
			fn && fn(null);
		});
	},

	start : function(fn){
		var index = 0,
			readStream = fs.createReadStream(facilityFileName, { encoding : 'utf8'}),
			keys = [],
			facilityArray = [],
			self = this,
			errorFacility = 0,
			existFacility = 0,
			self = this;

		var temp = lazy(readStream)
     	.lines
     	.forEach(
     		function(line){
	     		if(index === 0){
	     			keys = self.getKeys(line);
	     		} else{
	     			var buffer = new Buffer(line);
	     			var temp = buffer.toString('utf8');
					var rawObject = self.assignValue(keys, temp);
					var facility = self.mapObjectToFitmooModel(rawObject);

					//Count error
					if(!facility || !facility.fitmooFacilityID || facility.fitmooFacilityID <= 0){
						errorFacility++;
					} else{
						facilityArray.push(facility);
					}
				}
				index++;
			}
		).on('pipe', function(){
			setTimeout(function(){
				console.log('Total error facility : %s/%s', errorFacility, index);
				if(errorFacility === 0){
					self.updateDB(facilityArray, fn);
				} else{
					fn && fn(null, facilityArray);
				}
			}, 2*1000);
		});
	},

	updateDB: function(bundle, fn){
		//TODO: upload image
		//Insert to DB
		this.facilityService.checkDupAndCreateBundle(bundle, function(err, savedFacilities){
			var result = _.countBy(savedFacilities, 
				function(facility){ 
					if (facility) return facility.exist ? 'exist' : 'new';
					else return 'empty';
			});
			console.log('Summary: %j', result);
			fn && fn(err, savedFacilities);
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

	
	/*
	* Map existing object to fitmoo data model
	* OLD model:
		'Id',
		'User_token',
		'Entry_date',
		'Facility_name',
		'City',
		'State',
		'Zip',
		'Phone',
		'Email',
		'Website_url',
		'Owners_name',
		'About_us',
		'Feature_crossfit',
		'Photo_1_url',
		'Video_1_url',
		'Photo_2_url',
		'Video_2_url',
		'Photo_3_url',
		'Video_3_url',
		'Photo_4_url',
		'Video_4_url',
		'Photo_5_url',
		'Video_5_url',
		'Address',
		'Lat',
		'Longt'
	*/
	mapObjectToFitmooModel: function(rawObject){
		var facility = Object();
		facility.fitmooFacilityID = parseInt(rawObject.Id);
		facility.facilityName = rawObject.Facility_name;
		facility.lat = rawObject.Lat && rawObject.Lat.replace(",",".");
		facility.lng = rawObject.Longt.replace(",",".");
		facility.address  = rawObject.Address;
		facility.city  = rawObject.City;
		facility.state = rawObject.State;
		facility.zip = rawObject.Zip;
		facility.country = '';
		facility.phoneNumber = rawObject.Phone;
		facility. email  = rawObject.Email;
		facility.websiteURL  = rawObject.Website_url;
		facility.aboutus  = rawObject.About_us;
		facility.ownersName = rawObject.Owners_name;
		
		facility.images = _.chain(rawObject)
					.pick('Photo_1_url','Photo_2_url','Photo_3_url','Photo_4_url','Photo_5_url')
					.values()
					.reject(function(url){ return !url || url === ''})
					.map(function(url){ return { url: url}; })
					.value();
		
		facility.video = _.chain(rawObject)
					.pick('Video_1_url','Video_2_url','Video_3_url','Video_4_url','Video_5_url')
					.values()
					.reject(function(url){ return !url || url === ''})
					.map(function(url){ return { url: url}; })
					.value();
		
	
		facility.imagesCount = facility.images.length;
		facility.videoCount = facility.video.length;;
		facility.verified = false;
		facility.migrationStatus = 0;
		facility.migrationNote = '';
		return facility;
	},
	
}

