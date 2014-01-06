var mongoose = require('mongoose'),
	FacilityEventSchema = require('../schemas/facilityEventSchema'),
	FacilityEvent = mongoose.model('FacilityEvent', FacilityEventSchema); 

module.exports = FacilityEvent;