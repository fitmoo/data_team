var mongoose = require('mongoose');

var FacilityEventSchema = new mongoose.Schema({ 
	
	facilityId : String,
	eventId: String

});
FacilityEventSchema.set('toJSON', { getters: true });

module.exports = FacilityEventSchema;

