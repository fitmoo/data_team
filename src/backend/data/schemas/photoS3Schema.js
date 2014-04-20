var mongoose = require('mongoose');

var PhotoS3Schema = new mongoose.Schema({ 
	facilityID: String,
	sourceURL: {type: String, default: ""},
	s3UploadStatus: {type: Boolean, default: false},
	errMessage: {type: String, default: ""},
    index: { type: Number, default: 0 }
});

PhotoS3Schema.set('toJSON', { getters: true });
PhotoS3Schema.set('_id', false) ;
module.exports = PhotoS3Schema;

