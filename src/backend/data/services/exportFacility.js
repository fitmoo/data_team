var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    ExportFacilityModel = require('../models/exportFacilityModel');

module.exports = BaseDBService.extend({
    modelClass : ExportFacilityModel,

});