/*
*	Test almost modules in system
*/

var expect = require('expect.js'),
	_ = require('underscore'),
	async = require('async'),
	request = require('request');

var DatabaseManager = require('../data/'),
	configs = require('../utils/configs');



describe('Crawl photo and video in a url', function(){

 //  	it('Crawl image/photo', function(done){
	//     facilityWebsite = require('../scraper/facilitywebsite');
	//     //var url = 'http://katocrossfit.com/';
	//     //var url = 'http://www.ruggedcrossfit.com/';
	//     var url = 'http://www.CrossFitGetSome365.com';

	//     facilityWebsite.crawlMedia('http://www.crossfitkindred.com/', function(err, result){
	//     	//console.log(result);
	//     	expect(result).not.to.eql(null);
	//     	expect(result.videos.length).above(0);
	//     	expect(result.imageArray.length).above(0);
	//     	done && done();
	//     });
	// })

	// it('Crawl image for webpage use key-in', function(done){
	//     facilityWebsite = require('../scraper/facilitywebsite');
	//     var url = 'http://katocrossfit.com/';

	//     facilityWebsite.crawlImages(url, function(result){
	//     	expect(result).not.to.eql(null);
	//     	expect(result.imageArray.length).above(0);
	//     	done && done();
	//     });
	// });

	// it('Crawl video for webpage use key-in', function(done){
	//     facilityWebsite = require('../scraper/facilitywebsite');
	//     var url = 'http://katocrossfit.com/what-is-crossfit/';

	//     facilityWebsite.crawlVideos(url, function(result){
	//     	expect(result).not.to.eql(null);
	//     	expect(result.videos.length).above(0);
	//     	done && done();
	//     });
	//  })

	it('Test getPartialContentSupport method', function(done){
		var imageChecker = require('../utils/imageChecker');
		imageChecker.getPartialContentSupport('http://:0/', function(err, results){
			console.log('Done');
			done();
		})
	})
});
