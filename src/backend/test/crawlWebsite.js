
var crawl = require('../scraper/facilitywebsite'),
	expect = require('expect.js');



describe('Test image dimension', function(){
  
	it('PNG File match', function(done){
		//var url = 'http://crossfitnorthburlington.ca/';
		var url = 'http://crossfitnorthburlington.ca/';
		crawl.crawlImages(url, function(pageResource){
			//pageResource : { videos: [], imageArray : [], linkArray : [], rearchedLinks : [] },
			expect(pageResource.imageArray.length).to.above(0);
			console.log('%j', pageResource.imageArray);
			done();
		})



	});

	
	

});