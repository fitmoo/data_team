var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    User = require('../models/userModel');

module.exports = BaseDBService.extend({
	modelClass : User,


});