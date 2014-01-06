var mongoose = require('mongoose');

var TagSchema = new mongoose.Schema({ 
	type : {type: String, default: 'tags'},
	name : String
});

TagSchema.set('toJSON', { getters: true });

module.exports = TagSchema;

