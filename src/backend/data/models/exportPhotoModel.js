var mongoose = require('mongoose'),
    ExportPhotoSchema = require('../schemas/exportPhotoSchema'),
    ExportPhoto = mongoose.model('ExportPhoto', ExportPhotoSchema);

module.exports = ExportPhoto;