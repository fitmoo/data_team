var errorObject = require('./errorResponse');

module.exports = {

	lookupService : null,

	init: function(lookupService){
		this.lookupService = lookupService;
	},

	getCountries: function(req, res){
		this.lookupService.getCountryList(function(err, countries){
			if(err) res.send(errorObject);
			else
				res.send(countries);
		});
	},

	getCountriesName: function(req, res){
		this.lookupService.getCountriesName(function(err, countries){
			if(err) res.send(errorObject);
			else
				res.send(countries);
		});
	},

	getStatesByCountryCode: function(req, res){
		countryCode = req.params['countryCode'];
		if(countryCode && countryCode != ''){
			this.lookupService.getStatesByCountryCode(countryCode, function(err, states){
				if(err) res.send(errorResponse);
				else
					res.send(states);
			})
		} else{
			res.send([]);
		}
	},

	getCountryAndStates : function(req, res){
		this.lookupService.getStatesByCountryCode(function(err, countryAndState){
				if(err) res.send(errorResponse);
				else
					res.send(countryAndState);
			})
	}
}