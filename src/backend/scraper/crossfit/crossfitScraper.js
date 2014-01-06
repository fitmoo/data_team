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

module.exports = {
	//async cargo object to handle the insert function with specific PAY_LOAD
	cargo : null,

	//DatabaseManager instance
	db : null,

	//Start scraping map.crossfit.com
	start : function(fn){
		self = this;
		this.init(function(err){
			var tasks = [function(fn){ self.getAllFacilityGeoCodes(self.cargo, fn); }, self.getAllFacilityInfo];
			async.waterfall(tasks, function(err, result){
				fn && fn(err, result);
			});
		});
	},

	init: function(fn){
       	this.cargo = this.getCargoObject();
       	this.db = new DatabaseManager(configs);
       	this.db.init([MODEL_NAME], function(err){
			if (err) console.log(err);
			else{
				console.log('Init facility service');
			};
			fn && fn(err);
		});
	},

	getCargoObject : function(){
		if(this.cargo) return this.cargo;
		self = this;
		this.cargo = async.cargo(
			function(items, fn){ 
				self.storeFacility(self.db, items, fn); 
			}
			, CARGO_PAYLOAD);
		return this.cargo;
	},


	//Get all facility Geocode from map.crossfit.com
	getAllFacilityGeoCodes: function(cargo, callback){
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
			callback(null, cargo, facilityGeocodes);
		});

	},

	//Get facility information by Geocode
	//@cargo: Cargo object to handle saving data
	//@facilityGeocodes: Facility GeoCode object array
	//@callback: callback function
	getAllFacilityInfo: function(cargo, facilityGeocodes, callback){
		var option = {
			url: 'http://map.crossfit.com/affinfo.php?',//a=' + marker.id + '&t=0',
			method: 'GET'
		}
		
		//Organize facilityGeocodes to an array of object
		var facilities = [];
		
		for(var i = 0, len = facilityGeocodes.length; i < len; i+=3){
			facilities.push({
				facilityID : facilityGeocodes[i],
				lat : facilityGeocodes[i + 1],
				lng : facilityGeocodes[i + 2]
			})
		}

		//Send request to map.crossfit.com to get facility information.
		console.log('Start retrieve %s facility info at: %s', facilities.length, dateUtils.getCurrentTime());
		var errorFacilities = [];

		async.eachSeries(facilities,
			function(facility, callback){
				opt = _.omit(option);
				opt.qs = {a : facility.facilityID, t : 0};
				console.log('Sending request to get facility: %s', facility.facilityID);
				request(opt, function(err, response, body){
					copy = facilityParser.parseHTML(body);
					copy.facilityID = facility.facilityID;
					copy.lat = facility.lat;
					copy.lng = facility.lng;
					cargo.push(copy);
					setTimeout(function(){callback(err)}, 500);
				});
			},
			function(err){
				console.log('Finish retrieve facility info at: %s', dateUtils.getCurrentTime());
				console.log('%j', errorFacilities);
				//["45","389","402","463","582","637","652","722","834","984","1100","1193","1343","1691","1701","1709","1726","1742","1829","1932","1945","1978","1980","2014","2054","2147","2221","2300","2336","2411","2481","2576","2600","2714","2804","2868","2874","3002","3341","3639","3707","3770","3943","4131","4232","4356","4609","4713","4751","4799","4825","4859","4873","4875","4946","4978","5000","5011","5068","5191","5198","5255","5371","5427","5546","5550","5635","5663","5725","5814","5836","5841","5899","5922","5954","5975","5994","6019","6048","6066","6111","6148","6165","6171","6177","6267","6471","6522","6524","6531","6576","6600","6602","6629","6652","6668","6681","6764","6782","6813","6883","6932","6942","6961","6968","6975","6984","6989","7022","7023","7036","7037","7054","7059","7063","7069","7113","7130","7167","7178","7222","7229","7246","7257","7274","7316","7325","7337","7357","7360","7368","7410","7426","7436","7466","7483","7500","7506","7508","7556","7560","7648","7655","7671","7685","7692","7696","7744","7750","7788","7823","7825","7857","7876","7964","7970","7971","7975","7976","7979","7983","7984","8033","8046","8075","8122","8126","8153","8158","8165","8182","8223","8247","8251","8308","8341","8367","8395","8438","8479","8486","8503","8513","8543","8690","8730","8740","8748","8766","8771","8810","8821","8823","8825","8843","8851","8881","8922","8923","8926","8939","8955","8976","8983","9038","9054","9058","9064","9112","9121","9125","9142","9144","9145","9175","9187","9193","9196"]
				callback(null, facilities);
		});
	},

	//Save Facility to DB
	storeFacility : function(db, jsonDatas, async_callback){
		db.getInstance(MODEL_NAME).createBundle(jsonDatas, async_callback);
	}
}
