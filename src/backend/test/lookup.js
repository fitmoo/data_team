var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api/lookup';



describe('Get Lookup data', function(){
  	var id;

  	it('Country', function(done){
	    var request = superagent.get(URI + '/countries');
	    request
	    .end(function(e,res){
	    	expect(e).to.eql(null);
	    	expect(res.body.length).above(0);
	        done();
	    });
	});


	it('State', function(done){
	    var request = superagent.get(URI + '/countries/US/states');
	    request
	    .end(function(e,res){
	    	expect(res.body.length).above(0);
	        expect(e).to.eql(null);
	        done();
	    });
	})
});