var mongoose = require('mongoose'),
	PhotoSchema = require('../schemas/photoSchema'),
	Photo = mongoose.model('Photo', PhotoSchema); 

Photo.schema.path('sourceURL').validate(function (value){
	return value !== '';
}, 'Invalid sourceURL');

module.exports = Photo;