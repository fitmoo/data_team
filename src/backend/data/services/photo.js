var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    path = require('path'),
    BaseDBService = require('../base-mongodb-service'),
    Photo = require('../models/photoModel'),
    Authentication = require('../models/authenticationModel'),
    PhotoS3 = require('../models/photoS3Model'),
    uploadFile = require('../../utils/uploadFiles'),
    facilityModel = require('../models/facilityModel'),
    photoViewLog = require('../models/photoViewLogModel'),
    configs = require('../../utils/configs');

module.exports = BaseDBService.extend({
	modelClass : Photo,
    photoViewLogModel: photoViewLog,
    authenticationModel: Authentication,
    photoS3: PhotoS3,
    facilityModel : facilityModel,

     //Create a bunch of facility
    createBundle: function(facilityID, imageArray, fn){
        if(!imageArray || imageArray.length == 0)
            fn && fn();
        else{
            var self = this;

            async.each(imageArray,
                function (url, done) {
                    self.modelClass.findOne({
                        facilityID: facilityID,
                        sourceURL: url,
                        }, 
                        function (err, photo) {
                            if (err || !photo) {
                                self.create({ facilityID: facilityID, sourceURL: url }, function(err, savedPhoto){
                                    setTimeout(function(){ done && done();}, 10);
                                });
                            } else {
                               setTimeout(function(){ done && done();}, 10);
                            }
                        }
                    );
                }, 
                function(err){
                    fn && fn(err);
                });
        }
    },

    getUserName: function(token, fn){
        this.authenticationModel.findOne({token : token}, function(err, auth){
            if(err || !auth) fn(err);
            else{
                var userName = auth.username || "";
                fn(err, userName);
            }
        });
        
    },


    /*
    * Mark delete a series of photo
    */
    markDelete: function(token, deletephotos, firstPhotoId, latestPhotoId, perpage, fn){
        var self = this;
        perpage = perpage || 0;

        this.getUserName(token, function(err, userName){
            if(err || !userName || userName === "") fn(err, {msg: "Can't get username"});
            else{
                self.modelClass.findOne({_id : firstPhotoId}, function(err, firstphoto){
                    if(err){
                        fn && fn(err, null);
                    } else{
                        //Get last photo
                        self.modelClass.findOne({_id : latestPhotoId}, function(err, lastphoto){
                            if(err || !lastphoto){
                                fn && fn(err, null);
                            } else{

                                //Mark delete photos between first and last photos
                                 async.mapSeries(deletephotos, function(id, done){
                                    self.modelClass.findOneAndUpdate({_id : id, index : {$gte: firstphoto.index, $lte: lastphoto.index}}, {markDelete : true}, done);
                                        
                                }, function(err, results){
                                    if(err) fn && fn(err, results);
                                    else{
                                        var lastPage = Math.floor((lastphoto.index + 1)/perpage);

                                        if(lastphoto.index % perpage == 0){
                                            lastPage -= 1;
                                        }
                                        
                                        // console.log('firstPhotoId: %s',firstPhotoId);
                                        // console.log('latestPhotoId: %s',latestPhotoId);
                                        // console.log('Last page: %s', lastPage);
                                        // console.log('firstphoto.index : %s, lastphoto.index : %s' , firstphoto.index, lastphoto.index);

                                        self.photoViewLogModel.findOneAndUpdate({_id : {$exists : true}}, { $setOnInsert: {latestPhotoByDate: lastphoto.createdDate, lastPage: lastPage}}, {upsert: true}, function(err, logItem){
                                            if(err){
                                                fn && fn(err, results);
                                            } else{

                                                //Move selected Photo to photoS3 collection
                                                self.photoViewLogModel.findOneAndUpdate({_id: logItem._id, lastPage : {$lt : lastPage}}, {$set: {latestPhotoByDate: lastphoto.createdDate, lastPage: lastPage}}, function(err, count){
                                                    //self.photoViewLogModel.
                                                    self.modelClass.find({index : {$gte : firstphoto.index, $lte : lastphoto.index}, markDelete: false} , function(err, qualifiedPhotos){
                                                        if(err){
                                                            fn && fn(err, results);
                                                        } else{
                                                            async.eachSeries(qualifiedPhotos, function(qualifiedPhoto, done){
                                                                var photoS3Obj = {facilityID : qualifiedPhoto.facilityID, sourceURL: qualifiedPhoto.sourceURL};
                                                                
                                                                self.photoS3.findOne(photoS3Obj, 
                                                                function(err, s3Photo){
                                                                    if(!err && !s3Photo){
                                                                        photoS3Obj._id = qualifiedPhoto._id;
                                                                        self.photoS3.create(photoS3Obj, done);
                                                                    }
                                                                    else{
                                                                        done && done(err);
                                                                    }
                                                                })
                                                            }, function(err){

                                                                fn && fn(err, results);
                                                            })    
                                                        }
                                                    })
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    },

    /*
    * Find Photo for current user
    */
    findPhotos: function(token, pageIndex, perPage, fn){
        var self = this;
        pageIndex = pageIndex && pageIndex > 1 ? pageIndex - 1 : 0;


        //Get userName
        this.getUserName(token, function(err, userName){

            if(err || !userName || userName === "") fn(err, {msg: "Can't get username"});
            else{
                //Get latest Image 
                self.photoViewLogModel.findOne({}, function(err, photoviewLogItem){
                    
                    //console.log('userName: %s' ,userName);
                    //console.log('photoviewLogItem: %j' ,photoviewLogItem);

                    if(err) fn && fn(err);
                    else{

                        var search = {};
                        console.log('Pageindex A : %s', pageIndex);
                        if(photoviewLogItem 
                            && photoviewLogItem.lastPage >= 0
                            && photoviewLogItem.lastPage 
                            && pageIndex <= photoviewLogItem.lastPage 
                        
                        ){
                            pageIndex = photoviewLogItem.lastPage  + 1;
                        }

                        console.log('Pageindex B : %s', pageIndex);
                        //Debug only
                        search = {debugData : true};

                        var opt = {
                            paginate : { page : pageIndex, limit : perPage || 100 },
                            sort : { index : 1},
                            search : search
                        };


                        self.find(opt, function(err, photos, count){
                            console.log('%j', photos[0]);
                            fn(err, {photos: photos, currentPage : pageIndex + 1, count: count});
                        });
                    }
                });
            }
        });
    },
    
    /*
    *   Migrate images in facilities collection 
    */
    migrateFacilitiesImage: function(fn){
        var self = this;
        
        this.facilityModel.find({}, {_id: 1, images : 1},function(err, facilities){
            var index = 0;

            async.eachSeries(facilities, function(facility, done){

                if(facility && _.isArray(facility.images)){
                    async.eachSeries(
                        facility.images,
                        function(image, done){
                            self.modelClass.findOne({sourceURL : image.url, facilityID : facility._id}, function(err, photo){
                                if(!err && !photo){
                                    //Copy image to photos collection
                                    self.modelClass.create({
                                        facilityID : facility._id,
                                        markDelete : false,
                                        s3URL : "",
                                        isFitmooData: true,
                                        sourceURL : image.url
                                    }, function(err, savedPhoto){
                                        setTimeout(function(){ done && done(err); }, 500);
                                    })
                                    
                                    
                                } else{
                                    console.log('Exists');
                                    done && done();
                                }
                            })
                        },
                        function(err){
                            index++;
                            console.log('Finish facility index: %s', index);
                            done && done(err);
                    }); 
                    
                } else{
                    done && done();
                }

            }, function(err){
                fn && fn(err);
            });
        })
    },

    imageLink: function(imageId){
        return uploadFile.getS3HostName() + '/' + imageId;
    },
    /*
    *   Upload qualified photos to S3
    */
    upLoadToS3: function(fn){
        var self = this;

        this.photoS3.find({sourceURL : {$exists : true}, s3UploadStatus : false}, function(err, photos){
            if(err) fn && fn(err);
            else{
                var length = photos.length;
                var index = 0;
                var folderPath = path.resolve(__dirname, '../../temp');
                
                console.log('Total images: %s', length);
                async.eachSeries(photos, function(photo, done){
                    index ++;
                    if(photo.sourceURL != ''){
                        uploadFile.uptoS3(photo._id.toString(), photo.sourceURL, folderPath, function(err){
                            photo.s3UploadStatus = !err;
                            photo.errMessage = err;
                            photo.save(function(err){
                                if(!err){
                                    console.log('Uploaded image: %s/%s', index, length);
                                    //Insert image s3 to facility
                                    self.facilityModel.update({_id: photo.facilityID}, { $push: { 'images' : {_id : photo._id, url : self.imageLink(photo._id) } }, $inc : { imagesCount : 1}}, {}, function(err){
                                        done && done(err); 
                                    });
                                } else{
                                    done && done(err);
                                }
                                
                            });
                        })
                    }
                }, function(err){
                    fn && fn(err);
                })
            }
        })
    },

    /*
    *   Check is there any photo not link to facility
    */
    checkPhotoFacilityLink: function(fn){
        var self = this;
        var index = 0;
        var facilities = [];

        this.modelClass.find({}, {_id : 1, facilityID: 1}, function(err, photos){
            async.eachSeries(photos,
                function(photo, done){
                    self.facilityModel.findOne({_id : photo.facilityID}, function(err, facility){
                        if(err || !facility){
                            index ++;
                            console.log('Unlink photo: _id: %s', photo._id);
                            facilities.push(photo.facilityID);
                        }
                        done && done(err);
                    });
                },
                function(err){
                    var filter = _.uniq(facilities);
                    var fs = require('fs');
                    var fd = fs.openSync('array.txt', 'a+', 0666);

                    console.log('Unlink: %s photos', index);
                    console.log('Unlink: %s facilities', filter);
                    filter.forEach(function(v) { 
                        fs.writeSync(fd, v + '\n');
                    });
                    fs.closeSync(fd);
                    fn && fn(err);
                }
            );
        })
    },

    facilityMissPhoto: function(fn){
        var self = this;
        var errorFacilities = [];
        var index = 0;

        this.facilityModel.find({}, function(err, facilities){
            console.log(facilities.length);
            async.eachSeries(facilities, function(item, done){

                var facility = item.toJSON();
                index += 1;

                self.modelClass.find({facilityID : facility._id}, {_id : 1}, function(err, photos){
                    console.log(err);
                    console.log(photos);
                    if(err || !photos || photos.length === 0){
                        console.log('Index : %s, facilityID : %s', index, facility._id);
                        errorFacilities.push(facility._id) 
                    }
                    done && done(err);
                })
            }, function(err){
                console.log('Facilities miss photo: %s', errorFacilities.length);
                fn && fn(err);
            })
        })
    },

    updateFacility: function(fn){
        var index = 0;

        this.facilityModel.find({isCrawl: false}, function(err, facilities){
            async.eachSeries(facilities, function(facility, done){
                index = index + 1;
                facility.crawlIndex = index;
                facility.save(function(err){
                    done && done(err);
                })
            }, function(err){
                fn && fn(err);
            });
        })
    }
});