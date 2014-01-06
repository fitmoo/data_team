var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api';



describe('Test RESTFUL API', function(){
  	var id;


  	it('Export data', function(done){
	    var request = superagent.get(URI + '/exports/');
	    request
	    .end(function(e,res){
	    	console.log(res.body);
	        expect(e).to.eql(null);
	        done();
	    });
	})
});