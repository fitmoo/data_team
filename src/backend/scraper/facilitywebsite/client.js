var spawn = require('child_process').spawn,
	_ = require('underscore');

var dateUtils = require('../../utils/dateUtils');

var pageResource = { imageArray : [], linkArray : [], rearchedLinks : [] };

function crawl(host, url){

	crawler = spawn('phantomjs', ['siteCrawler.js', host, url]);

	crawler.stdout.setEncoding('utf8');
	crawler.stdout.on('data', function(data) {
		page = JSON.parse(data);
		pageResource.imageArray = _.union(pageResource.imageArray, page.images);
		pageResource.linkArray = _.union(pageResource.linkArray, page.linkArray);
	});

	crawler.stdout.on('end', function() {
		pageResource.rearchedLinks.push(url);
		pageResource.linkArray = removeItems(pageResource.linkArray, pageResource.rearchedLinks);
		
		if (pageResource.linkArray.length > 0){
			crawler = null;
			console.log('Continue to reach ' + pageResource.linkArray[0]);
			crawl(host, pageResource.linkArray[0]);
		}
		else {
			//Procedure the images
			console.log('Finish at ' + dateUtils.getCurrentTime());
			console.log('rearchedLinks : ' + pageResource.rearchedLinks.length);
			console.log('images found : ' + pageResource.imageArray.length);
			console.log(pageResource.imageArray);

			
		}
	});
}

function removeItems(sourceArray, reachedArray){
	return _.filter(sourceArray, function(link){
		return !_.contains(reachedArray, link);
	})
}


crawl('http://katocrossfit.com', 'http://katocrossfit.com');



