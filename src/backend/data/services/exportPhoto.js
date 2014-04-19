var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    ExportPhotoModel = require('../models/exportPhotoModel');

module.exports = BaseDBService.extend({
    modelClass : ExportPhotoModel,

});