var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    Authentication = require('../models/authenticationModel');
    dateUtils = require('../../utils/dateUtils');

module.exports = BaseDBService.extend({
	modelClass : Authentication,

	createToken: function(opt, fn){
		if(opt && opt.username){
			var self = this;
			var lastLogin = dateUtils.addDates(-1);
			console.log(lastLogin);
			//Remove token in the pass
			this.modelClass.remove({ username: opt.username, lastLogin : { $lte : lastLogin} }, function(err, count){
				if(err) fn && fn(err);
				else{
					self.create(opt, fn);
				}
			})
		} else{
			fn && fn('object is invalid.');
		}
	},

	removeToken: function(token, fn){
		this.modelClass.remove({ token: token}, fn);
	}
});