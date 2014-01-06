var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service'),
    CrawlStatus = require('../models/crawlStatusModel');

module.exports = BaseDBService.extend({
	modelClass : CrawlStatus,

    isCrawlRunning: function(sourceName, fn){
         this.modelClass.findOne({status : "Running", source : sourceName}, fn);
    },

    startCrawlActive: function(fn){
        var currentDate = new Date();
        var self = this;
        this.modelClass.create({
            startDate: new Date(),
            status : "Running",
            source: "active.com",
        }, fn);
    },

    getLatestCrawl: function(sourceName, fn){
        this.modelClass.find().sort({startDate : -1}).exec(function(err, crawlStatuses){
            if(err || !crawlStatuses || crawlStatuses.length == 0) fn && fn(err, {status: "Finish"});
            else fn && fn(err, crawlStatuses[0]);
        })
    }
    	
});