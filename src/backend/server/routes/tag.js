
var errorObject = require('./errorResponse'),
	_ = require('underscore'),
	async = require('async');


module.exports = {
	tagService : null,

	init: function(tagService){
		this.tagService = tagService;
	},

	getAllTags: function(req, res){
		this.tagService.getAll(function(err, datas, count){
			if(err) res.send(errorObject);
			else{
				var returnObject = {
					allTagName : _.pluck(datas, 'name'),
					data : datas
				}
				res.send(returnObject);
			}
		});
	},

	createTags: function(req, res){
		var tags = req.body;
		self = this;
		async.auto({
		    createdTags: function(callback){
		        self.tagService.createBundle(tags, callback);
		    },

		    allTagName: [ 
		    	'createdTags',
			    function(callback){
			        self.tagService.getAll(function(err, datas, count){
			        	callback(err, _.pluck(datas, 'name'));
			        });
			    }
		    ],

		    done: ['createdTags', 'allTagName',
		    	function(callback, results){
		     		res.send(results);
		    	}
		    ]
		});

	},

	removeTags: function(req, res){
		var tags = req.body;
		var self = this;

		async.auto({
		    removedTag: function(callback){
		        self.tagService.remove(tags, callback)
		    },

		    allTagName: [ 
		    	'removedTag',
			    function(callback){
			        self.tagService.getAll(function(err, datas, count){
			        	callback(err, _.pluck(datas, 'name'));
			        });
			    }
		    ],

		    done: ['removedTag', 'allTagName',
		    	function(callback, results){
		     		res.send(results);
		    	}
		    ]
		});

		
	}
}