var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    ExportEvent = require('../models/exportEventModel');

module.exports = BaseDBService.extend({
    modelClass : ExportEvent,

    /**
    *   Create bundle of data
    */
    createBundle: function(bundle, fn){
    if(!bundle || bundle.length == 0)
        return;
    var self = this;
    async.each(bundle, 
        function (item, done) {
            self.modelClass.findOne({
                _id: item._id
                }, 
                function (err, eventItem) {
                    if (err || !eventItem) {
                        self.create(item, done);
                    } else {
                        _.each(item, function (value, key) {
                            eventItem[key] = value;
                        });
                        eventItem.save(done);
                    }
                }
            );
        }, 
        function(err, result){
            fn && fn(err, bundle.length);
        });
    },

});