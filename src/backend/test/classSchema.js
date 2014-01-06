var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');
 	DatabaseManager = require('../data/'),
    configs = require('../utils/configs');
var db = new DatabaseManager(configs);


describe('Test RESTFUL API', function(){
	var id;

	it('Create New Class', function(done){
		db.init(["Class"], function(){
			var classService = db.getInstance('Class');
			var classTesting = { 
		      facilityID : "2410",
		      className : 'Class Name', 
		      classDescription: 'Class Desription',
		      instructor : 'Tran Hoang',
		      times : { 
		      		monday: [{ startTime: '06:00 PM', endTime: '07:00 PM'},{ startTime: '06:00 AM', endTime: '07:00 AM'}],
		      		monday_error: [{ startTime: '1', endTime: '2'},{ startTime: '2', endTime: '3'}],
		      		tuesday: [{ startTime: '05:00 PM', endTime: '06:00 PM'},{ startTime: '05:00 AM', endTime: '06:00 AM'}],
				},
		      price : 23.5,
		      tags : ['Tag1']
		  	};

			classService.create(classTesting, function(err, savedClass){
				expect(err).to.eql(null);
				console.log(savedClass);
				done();
			});
		});
	});
});

	

