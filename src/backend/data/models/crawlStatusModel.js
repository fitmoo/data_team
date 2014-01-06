var mongoose = require('mongoose'),
	CrawlStatusSchema = require('../schemas/crawlStatusSchema'),
	CrawlStatus = mongoose.model('CrawlStatus', CrawlStatusSchema); 

module.exports = CrawlStatus;