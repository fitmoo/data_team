var mongoose = require('mongoose');

var PhotoViewLogSchema = new mongoose.Schema({ 
	userName: String,
	latestPhotoByDate: Date,
});

PhotoViewLogSchema.set('toJSON', { getters: true });

module.exports = PhotoViewLogSchema;

