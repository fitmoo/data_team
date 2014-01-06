var mongoose = require('mongoose'),
	CountrySchema = require('../schemas/countrySchema'),
	Country = mongoose.model('Country', CountrySchema); 

module.exports = Country;