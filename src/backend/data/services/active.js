var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    Active = require('../models/activeModel');

module.exports = BaseDBService.extend({
	modelClass : Active,

	/**
	*	Create bundle of data
	*/
	createBundle: function(bundle, fn){
		if(!bundle || bundle.length == 0)
			return;
		var self = this;
        async.each(bundle, function (item, done) {
            self.modelClass.findOne({
                id: item.id
            }, function (err, company) {
                if (err || !company) {
                    self.create(item, done);
                } else {
                	console.log('exist');
                    done();
                }
            });
        }, fn);
	}
});