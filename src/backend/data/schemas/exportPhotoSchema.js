var mongoose = require('mongoose');

var ExportPhotoSchema = new mongoose.Schema({

	facilityId : String,
	url: String,
	fileName: String,
    //Keep track photos3s._id
    photos3Id: String,
    index: String

});
ExportPhotoSchema.set('toJSON', { getters: true });

module.exports = ExportPhotoSchema;

