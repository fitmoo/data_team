var mongoose = require('mongoose');

//Restore criteria request to send to active.com
var EventRequestSchema = new mongoose.Schema({ 
	url: String,
	method: String,
	headers: {Accept: String},
	qs: {query: String, per_page: Number, current_page : Number, api_key: String},
	finished: Boolean,
	total_event: Number
});

module.exports = EventRequestSchema;