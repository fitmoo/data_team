var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api';
var user = {
	username : 'tranhnb',
	password: '12345'
};

var user1 = {
	username : 'tranhnb1',
	password: '12345'
};

describe('Test RESTFUL API', function(){
	var facilityID = "52cbbadf7fac946d04000801";
	var facility = null;
	var token = "";
	var token2 = "";

	it('Login 1', function(done){
	    var request = superagent.post(URI + '/login');
	    request
	    .send(user)
	    .end(function(e,res){
	        expect(e).to.eql(null);
	        expect(res.body.token.length).to.above(0);
	        token = res.body.token;
	        done();
	    });
	})

	it('Login 2', function(done){
	    var request = superagent.post(URI + '/login');
	    request
	    .send(user1)
	    .end(function(e,res){
	        expect(e).to.eql(null);
	        expect(res.body.token.length).to.above(0);
	        token2 = res.body.token;
	        done();
	    });
	})

	it('Login', function(done){
	    var request = superagent.post(URI + '/login');
	    request
	    .send(user)
	    .end(function(e,res){
	        expect(e).to.eql(null);
	        expect(res.body.token.length).to.above(0);
	        token = res.body.token;
	        done();
	    });
	})

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


	it('Check out a Facility Error', function(done){
	    var request = superagent.get(URI + '/facilities/checkout/' + facilityID + "?token=" + token2);

	    request
	    .end(function(e,res){
	       
	        expect(e).to.eql(null);
	        
	        console.log(res.body);
	        expect(res.body.status).to.eql(false);
	        facility = res.body;
	        done();
	    });
	});

	it('Undo checkout a Facility', function(done){
	    var request = superagent.get(URI + '/facilities/undoCheckOut/' + facilityID + "?token=" + token);

	    request
	    .end(function(e,res){
	        expect(e).to.eql(null);
	        console.log(res.body);
	        expect(res.body.status).to.eql(true);
	        done();
	    });
	});

	// it('Update Facility status to DONE', function(done){
	// 	facility.status = 1;
	// 	facility.queue = true;

	//     var request = superagent.put(URI + '/facilities/' + facility._id+ "?token=" + token);

	//     request
	//     .send(facility)
	//     .end(function(e,res){
	       
	//         expect(e).to.eql(null);
	//         expect(res.body._id).not.to.eql(null);
	//         console.log(res.body);
	//         expect(res.body._id).not.to.eql(facility._id);
	//         done();
	//     });
	// })
});

