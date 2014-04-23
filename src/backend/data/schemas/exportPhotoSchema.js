var mongoose = require('mongoose');

var ExportPhotoSchema = new mongoose.Schema({

	facilityId : String,
	url: String,
	fileName: String,
    //Keep track photos3s._id
    photos3Id: String,
    index: String,
    width: {type: Number, default: 0},
    height: {type: Number, default: 0}

});
ExportPhotoSchema.set('toJSON', { getters: true });

module.exports = ExportPhotoSchema;

