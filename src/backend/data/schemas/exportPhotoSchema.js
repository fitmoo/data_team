var mongoose = require('mongoose');

var ExportPhotoSchema = new mongoose.Schema({

	facilityId : String,
	url: String,
	fileName: String

});
ExportPhotoSchema.set('toJSON', { getters: true });

module.exports = ExportPhotoSchema;

