var mongoose = require('mongoose'),
	EventRequestSchema = require('../schemas/eventRequestSchema'),
	EventRequest = mongoose.model('EventRequest', EventRequestSchema); 

module.exports = EventRequest;