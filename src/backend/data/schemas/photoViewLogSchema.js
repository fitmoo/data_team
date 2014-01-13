var mongoose = require('mongoose');

var PhotoViewLogSchema = new mongoose.Schema({ 
	userName: String,
	latestPhotoByDate: Date,
	lastPage: {type: Number, default: 0}
});

PhotoViewLogSchema.set('toJSON', { getters: true });

module.exports = PhotoViewLogSchema;

