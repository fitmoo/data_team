var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI_PHOTO = 'http://localhost:3000/api/photos';
var URI = 'http://localhost:3000/api';
var user = {
	username : 'tranhnb',
	password: '12345'
};


describe('Test photos function', function(){
  	
	var token = "";
	var MARKDELETE = 6;

	var photos = {
		 deletedPhotos : [], 
		 latestPhoto : "",
		 firstPhoto : ""
	};
	var latestCreatedDate = null;

	it('Login', function(done){
	    var request = superagent.post(URI + '/login');
	    request
	    .send(user)
	    .end(function(e,res){
	    	console.log(res.body);
	        expect(e).to.eql(null);
	        expect(res.body.token.length).to.above(0);
	        token = res.body.token;
	        done();
	    });
	})

  	it('Get photos', function(done){
	    var request = superagent.get(URI_PHOTO + '?token=' + token + '&perPage=50&page=1' );
	    request
	    .end(function(e,res){
	    	expect(e).to.eql(null);
	    	expect(res.body.photos.length).above(0);
	    	expect(res.body.totalRecords).above(0);

	    	for(var i = 0; i < MARKDELETE; i++){
	    		photos.deletedPhotos.push(res.body.photos[i]._id);
	    	}
	    	photos.firstPhoto = res.body.photos[0]._id;
	    	photos.latestPhoto = res.body.photos[res.body.photos.length - 1]._id;
	    	latestCreatedDate = res.body.photos[res.body.photos.length - 1].createdDate;
	    	console.log(res.body.photos[res.body.photos.length - 1]);
	    	console.log(res.body.currentPage);
	        done();
	    });
	});

	it('Mark delete photo', function(done){
  		 var request = superagent.put(URI_PHOTO + '?token=' + token);
		 if(photos.deletedPhotos.length > 0){
			request
			.send(photos)
			.end(function(e,res){
				expect(e).to.eql(null);
		    	var deletePhotos = _.filter(res.body, function(photo){ return photo.markDelete === true });
		    	expect(deletePhotos.length).to.eql(MARKDELETE);

		        done();
		    });
  		}
  	})

	it('Get photos after markdelete', function(done){
  		var request = superagent.get(URI_PHOTO + '?token=' + token + '&perPage=50&page=2' );
	    request
	    .end(function(e,res){
	    	expect(e).to.eql(null);
	    	var len = res.body.photos.length;

	    	expect(len).to.equal(100);
	    	console.log(res.body.currentPage);
	    	console.log(res.body.photos[0]);
	        done();
	    });
  	})

  	it('Logout', function(done){
	    var request = superagent.post(URI + '/logout?token=' + token);
	    request
	    .send(user)
	    .end(function(e,res){
	        expect(e).to.eql(null);
	        expect(res.body.msg).to.eql('logout');
	        done();
	    });
	})



  	
});