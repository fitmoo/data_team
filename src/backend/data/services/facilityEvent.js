var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    FacilityEvent = require('../models/facilityEventModel');

module.exports = BaseDBService.extend({
	modelClass : FacilityEvent,
	 //Create a bunch of facility
    createBundle: function(bundle, fn){
        if(!bundle || bundle.length == 0)
            return;
        var self = this;
        async.each(bundle,
            function (item, done) {
                self.modelClass.findOne({
                    facilityId: item.facilityId,
                    eventId: item.eventId,
                    }, 
                    function (err, foundItem) {
                        if (err || !foundItem) {
                            self.create(item, done);
                        } else {
                            _.each(item, function (value, key) {
                                foundItem[key] = value;
                            });
                            foundItem.save(done);
                        }
                    }
                );
            }, 
            function(err, result){
                fn(err, bundle.length);
            });
    },
});