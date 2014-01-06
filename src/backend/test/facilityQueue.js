var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api';

describe('Test RESTFUL API', function(){
	//var facilityID = "52736ee55c4c8caa03000445";
	var facilityID = "52aad9929263a30a0600000b";
	var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRyYW5obmIiLCJyYW5kb20iOiI5YzUwIn0.m2hXETvoenrLiZqekPdYz1cp9Q0RFYj9pzbLz6twSPc"; //tranhnb2
	var token_2 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRyYW5obmIiLCJyYW5kb20iOiIyZDgzIn0.3ahXba3rCqDEOWFs3skpm5uWyhTtLN6-6WAbw3WaAoM";//tranhnb
	var facility = null;

	it('Check out a Facility', function(done){
	    var request = superagent.get(URI + '/facilities/checkout/' + facilityID + "?token=" + token);

	    request
	    .end(function(e,res){
	       
	        expect(e).to.eql(null);
	        console.log(res.body.checkOutBy);
	        expect(res.body._id).not.to.eql(null);
	        facility = res.body;
	        done();
	    });
	});


	// it('Check out a Facility Error', function(done){
	//     var request = superagent.get(URI + '/facilities/checkout/' + facilityID + "?token=" + token_2);

	//     request
	//     .end(function(e,res){
	       
	//         expect(e).to.eql(null);
	        
	//         console.log(res.body);
	//         expect(res.body.status).to.eql(false);
	//         facility = res.body;
	//         done();
	//     });
	// });

	it('Update Facility status to DONE', function(done){
		facility.status = 1;
		facility.queue = true;

	    var request = superagent.put(URI + '/facilities/' + facility._id+ "?token=" + token);

	    request
	    .send(facility)
	    .end(function(e,res){
	       
	        expect(e).to.eql(null);
	        expect(res.body._id).not.to.eql(null);
	        console.log(res.body);
	        expect(res.body._id).not.to.eql(facility._id);
	        done();
	    });
	})
});

