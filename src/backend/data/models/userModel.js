var mongoose = require('mongoose'),
	userSchema = require('../schemas/userSchema'),
	User = mongoose.model('User', userSchema); 

module.exports = User;