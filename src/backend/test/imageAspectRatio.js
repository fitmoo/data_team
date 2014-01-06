
var imageChecker = require('../utils/imageChecker.js'),
	expect = require('expect.js');


/*imageChecker.getDimension('http://www.google.com/intl/en_ALL/images/logo.gif', function(err, result){
  console.log(result);
})*/


describe('Test image dimension', function(){
  
/*	it('PNG File match', function(done){
		var url = 'http://upload.wikimedia.org/wikipedia/commons/5/5e/BH_LMC.png';
		imageChecker.getDimension(url, function(result){
			expect(err).to.eql(null);
	    	expect(result.status).to.eql(true);
	    	expect(result.url).to.eql(url);
			done();
		})
	});

	it('PNG File doesnt match', function(done){
		var url = 'http://impact.byu.edu/style/wide_banner6.gif';
		imageChecker.getDimension(url, function(result){
			expect(err).to.eql(null);
	    	expect(result.status).to.eql(false);
	    	expect(result.url).to.eql("");
			done();
		})
	});

	it('GIF File', function(done){
		var url = 'http://images2.layoutsparks.com/1/111658/white-tigers-nature-water.gif';
		imageChecker.getDimension(url, function(result){
			expect(err).to.eql(null);
	    	expect(result.status).to.eql(true);
	    	expect(result.url).to.eql(url);
			done();
		})
	});

	it('JPG File', function(done){
		var url = 'http://www.crossfitfountainhills.com/wp-content/uploads/2013/12/photo6-300x225.jpg';
		imageChecker.getDimension(url, function(result){
			expect(err).to.eql(null);
	    	expect(result.status).to.eql(true);
	    	expect(result.url).to.eql(url);
			done();
		})
	});*/

	// it('JPG File2', function(done){
	// 	var url = 'https://pbs.twimg.com/profile_images/3049805157/f13c622855bcf30f51fe3ca84ba08fc6_bigger.jpeg';
	// 	imageChecker.getDimension(url, function(result){
	//     	expect(result.status).to.eql(false);
	//     	expect(result.url).to.eql("");
	// 		done();
	// 	})
	// });
	
	it('JPG File2', function(done){
		var url = 'http://crossfitroute1.com/images/intrinsichealth.bmp';
		imageChecker.getDimension(url, function(result){
			console.log(result);
	    	expect(result.status).to.eql(false);
	    	expect(result.url).to.eql("");
			done();
		})
	});

	it('JPG File3', function(done){
		var url = 'http://www.ruggedcrossfit.com/images/content/rotator/Mission.jpg';
		imageChecker.getDimension(url, function(result){
			console.log(result);
	    	expect(result.status).to.eql(false);
	    	expect(result.url).to.eql("");
			done();
		})
	});
	
	//
	

});