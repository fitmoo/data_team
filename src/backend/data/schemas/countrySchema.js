var mongoose = require('mongoose');

var CountrySchema = new mongoose.Schema({ 
	code2 : String,
	code3 : String,
	name : String
});

module.exports = CountrySchema;