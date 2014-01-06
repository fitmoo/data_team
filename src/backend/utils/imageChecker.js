var imagesize = require('imagesize'),
	request = require('request'),
	http = require('http'),
	configs = require('./configs'),
	async = require('async');

var imageChecker = {

	/*
	*	PNG FORMAT METADATA
			
			Byte 	00 	01 	02 	03 	04 	05 	06 	07 	08 	09 	0A 	0B 	0C 	0D 	0E 	0F
			hex 	89 	50 	4E 	47 	0D 	0A 	1A 	0A 	00 	00 	00 	0D 	49 	48 	44 	52
			-> All PNG files start with the 8 byte hex sequence: 0x89504E470D0A1A0A -> (0×89, ‘P’, ‘N’, ‘G’, 13, 10, 26, 10)

			Byte 	10 	11 	12 	13 	14 	15 	16 	17 	18 	19 	1A 	1B 	1C
			hex 	00 	00 	00 	3F 	00 	00 	00 	21 	08 	06 	00 	00 	00
			-> WIDTH: Byte 10 - 13, HEIGHT: Byte 14 - 17

	*	GIF FORMAT
			
			Byte 	00 	01 	02 	03 	04 	05 	06 	07 	08 	09
			hex 	47 	49 	46 	38 	39 	61 	12 	00 	12 	00
			->	All GIF files begin with either ‘GIF89a’ or ‘GIF87a’ (0×474946383961 or 0×474946383761). 
			WIDTH: Bytes : 4-5, HEIGHT: Bytes : 5-6,
	*	JPEG Format (http://en.wikipedia.org/wiki/Jpeg#Syntax_and_structure)
			START WITH:	0xFFD8
	*/

	PNG_HEX_HEADER : "89504E470D0A1A0A",
	GIF_HEX_HEADER_1 : "474946383961",
	GIF_HEX_HEADER_2 : "474946383761",
	JPG_HEX_HEADER : "FFD8",

	aspectRatio : null,

	init: function(){

		this.aspectRatio = configs.get('aspectRatio') || {
	        width : 150,
	        height : 150,
	        minRatio: 0.5,
	        maxRatio: 4,
	        maxRequests: 1,
	        timeout: 20000 //20 secs
		}
	},

	check: function(url, fn){
		var self = this;

		imagesize(request.get({url : url, timeout: self.aspectRatio.timeout}), function (err, result) {
			if (!err) {
				var ratio = result.width/result.height;

				if(result.width >= self.aspectRatio.width
					&& result.height >= self.aspectRatio.height
					&& ratio >= self.aspectRatio.minRatio
					&& ratio <= self.aspectRatio.maxRatio
					)
				{
					fn(null, true);
				}
				else
					fn(null, false);	
			}
			else
		    	fn && fn(err);
		});
	},

	validateAspectRatio: function(url, dimension, fn){
		
		if(!dimension || !dimension.width || !dimension.height){
			fn && fn({status: false, url : ""});
		} else{
			var ratio = dimension.width/dimension.height;

			if(dimension.width >= this.aspectRatio.width
				&& dimension.height >= this.aspectRatio.height
				&& ratio >= this.aspectRatio.minRatio
				&& ratio <= this.aspectRatio.maxRatio
			){
				//console.log('url: %s, dimension: %j', url , dimension);
				fn && fn({status: true, url : url});
			}
			else{
				//console.log('url: %s, dimension: %j', url , dimension);
				fn && fn({status: false, url : ""});
			}
				
		}
	},
	
	/*
	*	Check the server support Partial Content and Range Request, and url is an image
	*/
	getPartialContentSupport: function(url, fn){
		try{
			request({
				url: url,
				method: 'HEAD',
				followRedirect: false,
				timeout : this.aspectRatio.timeout
			}, function(err, res, body){
				//http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.12
				//The only range unit defined by HTTP/1.1 is "bytes". HTTP/1.1 implementations MAY ignore ranges specified using other units. 
				//Content-type = 'image/png'
				var isImage = res && res.headers["content-type"] && res.headers["content-type"].indexOf('image') >= 0;
				var partialContentSupport = res && res.headers["accept-ranges"] === 'bytes';

				fn && fn(null, {partialContentSupport : partialContentSupport, isImage: isImage});
			})
		} catch(exception){
			console.log('exception getPartialContentSupport: %s' + exception);
			fn && fn(null, {partialContentSupport : false, isImage: false});
		}
	},

	/*
	*	Get Image demension by downloading a part of image if could
	*/
	getDimension: function(url, fn){
		var self = this;

		try{
			if(url === 'https://myspace.com/'){
				console.log('Ak');
			}

			this.getPartialContentSupport(url, function(err, result){
				if(url === 'https://myspace.com/'){
					console.log('getPartialContentSupport: %j', result);
				}

				if(err || !result){
					fn && fn(err, {status: false, url : ""});
				} 
				//Support range then start download 24 bytes (png and gif)
				else if (result.isImage && result.partialContentSupport){
					self.downloadImagePart(url, 0, 24, function(err, hexString){

						if(err || !hexString || hexString === ""){
							fn && fn(err, {status: false, url : ""});
						} else{
							var imageType = self.getImageType(hexString);
							var dimension = null;

							//If image is GIF/PNG Format then read width and height
							if(imageType === 'PNG' || imageType === 'GIF'){
								dimension = self.parseDimensionFromHex(imageType, hexString);
								
								//Check image match aspect ratio
								self.validateAspectRatio(url, dimension, fn);
							} else if(imageType === 'JPEG'){
								//By pass the first 2 bytes: 0XFFD8
								self.getDimensionJPEG(url, 2, 256, 0, "", function(dimension){
									if(!dimension.width || !dimension.height){
										imagesize(request.get( {url:url, timeout: self.aspectRatio.timeout}), function (err, result) {
											//Check image match aspect ratio
											self.validateAspectRatio(url, result, fn);
										});
									} else{
										//Check image match aspect ratio
										self.validateAspectRatio(url, dimension, fn);
									}
								});
							} else{
								imagesize(request.get({url:url, timeout: self.aspectRatio.timeout}), function (err, result) {
									//Check image match aspect ratio
									self.validateAspectRatio(url, result, fn);
								});
							}
						}

					});
				//Otherwise download the full data to determine dimension
				} else if (result.isImage && !result.partialContentSupport){

					imagesize(request.get({url:url, timeout: self.aspectRatio.timeout}), function (err, result) {
						//Check image match aspect ratio
						self.validateAspectRatio(url, result, fn);
					});
				} else{
					fn && fn(err, {status: false, url : ""});
				}
			})
		} catch(exception){
			console.log('Exception : %j, url: %s', exception, url);
			fn && fn(err, {status: false, url : ""});
		}
	},


	/*
	*	Check hex data to determine image type
	*	PNG Header start by 8 bytes: 0x89504E470D0A1A0A
	*/
	getImageType: function(hexStr){
		if(hexStr.length >= 16){
			var gifHeader = hexStr.substring(0, 12);
			var jpegHeader = hexStr.substring(0, 4);
			//PNG
			if(hexStr.substring(0, 16).toUpperCase() === this.PNG_HEX_HEADER){
				return "PNG";
			}
			//GIF
			else if(gifHeader === this.GIF_HEX_HEADER_1 || gifHeader === this.GIF_HEX_HEADER_2){
				return "GIF";
			}
			else if(jpegHeader.toUpperCase() === this.JPG_HEX_HEADER){
				return "JPEG";
			}
			//Undefined
			else {
				return "Undefined";
			}

		} else{
			return "Undefined";
		}
	},

	/*
	*	Get dimension for PNG, GIF file
	*/
	parseDimensionFromHex: function(imageType, hexStr){
		var dimension = {
				width : null,
				height : null,
			};

		switch(imageType){
			case "PNG":
				if(hexStr.length >= 48){
					dimension.width = parseInt(hexStr.substring(32, 40), 16);
					dimension.height = parseInt(hexStr.substring(40, 48), 16);
				}
				break;
			case "GIF":
				if(hexStr.length >= 20){
					dimension.width = this.parseLittleEndian(hexStr.substring(12, 16));
					dimension.height = this.parseLittleEndian(hexStr.substring(16, 20));
				}
				break;			
		}
		return dimension;
	},

	SOFMakerArray: [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb , 0xcd, 0xce, 0xcf],
	/*
	*	Get dimension for JPEG file
	*	url: Image URL
	*	startByte-endByte: Byte range to retrieve from URL
	*	totalRequest: Total requests sent to server. If the totalRequest exceed the maxium request then stop this procedure.
	*	lastByteStr: the last hex image data
	*	fn: callback function
	*/
	getDimensionJPEG: function(url, startByte, endByte, totalRequest, lastByteStr, fn){
		var dimension = {
					width : null,
					height : null,
				},
				blockSize = 1024,
				self = this;

		if(totalRequest <= this.aspectRatio.maxRequests){
				this.downloadImagePart(url, startByte, endByte, function(err, hexString){

					try{
						//If error occurred then try download the entrie pics
						if(err){
							console.log('Error messsage: %s', err);
							console.log(' startByte: %s, endByte: %s', startByte, endByte);
						}

						if(!lastByteStr) lastByteStr = '';
						if(!hexString) hexString = '';

						hexString =  lastByteStr + hexString;
						lastByteStr = "";

						if(hexString && hexString.length > 0){
							//console.log('hexString: %s', hexString);
							//console.log(hexString.length);
							var buff = new Buffer(hexString, 'hex'),
								len = hexString.length;
							
							//search for the next marker, read the marker type byte,
							for(var i = 0, len = buff.length; i < len; i++){
								if(buff[i] === 0xFF && self.SOFMakerArray.indexOf(buff[i+1]) >= 0){
									if(i + 9 < len){
										var size_data = buff.slice(i + 2, i + 9).toString('hex');
										
										dimension.height = parseInt(size_data.substring(6, 10), 16);
										dimension.width = parseInt(size_data.substring(10, 14), 16);

										return fn && fn(dimension);
									} else{
										//Save the data to append in the next sequence.
										lastByteStr = buff.slice(i, len).toString('hex');
									}
									break;

								} 
								//If the last byte = 0XFF then keep this value to append in the next sequence.
								else if (buff[i] === 0xFF && i === len -1){
									lastByteStr = "FF";
								}
							}

							if(dimension.width && dimension.height){
								return fn && fn(dimension);
							} else{
								startByte = endByte + 1;
								endByte = startByte + blockSize - 1;
								buff = null;

								totalRequest++;
								self.getDimensionJPEG(url, startByte, endByte, totalRequest, lastByteStr, fn);
							}
						} else{
							return fn && fn(dimension);
						}
					} catch(err){
						console.log('err %s, url: %s, hexString: %s', err, url, hexString);
						return fn && fn(dimension);
					}
				});	
			
		} else{
			return fn && fn(dimension);
		}
	},

	/*
	*	Download a part of image
	*/
	downloadImagePart: function(url, byteStart, byteEnd, fn){
		var byteStart = byteStart || 0,
			byteEnd = byteEnd || 32;


		try{
			request({
					url: url,
					method: 'GET',
					headers: {
						'Range' : "bytes=" + byteStart + "-" + byteEnd
					},
					followRedirect: false,
					timeout : 30*1000,
					encoding : "hex"
				}, 
				function(err, res, body){
					if(err){
						console.log('Error at downloadImagePart: %s', err);
						//try to download the full entrie image
						try{
							request({ 
									url : url,
									followRedirect: false,
									timeout : 30*1000,
									encoding : "hex"
								}, 
								function(err, res, body){
									fn && fn(err, body);
							});
						} catch(err){
							fn && fn(err, '');
						}
					}
					else
						fn && fn(err, body);
			});
		} catch(err){
			fn && fn(err, '');
		}
	},

	/*
	*	Convert litte Endian to decimal
	*/
	parseLittleEndian: function(hex) {
	    var result = 0;
	    var pow = 0;
	    while (hex.length > 0) {
	        result += parseInt(hex.substring(0, 2), 16) * Math.pow(2, pow);
	        hex = hex.substring(2, hex.length);
	        pow += 8;
	    }
	    return result;
	},
}

imageChecker.init();
module.exports = imageChecker;



		