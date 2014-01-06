var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api';

var tags = [ 'tag1','tag2','tag3'];

describe('Test RESTFUL API', function(){
  	var id;

  	var savedTag;
	it('Create Tags', function(done){
	    var request = superagent.post(URI + '/tags/');
	    request
	    .send(tags)
	    .end(function(e,res){
	        expect(e).to.eql(null);
	        //console.log(res.body);
			expect(res.body.allTagName).not.to.eql(null);
	        expect(res.body.allTagName.length).above(0);
	        expect(res.body.createdTags).not.to.eql(null);
	        expect(res.body.createdTags.length).above(0);
	        
	        done();
	    });
	})


  	it('Get all Tags', function(done){
	    var request = superagent.get(URI + '/tags/');
	    request
	    .end(function(e,res){
	        expect(e).to.eql(null);
	        expect(res.body.allTagName).not.to.eql(null);
	        expect(res.body.allTagName.length).above(0);
	        expect(res.body.data).not.to.eql(null);
	        expect(res.body.data.length).above(0);
	        done();
	    });
	})

	it('Remove Tags', function(done){

	    var request = superagent.del(URI + '/tags/');
	    request
	    .send(['tag1'])
	    .end(function(e,res){
	        expect(e).to.eql(null);
	        var temp = res.body;
	        
	        expect(temp.removedTag.length).to.eql(1);
	        expect(temp.allTagName.length).to.eql(2);
	        done();
	    });
	})
});