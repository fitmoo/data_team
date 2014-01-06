var mongoose = require('mongoose'),
	EventSchema = require('../schemas/eventSchema'),
	Event = mongoose.model('Event', EventSchema); 

module.exports = Event;