var mongoose = require('mongoose');

var AuthenticationSchema = new mongoose.Schema({ 
	username: String,
	token : String,
	lastLogin: Date
});

AuthenticationSchema.set('toJSON', { getters: true });

module.exports = AuthenticationSchema;

