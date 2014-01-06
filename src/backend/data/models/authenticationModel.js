var mongoose = require('mongoose'),
	authenticationSchema = require('../schemas/authenticationSchema'),
	Authentication = mongoose.model('Authentication', authenticationSchema); 

module.exports = Authentication;