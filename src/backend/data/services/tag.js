var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    Tag = require('../models/tagModel');

module.exports = BaseDBService.extend({
	modelClass : Tag,

	createBundle: function(bundle, fn){
        if(!bundle || bundle.length == 0)
            return;

        var self = this;

        async.map(bundle,
            function (item, done) {
                var temp = { name : item};
                
                self.modelClass.findOne({
	                    name: item,
                    }, 
                    function (err, tag) {
                        if (err || !tag) {
                            self.modelClass.create(temp, done);
                        } else {
                            _.each(item, function (value, key) {
                                tag[key] = value;
                            });
                            tag.save(done);
                        }
                    }
                );
            }, 
            function(err, result){
                fn(err, result);
            });
    },

	getAll: function(fn){
		var opt = {
			paginate : {
                page: 0,
                limit: 1000
			},
		}
		this.find(opt, fn);
	},

	remove: function(tagArray, fn){
		self = this;
		//var deltedIds = _.pluck(tagArray, 'id');
		//this.modelClass.remove( { _id : { $in : deltedIds } } , fn);

        async.mapSeries(tagArray, 
            function(tagName, done){
                self.modelClass.findOne({ name : tagName }, function(err, foundTag){
                    if(err) done(err);
                    else {
                        foundTag.remove(function(err, removed){
                            if (err) done(err);
                            else
                                done(null, foundTag);
                        })
                    }
                })    
            },
            fn
        )
	},

    /*
    * Remove tag doesn't exists in the system
    */
    filter: function(tags, fn){
        if(!tags || tags.length == 0) return fn(null);
        var self = this;
        async.filter(tags, function(tag, done){
            var regex = { $regex: tag, $options: 'i' };
            self.modelClass.findOne({ name : regex}, function(err, foundTag){
                done(foundTag);
            })
        }, fn);
    }

});