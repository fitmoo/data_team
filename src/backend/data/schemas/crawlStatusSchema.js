var mongoose = require('mongoose');

var CrawlStatusSchema = new mongoose.Schema({ 
	//Web page crawling
	source : String,
	processID: Number,
	startDate: Date,
	endDate: Date,
	totalRequests: Number,
	sentRequests: Number,
	status: { type: String, enum : ["Running", "Finish"]},
	errorMessage: String
});

module.exports = CrawlStatusSchema;