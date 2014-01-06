var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api/photos';



describe('Test photos function', function(){
  	
	var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRyYW5obmIiLCJyYW5kb20iOiJmM2JjIn0.Lk02KLNgK8HYrA_vv6akjY8h-E3lB0Siv-zmktyO_tc";//tranhnb
	var MARKDELETE = 6;

	var photos = {
		 deletedPhotos : [], 
		 latestPhoto : "",
		 firstPhoto : ""
	};
	var latestCreatedDate = null;

  	it('Get photos', function(done){
	    var request = superagent.get(URI + '?token=' + token + '&perPage=10&curentPage=0' );
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
	        done();
	    });
	});


  	it('Mark delete photo', function(done){
  		 var request = superagent.put(URI + '?token=' + token);
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
  		var request = superagent.get(URI + '?token=' + token + '&perPage=10&curentPage=0' );
	    request
	    .end(function(e,res){
	    	expect(e).to.eql(null);
	    	var len = res.body.photos.length;

	    	expect(len).to.equal(50);

	    	
	    	var count = 0;
	    	var count_CreatedDate = 0;
	    	for(var i = 0; i < len; i++){
	    		//Expect the return images don't include any photos.deletedPhotos item
	    		var temp = _.filter(photos.deletedPhotos, function(deletedPhoto){ return deletedPhoto._id === res.body.photos[i]._id});
	    		count += temp && temp.length;

	    		//Expect the return images createdDate always greater than latestCreatedDate
	    		count_CreatedDate += res.body.photos[i].createdDate <= latestCreatedDate ? 1 : 0;
	    	}
	    	expect(count).to.eql(0);
	    	expect(count_CreatedDate).to.eql(0);

	    	


	        done();
	    });
  	})
});