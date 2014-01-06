var mongoose = require('mongoose'),
	photoViewLogSchema = require('../schemas/photoViewLogSchema'),
	PhotoViewLog = mongoose.model('PhotoViewLog', photoViewLogSchema); 

module.exports = PhotoViewLog;