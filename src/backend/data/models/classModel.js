var mongoose = require('mongoose'),
	ClassSchema = require('../schemas/classSchema'),
	Class = mongoose.model('Class', ClassSchema); 

module.exports = Class;