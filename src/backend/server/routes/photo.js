var errorObject = require('./errorResponse');

module.exports = {
	
	photoService : null,


	init: function(photoService){
		this.photoService = photoService;
	},

	search: function(req, res){
		var token = req.query.token,
			perPage = req.query.perPage,
			currentPage = req.query.page;

		this.photoService.findPhotos(token, currentPage, perPage, function(err, result){
			if(err) res.send(errorObject);
			else{
				res.send({photos : result.photos, totalRecords: result.count, currentPage: result.currentPage});
			}
		})
	},
	
	markDelete: function(req, res){
		var token = req.query.token,
			perpage = req.query.perPage,
			photos = req.body.deletedPhotos,
			latestPhotoId = req.body.latestPhoto;
			firstPhotoId = req.body.firstPhoto;
			
		if(token && token !== ''){
			if(!photos) photos = [];
			this.photoService.markDelete(token, photos, firstPhotoId, latestPhotoId, perpage, function(err, updatedPhotos){
				if(err) res.send(errorObject);
				else{
					res.send(updatedPhotos);
				}
			})
		} else{
			res.send({});
		}
		
	}
}