var mongoose = require('mongoose'),
	TagSchema = require('../schemas/tagSchema'),
	Tag = mongoose.model('Tag', TagSchema); 

module.exports = Tag;