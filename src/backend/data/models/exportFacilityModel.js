var mongoose = require('mongoose'),
    ExportFacilitySchema = require('../schemas/exportFacilitySchema'),
    ExportFacility = mongoose.model('ExportFacility', ExportFacilitySchema); 

module.exports = ExportFacility;

