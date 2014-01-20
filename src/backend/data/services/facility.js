var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service'),
    Facility = require('../models/facilityModel'),
    Authentication = require('../models/authenticationModel'),
    Class = require('../models/classModel');

module.exports = BaseDBService.extend({
	modelClass : Facility,
    classModelClass : Class,
    authenticationModel : Authentication,

    /*
    * Get Queue
    */
    getQueue: function(perPage, pageIndex, fn){
        var sortOpts = { index: 1, facilityName : 1},
            searchOpts = { status : { $ne : 2 }},
            responseFields = { _id: 1, facilityName : 1, address  : 1, country : 1, city  : 1, state : 1, zip : 1, phoneNumber : 1,  email  : 1, websiteURL  : 1, ownersName : 1, aboutus  : 1};

        var findQuerySet = null,
            modelClass = this.modelClass;
            
        if (responseFields)
            findQuerySet = modelClass.find(searchOpts, responseFields);
        else
            findQuerySet = modelClass.find(searchOpts);

        
        //query & paging
        findQuerySet
            .limit(perPage)
            .skip(perPage * pageIndex)
            .sort(sortOpts)
            .exec(function (err, datas) {
                findQuerySet.count().exec(function (err, count) {
                    fn(err, datas, count);
                })
            })
    },


    /*
    *   Get facility need crawling
    *   Pass websiteURL if wanna debug
    */
    getCrawlingFacilities: function(websiteURL, fn){
        if(!websiteURL){
            this.modelClass.find({isCrawl : false}, {_id : 1, websiteURL:1}, fn);
        } else{
            this.modelClass.find({websiteURL  : websiteURL}, {_id : 1, websiteURL : 1}, fn);
        }
        
    },

    /*
    * Check out facility to edit
    */
    checkOut: function(token, facilityID, fn){
        var self = this;

        this.authenticationModel.findOne({token : token}, function(err, authentication){
            if(err || !authentication) fn && fn(err, null);
            else{
                var userName = authentication.username || "";

                self.modelClass.findOne({_id : facilityID}, function(err, facility){
                    if(err || !facility) fn && fn(err, null);
                    else{
                        self.modelClass.update({$and : [
                                            { _id : facilityID }, 
                                            { 
                                                $or : [
                                                    { checkOutBy : "" },
                                                    { checkOutBy : userName },
                                                    { $exists: { checkOutBy : false } }
                                                ]
                                            }
                                        ]}, 
                                        { $set : { checkOutBy : userName , checkOutDate : new Date()} }
                                        , function(err, count){
                                            if(err){
                                                fn(err, null);
                                            } else if (count == 0 ){
                                                fn(err, {checkOutBy : facility.checkOutBy})
                                            } else {
                                                fn(err, true);
                                            }
                        });        
                    }
                })    
                
            }
        })
        
    },

    /*
    * Undo checkout facilities edit by a user
    */
    undoCheckOutByUserName: function(token, fn){
        var self = this;

        this.authenticationModel.findOne({token : token}, function(err, authentication){
            if(err || !authentication) fn && fn(err, null);
            else{
                var userName = authentication.username || "";

                self.modelClass.update({checkOutBy : userName},  { $set : { checkOutBy : ""} }, { multi : true}, fn); 
            }
        })
        
    },

    /*
    * Undo checkout a Facility
    */
    undoCheckOut: function(token, facilityID, fn){
        var self = this;

        this.authenticationModel.findOne({token : token}, function(err, authentication){
            if(err || !authentication) fn && fn(err, null);
            else{
                var userName = authentication.username || "";

                self.modelClass.update({_id : facilityID},  { $set : { checkOutBy : ""} }, fn); 
            }
        })
        
    },

    /*
    * Get next facility in queue
    */
    getNextFacilityInQueue: function(token, currentFacilityID, missingFieldsCount, currentIndex, fn){
        var self = this;
        
        this.authenticationModel.findOne({token : token}, function(err, authentication){
            if(err || !authentication) fn && fn(err, null);
            else{
                var userName = authentication.username,
                    search = {
                        status : { $ne : 2 },
                        index : { $gt : currentIndex},
                        $or : [
                                { checkOutBy : "" },
                                { checkOutBy : userName }
                        ]
                    };
                /*self.modelClass.findOne(search, {}, {sort: {index: 1}}, function (err, nextFacility) {
                    
                    if(err) fn && fn(err);
                    else{
                        //Get Classes
                        self.classModelClass.find({facilityID : nextFacility._id}, function(err, classes){
                            if(err) fn && fn(err);
                            else{
                                var returnFacility = nextFacility.toJSON();
                                
                                returnFacility.classes = classes;
                                fn && fn(err, returnFacility);
                            }
                        });
                    }
                });*/
                self.modelClass.findOne(search, {}, {sort: {index: 1}}, function (err, nextFacility) {
                    if(err) fn && fn(err);
                    else{
                        //Checkout
                        self.checkOut(token, nextFacility._id, function(err, result){
                            //console.log(result);
                            if(!err && result && result === true){
                                //Get Classes
                                self.classModelClass.find({facilityID : nextFacility._id}, function(err, classes){
                                    if(err) fn && fn(err);
                                    else{
                                        var returnFacility = nextFacility.toJSON();
                                        
                                        returnFacility.classes = classes;
                                        fn && fn(err, returnFacility);
                                    }
                                });
                            } else{
                                fn && fn(err);
                            }
                        })
                    }
                });
            }
        });
    },

    /*
     * Get all user in db
     */
    getAllFacility: function (fn) {
        this.modelClass.find({ facilityID : {$exists : false} }, {_id : 1, address : 1, city: 1, state : 1},fn);
    },

    //Create a bunch of facility
    createBundle: function(bundle, fn){
        if(!bundle || bundle.length == 0)
            return;
        var self = this;
        async.each(bundle,
            function (item, done) {
                self.modelClass.findOne({
                    facilityID: item.facilityID
                    }, 
                    function (err, facility) {
                        if (err || !facility) {
                            self.create(item, done);
                        } else {
                            _.each(item, function (value, key) {
                                facility[key] = value;
                            });
                            facility.save(done);
                        }
                    }
                );
            }, 
            function(err, result){
                fn(err, bundle.length);
            });
    },

    /*
    * Migrate Fitmoo existing facilities to the new system
    */
    checkDupAndCreateBundle: function(bundle, fn){
        if(!bundle || bundle.length == 0)
            return;
        var self = this,
            index = 0;

        async.mapSeries(bundle,
            function (item, done) {
                self.modelClass.findOne(
                    {
                        $or : [
                                {
                                    addressLowerCase: {$in :item.addressArray},
                                    cityLowerCase  : item.cityLowerCase ,
                                    stateLowerCase : item.stateLowerCase,
                                },
                                {
                                    facilityName : item.facilityName,
                                    websiteURL : item.websiteURL,
                                },
                                {
                                    facilityName : item.facilityName,
                                    cityLowerCase  : item.cityLowerCase ,
                                    stateLowerCase : item.stateLowerCase,
                                },
                                {
                                    facilityName : item.facilityName,
                                    cityLowerCase  : item.cityLowerCase ,
                                    zip : { $exists : true, $ne : '', $in : [item.zip]},
                                },
                                {
                                    facilityName : item.facilityName,
                                    stateLowerCase : item.stateLowerCase,
                                    //zip : { $exists : true, $ne : '', $in : [item.zip]},
                                    
                                }
                        ]
                    }, 
                    function (err, facility){
                        console.log('facility');
                        console.log(facility);
                        if(err) done(err, null);
                        else{
                            index++;
                            //Create new
                            if (!facility){
                                self.create(item, function(err, saveFacility){
                                    console.log('Facility Index: %s : Create new', index);
                                    done && done(err, {_id: saveFacility._id, exist: false});
                                });
                            //Update
                            } else {
                                _.each(item, function (value, key) {
                                    if(key === 'fitmooFacilityID'){
                                        //Add duplicated fitmooFacilityID for migration classes.
                                        if(!_.contains(facility.fitmooFacilityIDArray, value))
                                            facility.fitmooFacilityIDArray.push(value);
                                    }
                                    
                                    if(value && value.toString().length > 0 && (!facility[key] || facility[key].toString().length === 0)){
                                        facility[key] = value;
                                        
                                    }
                                });
                                
                                facility.save(function(err, saveFacility){
                                    console.log('Facility Index: %s : Update', index);
                                    done && done(err, {_id: saveFacility._id, exist: true});
                                });
                            }
                        }
                    }
                );
            }, 
            function(err, result){
                fn(err, result);
            });
    },

    countTotalImages : function(fn){

        var o = {};
        o.map = function(){ 
            emit(1, this.imagesCount); 
        };
        o.reduce = function(key, values){
            return values.reduce(function(pv, cv) { return pv + cv; }, 0);
        };

        this.modelClass.mapReduce(o, function(err, results){
            if(!err && results && results.length == 1)
                fn && fn(null, results[0].value);
            else
                fn && fn(null, 0);
        });
    },

    countTotalVideo : function(fn){
        var o = {};

        o.map = function(){ 
            emit(1, this.videoCount); 
        };
        o.reduce = function(key, values){
            return values.reduce(function(pv, cv) { return pv + cv; }, 0);
        };

        this.modelClass.mapReduce(o, function(err, results){
            if(!err && results && results.length == 1)
                fn && fn(null, results[0].value);
            else
                fn && fn(null, 0);
        });
    },

    findDuplicateFacilityName: function(fn){
        var o = {};

        o.map = function(){ 
            if(this.facilityName){
                emit(this.facilityName + '-' + this.state, 1);     
            }
        };
        o.reduce = function(key, values){
            return values.reduce(function(pv, cv) { return pv + cv; }, 0);
        };

        this.modelClass.mapReduce(o, function(err, results){
            if(!err && results)
                fn && fn(null, results);
            else
                fn && fn(null, 0);
        });
    },

    /*
    *   List out duplciated facility for enduser
    */
    listDuplicateFacility: function(fn){
        var self = this;
        this.findDuplicateFacilityName(function(err, results){
            var duplicatedFacilities = _.filter(results, function(facility){
                    return facility.value >= 2;
                });

            var facilities = _.chain(duplicatedFacilities)
             .pluck('_id')
             .map(function(facilityName){
                var index = facilityName.indexOf('-');
                if(index >= 0)
                    return facilityName.substring(0, index);
                else
                    return facilityName;
             }).value();
             
             self.modelClass.find({facilityName : { $in : facilities}}, {_id : 1, facilityName : 1, city : 1, state : 1, zip : 1})
                        .sort({facilityName : 1})
                        .exec(function(err, results){
                            fn && fn(err, { count : facilities.length, facilities: results});
                        });
        })
        
    },

    findMissingFacilities: function(fn){
        this.modelClass.find( { "country" : "" }, fn);
    },

    /*
    *   Count total facility.images.
    */
    countImages: function(fn){
        this.modelClass.find({}, {_id: 1, images : 1}, function(err, results){

            var facilities = _.reduce(results,function(memo, facility){
                if(_.isArray(facility.images)){
                    return memo + facility.images.length;    
                } else
                    return memo;
                
            }, 0)
            fn && fn({totalFacility: results.length, totalImages : totalImages});
        })
    },

    //Update lat and lng
    updateLatLng: function(facilityId, lat, lng, fn){
        this.modelClass.update({facilityID : facilityId}, { $set : {lat : lat, lng : lng} }, { upsert:false }, fn )
    },
    
    findByFacilityIDs : function(facilityIDs, fn){
        this.modelClass.find( {_id : { $in : facilityIDs }}, {facilityName : 1}, fn);
    },

    addImage : function(id, imageObject, fn){
        this.modelClass.update({_id: id }, { $push: { 'images' : imageObject }, $inc : { imagesCount : 1}}, {upsert:true}, fn);
    },

    deleteImage : function(id, imageId, fn){
        this.modelClass.update({_id: id }, { $pull: { "images" : { _id : imageId} }, $inc : { imagesCount : -1}  }, fn);
    },

    addVideoLink : function(id, videoLinks, fn){
        var videos = [];
        _.each(videoLinks, function(url){
            var videoId = mongoose.Types.ObjectId();
            videos.push({ id: videoId, _id : videoId, url: url, facilityId : id});
        });

        this.modelClass.update({_id: id }, { $pushAll: { 'video' : videos }, $inc : { videoCount : videos.length} }, {upsert:true}, function(err){
            fn(err, videos);
        });
    },

    deleteVideoLink : function(id, videoId, fn){
        this.modelClass.update({_id: id }, { $pull: { 'video' : { _id : videoId} }, $inc : { videoCount : -1 } }, fn);
    },

    /*
    * Update facilities missing fields total
    */
    calculateMissingFields : function(fn){
        var self = this;

        this.modelClass.find({}, { _id: 1,facilityName : 1,address  : 1, country : 1, city  : 1, state : 1, zip : 1, phoneNumber : 1,  email  : 1, websiteURL  : 1, ownersName : 1, aboutus  : 1}, function(err, facilities){
            //Facilities have no class is on the top
            var len = facilities.length;
            var count1 = 0;
            async.eachSeries(facilities, function(facility, done){
                count1 += 1;
                self.classModelClass.findOne({facilityID : facility._id}, function(err, classInfo){
                    if(err) done(err);
                    else{
                        if(!classInfo) facility.missing = 100;
                        else{
                            facility.missing = self.countMissingFields(facility);
                        }
                        self.modelClass.update({_id : facility._id}, { $set : { missing : facility.missing} }, {multi : true}, function(err, count){
                            console.log('Updated: %s/%s, orderIndex: %s', count1, len, facility.missing);
                            done(err);
                        })
                    }
                })
            }, function(err){
                console.log('calculateMissingFields : Finish');
                if(err)
                    console.log('Err: %j', err);
                fn && fn(err);
            })
        })
    },

    updateQueueIndex: function(fn){
        console.log('Start updateQueueIndex');
        this.modelClass.find({}, {_id : 1}, {sort: {missing: -1, facilityName: 1 }}, function (err, facilities) {
            var index = 1;
            var len = facilities.length;

            async.eachSeries(facilities, function(facility, done){
                facility.index = index;
                console.log('updateQueueIndex %s/%s : %s', index, len, facility._id);
                index ++;

                facility.save(done);
            }, function(err){
                console.log('updateQueueIndex : Finish');
                if(err)
                    console.log('Err: %j', err);
                fn && fn(err);
            })
        });
    },

    updateFacility:  function (id, data, fn) {
        data.orderIndex = this.countMissingFields(data);
        data.checkOutBy = "";
        data.checkOutDate = null;
    
        this.modelClass.findOne({_id: id}, function (err, model) {
            if (model) {
                _.each(data, function (value, key) {
                    model[key] = value;
                });
                model.save(fn);
            } else{
                fn && fn();
            }
        });
    },

    countMissingFields: function(facility){
        var orderIndex = 0;

        orderIndex += (!facility.facilityName || facility.facilityName == "") ? 1 : 0;
        orderIndex += (!facility.address  || facility.address  == "") ? 1 : 0;
        orderIndex += (!facility.country || facility.country == "") ? 1 : 0;
        orderIndex += (!facility.city  || facility.city  == "") ? 1 : 0;
        orderIndex += (!facility.zip || facility.zip == "") ? 1 : 0;
        orderIndex += (!facility.phoneNumber || facility.phoneNumber == "") ? 1 : 0;
        orderIndex += (!facility. email  || facility. email  == "") ? 1 : 0;
        orderIndex += (!facility.websiteURL  || facility.websiteURL  == "" || facility.websiteURL  == "http://") ? 1 : 0;
        orderIndex += (!facility.ownersName || facility.ownersName == "") ? 1 : 0;
        orderIndex += (!facility.aboutus  || facility.aboutus  == "") ? 1 : 0;
        return orderIndex;
    }
    
});