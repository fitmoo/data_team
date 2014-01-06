var mongoose = require('mongoose'),
	StateSchema = require('../schemas/stateSchema'),
	State = mongoose.model('State', StateSchema); 

module.exports = State;