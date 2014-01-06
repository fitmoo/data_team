var request = require('request'),
	url = "http://dummyimage.com/600x400/000/fff&text=",
	async = require('async'),
	fs = require('fs'),
	path = require('path'),
	DatabaseManager = require('../data/'),
	configs = require('../utils/configs'),
	_ = require('underscore');
	

var images = _.range(1000);
console.log(images.length);
var db = new DatabaseManager(configs);
var services = ['Photo'];

db.init(services, function(){
	var photoService = db.getInstance(services[0]);
	var serverImagePath = '';
	if(configs.get('database:mongodb:connectionString').indexOf('127.0.0.1') >= 0){
		serverImagePath = 'http://localhost:3000/';
	} else{
		serverImagePath = 'http://54.221.228.118/files/';
	}
	async.eachSeries(images, function(index, done){
		var requestURL = url + (index + 1);

		request.head(requestURL, function(err, res, body){
			var writeStream = fs.createWriteStream(path.resolve(__dirname, '../server/exports/', index + 1 + '.png'));
			var _idHeader = '1373e894ad16347efe01';

			writeStream.on('finish', function(){
				fs.exists(writeStream.path, function(exits){
					if(exits){
						//Save test image to DB
						var _id = pad((index + 1).toString(), 4) + _idHeader;
						console.log(_id);
						photoService.create({
							_id : _id,
							facilityID : "52736f285c4c8caa03000484",
							sourceURL :  serverImagePath + (index + 1 + '.png'),
							markDelete : false,

						}, function(err, photo){
							console.log('Generate image number: %s', index + 1);
							setTimeout(function(){done && done()}, 1000);
						})
					} else{
						done && done();
					}
				});
			});
			request(requestURL).pipe(writeStream);
		});
	}, function(err){
		console.log('Finish');
	});
});

function pad (str, max) {
  return str.length < max ? pad("0" + str, max) : str;
}