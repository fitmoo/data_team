var mongoose = require('mongoose'),
	PhotoS3Schema = require('../schemas/photoS3Schema'),
	PhotoS3 = mongoose.model('PhotoS3', PhotoS3Schema); 


module.exports = PhotoS3;