var path = require('path'),
	async = require('async'),
	_ = require('underscore'),
	mongoose = require('mongoose');
	
var uploadFile = require('../../utils/uploadFiles.js'),
	errorObject = require('./errorResponse'),
	facilitywebsite = require('../../scraper/facilitywebsite'),
	parseUtils = require('../../utils/parserUtil.js'),
	configs = require('../../utils/configs');
	imageChecker = require('../../utils/imageChecker.js');


module.exports = {

	facilityService : null,
	classService : null,
	tagService : null,
	DONESTATUS: 2,
	FINISHLATER: 1,

	init : function(facilityService, classService, tagService){
		this.facilityService = facilityService;
		this.classService = classService;
		this.tagService = tagService;
		this.uploadFolder = path.resolve(__dirname, '../uploadFiles/images-upload/');
	},

	imageLink : function(url){
		return uploadFile.getS3HostName() + '/' + url;
	},


	search : function(req, res){
		var search = req.query.search || '';
		regex = { $regex: search, $options: 'i' };
		var sortObj = req.query.sort && JSON.parse(req.query.sort);
		var sortOrder;
		var sortColumn = null;

		if (sortObj){
			if (sortObj.orderBy === 'asc')
				sortOrder = 1;
			else if (sortObj.orderBy === 'desc')
				sortOrder = -1;
			else
				sortOrder = null;
			sortColumn = sortObj.columnName;
		};

		var sort = {};
		if (sortOrder && sortColumn)
			sort[sortColumn] = sortOrder;

		var media = req.query.media;
		var opt = {};
		
		if (media != 0 || media == ''){
			search = { $or : [ { facilityName : regex}, { city : regex}, { state : regex} ] };
		}
		else{
			search = { $and : [
							{ $or : [ { facilityName : regex}, { city : regex}, { state : regex} ] },
							{
								$and : [
									{
										$or : [ { images : {$exists : false} } , { images : { $size : 0}} ]
									},
									{
										$or : [ {video : {$exists : false} } , { video : { $size : 0} } ]
									}
								]
							}
						]
					};
		}

		//console.log(search);
		var opt = {
			paginate : { page : req.query.currentPage && req.query.currentPage > 0 ? req.query.currentPage - 1 : 0, limit : req.query.perPage || 50 },
			sort : sort,
			search : search
		}
		//console.log(opt);
		var self = this;
		this.facilityService.find(opt, function(err, facilities, count){
			var returnFacilities = [];
			async.mapSeries(facilities,
				function(facility, done){
					//Generate facility images URL:
					_.map(facility.images, function(item){
						item.facilityId = facility.id;
					});

					//Get classes
					self.classService.getClassesByFacilityID(facility.id, function(err, classes){
						var temp = facility.toJSON();
						temp.classes = classes;
						returnFacilities.push(temp);
						done();
					});

				},
				function(err, result){
					if (err) res.send(errorObject);
					else
						res.send({facilities : returnFacilities, totalRecords: count});	
				}
			)
		});
	},
	/*
	*	List out duplicate facilities for testing purpose
	*/
	listDuplicate: function(req, res){
		this.facilityService.listDuplicateFacility(function(err, results){
			res.render('duplicateFacilities', results);
		})
	},

	getQueue: function(req, res){
		var page = req.query.currentPage && req.query.currentPage > 0 ? req.query.currentPage - 1 : 0
		var perPage = req.query.perPage || 50;
		var self = this;
		var token = req.query.token;

		//undo checkout facility in queue for the current user
		this.facilityService.undoCheckOutByUserName(token, function(err){
			self.facilityService.getQueue(perPage, page, function(err, facilities, count){
				var returnFacilities = [];

				async.mapSeries(facilities,
					function(facility, done){
						//Get classes
						self.classService.getClassesByFacilityID(facility.id, function(err, classes){
							var temp = facility.toJSON();
							temp.classes = classes;
							returnFacilities.push(temp);
							done();
						});
					},
					function(err, result){
						if (err) res.send(errorObject);
						else
							res.send({facilities : returnFacilities, totalRecords: count});	
					}
				)
			});
		})
		
	},

	checkOut: function(req, res){
		var facilityID = req.params.id;
		var token = req.query.token;
		var self = this;

		this.facilityService.checkOut(token, facilityID, function(err, checkoutInfo){
			if(err) res.send({status: false, msg: err});
			else if (checkoutInfo && checkoutInfo.checkOutBy){
				res.send({status: false, msg: "Checked out by: " + checkoutInfo.checkOutBy});
			}
			else{
				console.log(checkoutInfo);
				self.findById(req, res);
			}
		})
	},

	undoCheckOut: function(req, res){
		var facilityID = req.params.id,
			token = req.query.token;

		this.facilityService.undoCheckOut(token, facilityID, function(err, checkoutInfo){
			if(err) res.send({status: false, msg: err});
			else{
				res.send({status: true, msg: "Undo checkout"});
			}
		})
	},
	//Count facilities don't have photo/video
	facilityNeedUpdateMedia: function(req, res){
		var opt = { $or : [ {images : {$exists : false} } , { images : { $size : 0}} , {video : {$exists : false} } , { video : { $size : 0} } ]};
		this.facilityService.countTotalByCondition(opt, function(err, count){
			if (err) res.send(errorObject);
			else res.send({count : count});
		})
	},

	findById : function(req, res){
		id = req.params['id'];
		self = this;
		this.facilityService.findByID(req.params['id'], function(err, facility, count){
			if (err) res.send(errorObject);
			else if (facility){

				//Format phonenumber
				facility.phoneNumber =  parseUtils.parsePhoneNumber(facility.phoneNumber);

				//Add facilityId to each image
				if (!facility.images) facility.images = [];

				async.mapSeries(facility.images, function(item, done){
					item.facilityId = id;
					done(null);
				}, function(err, result){
					self.classService.getClassesByFacilityID(id, function(err, classes){
						if (err) res.send(errorObject);
						else{
							var returnFacility = facility.toJSON();
							returnFacility.classes = classes;

							//Customize video array to display by backbone at client side
							var i = 0;
							_.map(returnFacility.video, function(item){
								item.facilityId = returnFacility.id;
								i++;
							})

							res.send(returnFacility);
						}
					});	
				});
			} else{
				res.send(errorObject);
			}
		});
	},

	//Create new Facility
	create : function(req, res){
		var self = this;
		
		//Format phonenumber
		if(req.body && req.body.phoneNumber)
			req.body.phoneNumber = parseUtils.parsePhoneNumber(req.body.phoneNumber);

		this.tagService.filter(req.body.tags, function(filterTag){
			req.body.tags = filterTag;
			self.facilityService.create(req.body, function(err, savedFacility){
				res.send(savedFacility);
			});
		})
	},

	//Update a facility
	update : function(req, res){
		var _id = req.params.id,
			token = req.query.token,
			self = this;
		

		this.tagService.filter(req.body.tags, function(filterTag){
			var missingFieldsCount = req.body.missing;

			req.body.tags = filterTag;
			self.facilityService.updateFacility(_id, req.body, function(err, savedFacility){
				if(err || !savedFacility) res.send(errorObject);
				else {
					self.classService.updateFacilityName(_id, savedFacility.facilityName, function(err, count){
						if(err)	res.send(errorObject);
						else{
							//Save facility for queue
							if(req.body.queue){
								self.classService.createBundle(_id, req.body.classes, function(err, classes){
									if(err) res.send(errorObject);
									else {
										//Get next facility on queue
										if(savedFacility.status === self.DONESTATUS || savedFacility.status === self.FINISHLATER){

											self.facilityService.getNextFacilityInQueue(token, _id, missingFieldsCount, savedFacility.index, function(err, nextFacility){
												if(err) res.send(errorObject);
												else res.send(nextFacility);	
											});
										} else{
											res.send(savedFacility);
										}
										
									}
								});
							} else{
								res.send(savedFacility);
							}
						}
					});
				}
				
			});
		})

	},

	//Delete a facility
	delete : function(req, res){
		var _id = req.params.id;
		var self = this;
		this.facilityService.remove(_id, function(err, removed){
			if (err) {
				res.send(errorObject)
			}
			else{
				//Delete classes
				self.classService.removeClassesByFacilityID(_id, function(err, count){
					if(err) res.send(errorObject);
					else res.send({status: 'success'});
				})
			}
		})
		
	},

	//Search image:
	searchImages : function(req, res){
		if (req.query.url){
			facilitywebsite.crawlImages(req.query.url, function(results){

				if(results){

					//Check image match the criteria
					var images = [];
					async.each(results.imageArray, function(url, done){
						imageChecker.check(url, function(err, result){
							if(result) images.push(url);
							done(err);
						});
					}, function(err){
						if(err)	res.send(errorObject);
						else
							res.send(images);
					})
				}
				else
					res.send(errorObject);
			})
		} else{
			res.send(errorObject);	
		}
	},

	//Add images to facility
	addImages: function(req, res){
		var facilityId = req.params.id;
			images = req.body;
			folderPath = path.resolve(__dirname, '../../temp'),
			self = this;

		async.map(images,
			function(item, done){
				var imageId = mongoose.Types.ObjectId();
				
				uploadFile.uptoS3(imageId.toString(), item, folderPath, function(err){
					if (err) done(err);
					else{
						console.log(self.imageLink(imageId));
						self.facilityService.addImage(facilityId, {_id : imageId, url : self.imageLink(imageId) }, function(err, count){
							if(err) done(err);
							else{
								done(err, {facilityId: facilityId, id : imageId, url: self.imageLink(imageId)})
							}
						})
					}
				});
			},
			function(err, result){
				if(err)
					res.send(errorObject);
				else{
					res.send(result);
				}
		});
	},

	//Upload image to facility
	uploadImage : function(req, res){
		var _id = req.params.id;
		var imageId = mongoose.Types.ObjectId();
		var file = req.files.files[0];
		
		self = this;
		console.log(imageId.toString());
		console.log(_id);
		uploadFile.uptoS3LocalFile(imageId.toString(), file.path, function(err, result){
			if (err) res.send(errorObject);
			else{
				//Save to DB
				self.facilityService.addImage(_id, {_id: imageId, url : self.imageLink(imageId)}, function(err, savedItem){
					if (err) 
						res.send(errorObject);	
					else{
						res.send({facilityId: _id, id : imageId, url : self.imageLink(imageId)});
					}
				});
			}
		});
	},

	//Delete image
	removeImage: function(req, res){
		var facilityId = req.params.facilityId;
		var imageId = req.params.imageId;
		this.facilityService.deleteImage(facilityId, imageId, function(err, deletedItem){
			res.send({status: 'success'});
			//TODO Removed image on server
		})
	},

	//Search image:
	searchVideos : function(req, res){
		if (req.query.url){
			var url;
			if (req.query.url.indexOf('www') == 0){
				url = 'http://' + req.query.url;
			}
			else
				url = req.query.url;

			facilitywebsite.crawlVideos(url, function(results){
				if(results)
					res.send(results.videos);
				else
					res.send(errorObject);
			})
		} else{
			res.send(errorObject);	
		}
	},

	//Add video
	addVideoLinks : function(req, res){
		var facilityId = req.params.facilityId;
		var videoLink = req.body;
		this.facilityService.addVideoLink(facilityId, videoLink, function(err, addedVideo){
			if(!err){
				res.send(addedVideo);
			} else{
				res.send(errorObject);
			}
		})
	},

	//Delete video link
	deleteVideoLink : function(req, res){
		var facilityId = req.params.facilityId;
		var videoId = req.params.videoId;

		this.facilityService.deleteVideoLink(facilityId, videoId, function(err, deleted){
			if(!err && deleted == 1){
				res.send({status: 'success'});
			} else{
				res.send(errorObject);
			}
		})
	}


}