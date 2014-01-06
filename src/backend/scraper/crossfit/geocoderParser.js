var _ = require('underscore');

module.exports = {

	countryFilter :  ["country","political"],
	streetAddressType : ["street_address"],
	postalCodeFilter : ["postal_code"],
	postalCodeFilter_2 : ["postal_code_prefix", "postal_code"],
	routeFilter : ["route"],
	countryFilter_2: 'country',

	parse : function(results){
		var returnObject = {zip : '', country : ''},
			self = this;
		
		var components = [];

		components = _.filter(results, function(item){
							return  (item.types.length === 1 && _.difference(item.types, self.routeFilter).length === 0) ||
									(item.types.length === 1 && _.difference(item.types, self.streetAddressType).length === 0) ||
									(item.types.length === 1 && _.difference(item.types, self.postalCodeFilter).length === 0)
		});

		for(var i = 0; i < components.length; i++){
			//Get country
			if (!returnObject.country || returnObject.country == ''){
				var countries = _.filter(components[i].address_components, function(item){
					return item.types.length > 0 && item.types.length === self.countryFilter.length && _.difference(item.types, self.countryFilter).length === 0;
				});

				if(countries.length == 1) returnObject.country = countries[0].short_name;
			}
			
			//Get postalCode
			if (!returnObject.zip || returnObject.zip == ''){

				var postalCodes = _.filter(components[i].address_components, function(item){
					return item.types.length > 0 && item.types.length === self.postalCodeFilter.length && _.difference(item.types, self.postalCodeFilter).length === 0;
				});

				if (!postalCodes || postalCodes.length == 0){
					postalCodes = _.filter(components[0].address_components, function(item){
						return item.types.length == 2 && _.difference(item.types, self.postalCodeFilter_2).length === 0;
					});
				}

				if(postalCodes.length == 1) returnObject.zip = postalCodes[0].short_name;
			}
		}
		return returnObject;
	},


}
	
	
	