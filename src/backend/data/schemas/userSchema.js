var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({ 
	username : String,
	password : String,
	right: {type: Array, default: []}
});

UserSchema.set('toJSON', { getters: true });

module.exports = UserSchema;

