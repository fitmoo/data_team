
module.exports = {

	/*
	* Transger image from internet to Amazon S3
	*/
	transfer : function(url, fn){
		//Download from interet
		//Transfer to amazonS3
		fn(null, {url: url});
	}

}