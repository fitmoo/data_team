var mongoose = require('mongoose'),
	FacilitySchema = require('../schemas/facilitySchema'),
	Facility = mongoose.model('Facility', FacilitySchema); 

module.exports = Facility;