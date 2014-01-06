var mongoose = require('mongoose');

var StateSchema = new mongoose.Schema({ 
	countryCode : String,
	countryName : String,
	name : String
});

module.exports = StateSchema;