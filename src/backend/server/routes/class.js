
/*
 * Seach facility
 */

var async = require('async');
var DatabaseManager = require('../../data/'),
	configs = require('../../utils/configs');

module.exports = {
	
	facilityService : null,
	classService : null,
	tagService : null,

	MIN_PRICE : 0,
	MAX_PRICE : 5000,

	init : function(facilityService, classService, tagService){
		this.facilityService = facilityService;
		this.classService = classService;
		this.tagService = tagService;
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

		//Search by price:
		var advanceSearch = req.query.advanceSearch && JSON.parse(req.query.advanceSearch);
		var filterCriteria = {};

		if (advanceSearch && (advanceSearch.minPrice || advanceSearch.maxPrice)){
			advanceSearch.minPrice = advanceSearch.minPrice ? advanceSearch.minPrice : this.MIN_PRICE;
			advanceSearch.maxPrice = advanceSearch.maxPrice ? advanceSearch.maxPrice : this.MAX_PRICE;

			filterCriteria = { $and : [ { price : { $lte : advanceSearch.maxPrice} }, { price : { $gte : advanceSearch.minPrice} } ] };
		}
		else {
			//set always true condition
			filterCriteria = { _id : { $exists: true } };
		}

		var dayOfWeekFilter = {};
		dayOfWeekFilter['times.' + search.toLowerCase()] = {$exists : true};

		var opt = {
			paginate : { page : req.query.currentPage && req.query.currentPage > 0 ? req.query.currentPage - 1 : 0, limit : req.query.perPage || 50 },
			sort : sort,
			search: { $and : [
								{ $or : [ { className : regex} , { facilityName : regex}, { schedule : {$elemMatch: {dayOfWeek: search.toLowerCase()}} }, { classDescription : regex}] }
								, filterCriteria
							]	
					}
		};
		
		
		this.classService.find(opt, function(err, classes, count){
			res.send({classes : classes, totalRecords: count});
		});
	},


	findById : function(req, res){
		this.classService.findByID(req.params['id'], function(err, facility, count){
			res.send(facility);
		});
	},

	//Create new Class
	create : function(req, res){
		var self = this;

		this.tagService.filter(req.body.tags, function(filterTag){
			req.body.tags = filterTag;
			self.facilityService.getOne({_id : req.body.facilityID}, function(err, facility){
				if(err || ! facility) res.send(errorObject);
				else{
					req.body.facilityName = facility.facilityName;
					self.classService.create(req.body, function(err, savedClass){
						console.log(err);
						if(err || ! savedClass) res.send(errorObject);
						else {
							res.send(savedClass.toJSON());
						}
					});
				}
			})
		})
	},

	//Update a class
	update: function(req, res){
		var classId = req.params.id;
		var self = this;

		this.tagService.filter(req.body.tags, function(filterTag){
			req.body.tags = filterTag;
			self.classService.updateData(classId, req.body, function(err, savedClass){
				if(err || ! savedClass) res.send(errorObject);
				else {
					res.send(savedClass.toJSON());
				}
			});
		});
	},

	//Delete a Class
	delete : function(req, res){
		var _id = req.params.id;
		this.classService.remove(_id, function(err, removed){
			if (err) {
				res.send({status: 'error'})
			}
			else
				res.send({status: 'success'});
		})
		
	},


}