var DatabaseManager = require('../data/'),
	configs = require('../utils/configs');
	

var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');



describe('Test photo data service ', function(){
  	
	var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InRyYW5obmIiLCJyYW5kb20iOiJmM2JjIn0.Lk02KLNgK8HYrA_vv6akjY8h-E3lB0Siv-zmktyO_tc";//tranhnb



  	it('Mark delete', function(done){
		var db = new DatabaseManager(configs);
		var services = ['Photo'];

		db.init(services, function(){
			var photoService = db.getInstance("Photo");

			photoService.markDelete(token, [], '52b8097982c9a71c07000010', function(err, results){
				done();
			});
		});
	});

});