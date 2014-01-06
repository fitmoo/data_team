var _ = require('underscore'),
	dateUtils = require('../utils/dateUtils'),
	activeScraper = require('./active/activeScraper'),
	crossfitSraper = require('./crossfit/crossfitScraper');
	mode = 'continue',
	running = false,
	jobFinishCount = 0
	times = 0;

var interval = setInterval(

	function(){
		if (!running){
			running = true;
			jobFinishCount = 0;
			if (times != 0) 
				sleepTime = 10*60*1000;
			else 
				sleepTime = 0;

			setTimeout(function(){
				times++;
				
				if(mode == 'continue'){
					console.log('Reset activeScraper');
					activeScraper.reset();
				}

			   	activeScraper.start(mode, function(err, scraperResult){
					if (err){
						console.log('Error: ' + err);
					}
					//If active.com return errorCode show we should restart the process
					else if (scraperResult && scraperResult.responseCode && scraperResult.responseCode !== 200) {
						console.log('The active.com server returns errorCode : %s', scraperResult.responseCode);
						console.log('The ActiveScraper is taking a nap.');
						mode = 'continue';
						running = false;
					}
					//All response data have been saved
					else if (scraperResult && scraperResult.savedAll){
						console.log('Active Scrapper: Saved all %s events for %s requests', scraperResult.totalSavedRecords, scraperResult.totalSavedResponse,  dateUtils.getCurrentTime());
						jobFinishCount++;
					} 
					//All requests have been sent
					else if (scraperResult && scraperResult.sendingFinish){
						console.log('Active Scrapper: Sent %s request(s) to active.com at %s', scraperResult.sentRequests, dateUtils.getCurrentTime());
						jobFinishCount++;	
					}
					else {
						console.log('Unknow error.');
					}
				})

			}, sleepTime);
		}
		else if (jobFinishCount == 2){
			console.log('Finish');
			clearInterval(interval);
		}
	}, 10000);


/*
function scrapeActive(callback){
	if (!program.scraper) return callback();

    if (program.scraper === 'active') {
    	var mode = '';

    	if (!program.mode) {
    		console.log('Please provide running mode: continue/reset. Syntax: --mode [continue][reset]');
    	} else{
			mode = program.mode;
			activeScraper.start(mode, function(err, scraperResult){
				if (err){
					console.log('Error: ' + err);
				}
				//If active.com return errorCode show we should restart the process
				else if (scraperResult && scraperResult.responseCode && scraperResult.responseCode !== 200) {
					console.log('The active.com server return errorCode : %s', scraperResult.responseCode);
					console.log('The ActiveScraper is taking a nap then restart the scraper process!');
				}
				//All response data have been saved
				else if (scraperResult && scraperResult.sentRequests ==  scraperResult.totalRequests && scraperResult.savedAll){
					console.log('Active Scrapper: Saved all %s events for %s requests', scraperResult.totalSavedRecords, scraperResult.totalSavedResponse,  dateUtils.getCurrentTime());
				} 
				//All requests have been sent
				else if (scraperResult && scraperResult.sendingFinish){
					console.log('Active Scrapper: Sent %s request(s) to active.com at %s', scraperResult.sentRequests, dateUtils.getCurrentTime());
				}
				else {
					console.log('Unknow error.');
				}
			})
    	}
    }
    else{
        callback && callback();
    }
}*/





