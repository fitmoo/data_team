var path = require('path'),
	request = require('request'),
	mime = require('mime'),
	fs = require('fs'),
	knox = require('knox');

var AWS = require('aws-sdk');

module.exports = {

	s3: null,
	bucketName: 'scraper-development.fitmoo.com',

	saveFile : function(fileName, tempPath, targetFolder, fn){
        targetPath = path.resolve(targetFolder, fileName);
        var is = fs.createReadStream(tempPath);
		var os = fs.createWriteStream(targetPath);

		is.pipe(os);
		is.on('end',function() {
		    fs.unlink(tempPath, fn);
		});
	},

	deleteFile : function(filePath, fn){
		fs.unlink(filePath, fn);
	},

	/*
	*	Upload file from url to S3
	*/
	uptoS3 : function(imageId, url, fn){
		var option = { url : url, method: 'GET'};
		var self = this;

		request.head(url, function(err, res, body){
    		var writeStream = fs.createWriteStream(path.resolve(__dirname, imageId));
    		writeStream.on('finish', function(){
    			fs.exists(writeStream.path, function(exits){
    				if(exits){
    					var data = fs.readFileSync(writeStream.path);
						if(!self.s3){
							configFile = path.resolve(__dirname, '../config/aws3Config.json');
							AWS.config.loadFromPath(configFile);
							self.s3 = new AWS.S3();
						}

						var params = {Bucket: self.bucketName, Key: imageId, Body: data, ACL: 'public-read', ContentType: 'image/png'};

						self.s3.putObject(params, function(err, body) {
						    if (err)
						      console.log(err);
						    fs.unlink(writeStream.path, function(){
						    	fn && fn(err);
						    })
						});
    				} else{
    					fn && fn();
    				}
    			});
    			
    		});
    		request(url).pipe(writeStream);
  		});
		
	},

	uptoS3Direct: function(url, fn){
		request({
					url: url,
					method: 'GET',
					//encoding : "hex"
				}, 
				function(err, res, body){
					var client = null;
					if(!self.s3){
						configFile = path.resolve(__dirname, '../config/aws3Config.json');
						AWS.config.loadFromPath(configFile);
						self.s3 = new AWS.S3();
						//console.log(self.s3);
						client = knox.createClient({
						    key: 'AKIAJYWA2AOOY7OH3YZQ'
						  , secret: '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'
						  , bucket: self.bucketName
						  //, region: "us-east-1"
						  
						});
					}

					var headers = {
					      'Content-Length': res.headers['content-length']
					    , 'Content-Type': res.headers['content-type']
					};


					client.putStream(res, '/' + imageId, headers, function(err, res){
						console.log(err);
						//console.log(res);
					});
					// console.log(client);
					// var buff = new Buffer(body, 'hex'),
					// len = buff.length;

					// var params = {Bucket: self.bucketName, Key: imageId, Body: body, ACL: 'public-read', ContentType: 'image/jpeg'};
					// self.s3.putObject(params, function(err, body) {
					//     if (err)
					//       console.log(err);
					//     else
					//     	console.log('Finish');
					// });
		});
	},

	/*
	*	Upload file sent from client to S3
	*/
	uptoS3LocalFile : function(imageId, filePath, fn){
		var data = fs.readFileSync(filePath);
		
		if(!this.s3){
			configFile = path.resolve(__dirname, '../config/aws3Config.json');
			AWS.config.loadFromPath(configFile);
			this.s3 = new AWS.S3();
		}

		var params = {Bucket: this.bucketName, Key: imageId, Body: data, ACL: 'public-read', ContentType: 'image/png'};

		this.s3.putObject(params, function(err, body) {
		    if (err)
		      console.log(err);
		    fs.unlink(filePath, function(){
		    	fn && fn();
		    })
		});
	},
};


