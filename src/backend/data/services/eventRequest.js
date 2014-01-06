var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    EventRequest = require('../models/eventRequestModel');

module.exports = BaseDBService.extend({
	modelClass : EventRequest,

	/**
    *   Remove all request
    */
    removeAllRequests: function(fn){
        this.modelClass.find({}).exec(function (err, datas) {
            async.each(datas,
                function(data, done){
                    data.remove(done);
                },
                function(err, result){
                    console.log('Removed all pending eventRequest job in DB');
                    fn && fn();
            });
        });
    },

    /**
	*	Create bundle of data
	*/
    createBundle: function(bundle, fn){
        if(!bundle || bundle.length == 0)
            return;
        var self = this;
        async.each(bundle, 
            function (item, done) {
                self.create(item, function(err, savedObject){
                    item._id = savedObject._id;
                    done();
                });
            }, 
            function(err, result){
                fn && fn(err, bundle.length);
            });
    },

    //Load pending request in DB
    loadRequests : function(fn){
        this.modelClass.find({}, {_id : 1,url : 1,method : 1,headers : 1,qs : 1}).exec(function (err, datas){
            fn(err, datas);
        });
    },

    //Remove request
    removeRequestById : function(id, fn){
        this.modelClass.find({_id : id}).exec(function (err, datas) {
            async.each(datas,
                function(data, done){
                    data.remove(done);
                },
                function(err, result){
                    //console.log('Removed %s finish eventRequest job in DB', id);
                    fn && fn();
            });
        });
    }
});