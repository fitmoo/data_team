var async = require('async'),
	_ = require('underscore');
	mongoose = require('mongoose');

var errorObject = require('./errorResponse'),
	strUtils =  require('../../utils/strUtils');

module.exports = {

	eventService : null,
	tagService : null,

	MIN_DATE : '1975-01-01',
	MAX_DATE : '3000-01-01',
	MIN_PRICE : 0,
	MAX_PRICE : 5000,

	init : function(eventService, tagService){
		this.eventService = eventService;
		this.tagService = tagService;
	},

	//Search event
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

		var advanceSearch = req.query.advanceSearch && JSON.parse(req.query.advanceSearch);
		var filterCriteria = {};

		
		if (advanceSearch && (advanceSearch.minPrice || advanceSearch.maxPrice)){
			advanceSearch.minPrice = advanceSearch.minPrice ? advanceSearch.minPrice : this.MIN_PRICE;
			advanceSearch.maxPrice = advanceSearch.maxPrice ? advanceSearch.maxPrice : this.MAX_PRICE;

			filterCriteria = {  
								eventPrice: { 
												$elemMatch : { $and : [ { price : { $lte : advanceSearch.maxPrice} }, { price : { $gte : advanceSearch.minPrice} } ] } 
											}  
							};
		}else {
			//set always true condition
			filterCriteria = { _id : { $exists: true } };
		}

		
		var dateTimeCriteria = {};

		if (advanceSearch && (advanceSearch.startDate || advanceSearch.endDate)){
			if (!advanceSearch.startDate) {
				advanceSearch.startDate = this.MIN_DATE; 
			} else{
				var temp = 	advanceSearch.startDate.split('/'); //MM/DD//YYYY
				if(temp.length == 3){
					advanceSearch.startDate = temp[2] + '-' + temp[0] + '-' + temp[1];
 				} else{
 					advanceSearch.startDate = this.MIN_DATE;
 				}
			}


			if (!advanceSearch.endDate) {
				advanceSearch.endDate = this.MAX_DATE; 
			} else{
				var temp = 	advanceSearch.endDate.split('/'); //MM/DD//YYYY
				if(temp.length == 3){
					advanceSearch.endDate = temp[2] + '-' + temp[0] + '-' + temp[1];
					} else{
						advanceSearch.endDate = this.MAX_DATE;
				}
			}
			dateTimeCriteria = { $or : [ 
											{ startDateTime : { $gte: new Date(advanceSearch.startDate), $lte: new Date(advanceSearch.endDate) } },
											{ endDateTime : { $gte: new Date(advanceSearch.startDate), $lte: new Date(advanceSearch.endDate) } }, 
											{
												$and : [
													{ startDateTime : { $lte: new Date(advanceSearch.startDate) } }, 
													{ endDateTime : { $gte: new Date(advanceSearch.endDate) } }
												]
											}
										] 
								};
		}
		else{
			//set always true condition
			//dateTimeCriteria = { _id : { $exists: true } };
			dateTimeCriteria = { endDateTime : { $gte: new Date() } };
		}
	
		var opt = {
			paginate : { page : req.query.currentPage && req.query.currentPage > 0 ? req.query.currentPage - 1 : 0, limit : req.query.perPage || 50 },
			sort : sort,
			search: { $and: [
								{ $and : [
										{ assetParentGuid : { $exists: false } }, 
										{ 
											$or : [ { eventName : regex}, { address1 : regex}, { address2 : regex}, { city : regex}, { stateProvinceCode : regex} , { country : regex} ]
										}
								 	]
								},
								filterCriteria,
								dateTimeCriteria,
							]

					}

		}

		var self = this;
		this.eventService.find(opt, function(err, events, count){
			
			if (err) res.send(errorObject);
			else{

				//Find activities prices, the price property will be moved to activity.price in data cleansing procedure. 
				async.map(events, function(item, done){
					if(!item.activities) item.activities = [];
					async.map(item.activities, function(activity, fn){
						if(activity && !activity.price){
							self.eventService.findPrice(activity._id, function(err, foundItem){
								if (foundItem && foundItem.eventPrice.length > 0){
									activity.price = foundItem.eventPrice[0].price;
								}
								fn(null);
							})
						} else{
							fn(null);
						}
					},
					function(err, result){
						done(null);
					});

				}, function(err, result){
					res.send({events : events, totalRecords: count});	
				})
				
			}
		});
	},

	findById : function(req, res){
		id = req.params['id'];
		self = this;
		this.eventService.findByID(req.params['id'], function(err, item, count){
			if (err || !item) res.send(errorObject);
			else 
			{
				async.map(item.activities, function(activity, fn){
						if(activity && !activity.price){
							self.eventService.findPrice(activity._id, function(err, foundItem){
								if (foundItem && foundItem.eventPrice.length > 0){
									activity.price = foundItem.eventPrice[0].price;
								}
								fn(null);
							})
						} else{
							fn(null);
						}
					},
					function(err, result){
						item.eventDescription = strUtils.removeHTMLTag(item.eventDescription);
						res.send(item);
				});
				
			}
		});
	},


	//Create new Event
	create : function(req, res){
		req.body._id = mongoose.Types.ObjectId();
		_.map(req.body.activities, function(activity){
			activity._id = mongoose.Types.ObjectId();
		})

		var self = this;

		this.tagService.filter(req.body.tags, function(filterTag){
			req.body.tags = filterTag;
			self.eventService.create(req.body, function(err, savedEvent){
				res.send(savedEvent);
			});
		})
	
	},

	//Update an Event
	update : function(req, res){
		var _id = req.params.id;
		var self = this;

		this.tagService.filter(req.body.tags, function(filterTag){
			req.body.tags = filterTag;
			self.eventService.updateData(_id, req.body, function(err, savedEvent){
				console.log(savedEvent);
				res.send(savedEvent);
			});
		});
	},

	//Delete an event
	delete : function(req, res){
		var _id = req.params.id;
		this.eventService.remove(_id, function(err, removed){
			if (err) {
				res.send({status: 'error'})
			}
			else
				res.send({status: 'success'});
		})
		
	},

}