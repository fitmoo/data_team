var async = require('async'),
	path = require('path'),
	errorObject = require('./errorResponse'),
	spawn = require('child_process').spawn;

module.exports = {
	
	crawlStatusService : null,

	init: function(crawlStatusService){
		this.crawlStatusService = crawlStatusService;
	},

	startCrawlActive : function(req, res){
		//Check is there process running
		var self = this;

		this.crawlStatusService.isCrawlRunning("active.com", function(err, crawlStatus){
			if(err) res.send(errorObject);
			else if(crawlStatus)
				res.send({status: false, msg: "Another process is running"});
			else{
				var commandPath = path.resolve(__dirname, '../../bin/command');

				//Create new crawlStatus
				self.crawlStatusService.startCrawlActive(function(err, crawlStatus){
					if(err) res.send({status: "Error", msg: err});
					else{
						crawler = spawn(commandPath, ["--scraper", "active", "--mode",  "reset", "--crawlStatusID", crawlStatus._id]);
						
						crawler.stdout.setEncoding('utf8');
						crawler.stderr.setEncoding('utf8');

						crawler.stderr.on('data', function(data){
							console.log(data);
						})

						crawler.stdout.on('data', function(data){
							console.log(data);
						})
						res.send({status: true});
					}
				})
			}
		})
	},

	checkStatus: function(req, res){
		this.crawlStatusService.getLatestCrawl("active.com", function(err, crawlStatus){
			if(err) res.send(errorObject);
			else
				res.send(crawlStatus);
		});
	}
}

