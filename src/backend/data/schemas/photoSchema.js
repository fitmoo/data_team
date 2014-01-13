var mongoose = require('mongoose');

var PhotoSchema = new mongoose.Schema({ 
	facilityID: String,
	sourceURL: {type: String, default: ""},
	s3URL: {type: String, default: ""},
	markDelete: {type: Boolean, default: false},
	//Image migrated from fitmoo facilities data set
	isFitmooData: {type: Boolean, default: false},
	createdDate: {type: Date, default: Date.now},
	debugData : {type: Boolean, default: false},
	index: {type: Number}
});

PhotoSchema.set('toJSON', { getters: true });

module.exports = PhotoSchema;

