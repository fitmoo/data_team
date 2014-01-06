var AWS = require('aws-sdk'),
	path = require('path'),
	async = require('async'),
	_ = require('underscore'),
	configFile = path.resolve(__dirname, '../config/aws3Config.json');

AWS.config.loadFromPath(configFile);

var s3 = new AWS.S3();
var _idHeader = '1373e894ad16347efe01';
var images = _.range(1000);



async.eachSeries(images
	, function(index, done){
		var _id = pad((index + 1).toString(), 4) + _idHeader;
			console.log(index + 1);		
			var params = {Bucket: 'scraper-development.fitmoo.com', Key: _id};
			
			s3.deleteObject(params, function(err, data) {
				if (err)
				  console.log(err);
				else{
					console.log(data);
				}
				done && done();
			});
		
	}
	, function(err){

})



function pad (str, max) {
  return str.length < max ? pad("0" + str, max) : str;
}