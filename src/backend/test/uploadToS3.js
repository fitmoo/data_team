
var uploadFiles = require('../utils/uploadFiles.js'),
	expect = require('expect.js');



describe('Test image dimension', function(){
  


	it('JPG File2', function(done){
		var url = 'https://pbs.twimg.com/profile_images/3049805157/f13c622855bcf30f51fe3ca84ba08fc6_bigger.jpeg';
		var imageId = 'fitmootestId';
		uploadFiles.uptoS3(imageId, url, function(result){
			done();
		})
	});

});