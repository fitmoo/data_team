var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api';

var user = {
	username : 'tranhnb',
	password: '12345'
};
var dataentryUser = {
	username : 'dataentry1',
	password: 'test@123'
};

describe('Test RESTFUL API', function(){
  	var id;

  	it('Login', function(done){
	    var request = superagent.post(URI + '/login');
	    request
	    .send(dataentryUser)
	    .end(function(e,res){
	    	console.log(res.body);
	        expect(e).to.eql(null);
	        done();
	    });
	})
});