var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service'),
    Class = require('../models/classModel');

module.exports = BaseDBService.extend({
	modelClass : Class,

	//Get classes by FacilityID
	getClassesByFacilityID : function(facilityID, fn){
		this.modelClass.find({facilityID : facilityID}, fn);
	},

    //Remove classes by FacilityID
    removeClassesByFacilityID : function(facilityID, fn){
        this.modelClass.remove({facilityID : facilityID}, fn);
    },

	//Create class
    createClass: function(classObj, fn){
        var self = this;


        var filterObject = {
            facilityID: classObj.facilityID,
            className: classObj.className,
            schedule : {$elemMatch: {dayOfWeek: classObj.dayOfWeek}},
        };

        filterObject["schedule.times"] = {$elemMatch: {startTime: classObj.schedule[0].times[0].startTime, endTime: classObj.schedule[0].times[0].endTime}};
		this.modelClass.findOne(filterObject, 
                    function (err, foundClass) {
                        if (err || !foundClass) {
                            self.create(classObj, fn);
                        } else {
                           fn && fn();
                        }
                    }
		);
    },

    createBundle: function(facilityID, bundle, fn){
        var self = this;

        this.removeClassesByFacilityID(facilityID, function(err, count){
            if(err) fn && fn(err);
            else{
                //Create a bunch of class
                if(!bundle || bundle.length == 0)
                    fn && fn();
                else{
                    async.mapSeries(bundle,
                        function (item, done) {
                            item.facilityID = facilityID;
                            self.create(item, done);
                        }, 
                        function(err, results){
                            fn(err, results);
                    });
                }
            }
        });
    },

    updateFacilityName: function(facilityID, facilityName, fn){
        if(!facilityName) facilityName = "";
        this.modelClass.update({facilityID : facilityID}, { $set : { facilityName : facilityName} }, fn);
    },

    countFacilitiesHaveClass: function(fn){

        var o = {};
        o.map = function(){ 
            emit(this.facilityID, 1); 
        };
        o.reduce = function(key, values){
            return 1;
        };

        this.modelClass.mapReduce(o, function(err, results){
            if(!err && results)
                fn && fn(null, results.length);
            else
                fn && fn(null, 0);
        });
    
    }
    
});