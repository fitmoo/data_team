var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service'),
    Photo = require('../models/photoModel'),
    Authentication = require('../models/authenticationModel'),
    PhotoS3 = require('../models/photoS3Model'),
    uploadFile = require('../../utils/uploadFiles'),
    facilityModel = require('../models/facilityModel'),
    photoViewLog = require('../models/photoViewLogModel');

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
    markDelete: function(token, photos, firstPhotoId, latestPhotoId, fn){
        var self = this;

        this.getUserName(token, function(err, userName){
            if(err || !userName || userName === "") fn(err, {msg: "Can't get username"});
            else{
            
                async.mapSeries(photos, function(id, done){
                    self.modelClass.findOneAndUpdate({_id : id}, {markDelete : true}, done);
                }, function(err, results){
                    if(!err){
                        console.log('firstPhotoId: %s',firstPhotoId);
                        console.log('latestPhotoId: %s',latestPhotoId);
                        
                        //Update user latest viewed image
                        if(latestPhotoId && latestPhotoId !== '' && firstPhotoId && firstPhotoId !== ''){
                            
                            //Get last photo
                            self.modelClass.findOne({_id : latestPhotoId}, function(err, photo){
                                if(err || !photo){
                                    fn && fn(err);
                                } else{
                                    var lastPage = Math.floor((photo.index + 1)/ 100);

                                    if(photo.index % 100 == 0){
                                        lastPage -= 1;
                                    }
                                    console.log('Last page: %s', lastPage);
                                    self.photoViewLogModel.findOneAndUpdate({userName : userName}, {latestPhotoByDate: photo.createdDate, lastPage: lastPage}, {upsert: true}, function(err){
                                        fn && fn(err, results);
                                    });
                                }
                            });
                        } else{
                            fn && fn(err, results);
                        }
                    }
                    else {
                        fn && fn(err, results);
                    }
                });
            }
        })
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
                self.photoViewLogModel.findOne({userName : userName}, function(err, photoviewLogItem){
                    
                    //console.log('userName: %s' ,userName);
                    //console.log('photoviewLogItem: %j' ,photoviewLogItem);

                    if(err) fn && fn(err);
                    else{

                        var search = {};
                        console.log('Pageindex A : %s', pageIndex);
                        if(photoviewLogItem 
                            && photoviewLogItem.lastPage >= 0
                            && (
                                pageIndex <= photoviewLogItem.lastPage 
                                // || 
                                // (
                                //     pageIndex == 0 && photoviewLogItem.lastPage == 0
                                // )
                            )
                        ){
                            pageIndex = photoviewLogItem.lastPage  + 1;
                        }

                        console.log('Pageindex B : %s', pageIndex);
                        //Debug only
                        search = {debugData : true};

                        var opt = {
                            paginate : { page : pageIndex, limit : perPage || 100 },
                            sort : { createdDate : 1},
                            search : search
                        };


                        self.find(opt, function(err, photos, count){
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

    /*
    markDelete: function(token, photos, firstPhotoId, latestPhotoId, fn){
        var self = this;

        this.getUserName(token, function(err, userName){
            if(err || !userName || userName === "") fn(err, {msg: "Can't get username"});
            else{
            
                async.mapSeries(photos, function(id, done){
                    self.modelClass.findOneAndUpdate({_id : id}, {markDelete : true}, done);
                }, function(err, results){
                    if(!err){
                        console.log('firstPhotoId: %s',firstPhotoId);
                        console.log('latestPhotoId: %s',latestPhotoId);
                        
                        //Update user latest viewed image
                        if(latestPhotoId && latestPhotoId !== '' && firstPhotoId && firstPhotoId !== ''){
                            
                            //Get last photo
                            self.modelClass.findOne({_id : latestPhotoId}, function(err, photo){
                                if(err || !photo){
                                    fn && fn(err);
                                } else{
                                    //Get first photo
                                    self.modelClass.findOne({_id : firstPhotoId}, function(err, firstphoto){
                                        if(err || !firstphoto){
                                            fn && fn(err);
                                        } else{
                                            self.photoViewLogModel.findOneAndUpdate({userName : userName}, {latestPhotoByDate: photo.createdDate}, {upsert: true}, function(err){
                                                fn && fn(err, results);
                                                //Disable upload to S3 while user de-select photo
                                                if(!err){
                                                    //Insert qualified image/photo to PhotoS3 collection for inserting process
                                                    self.modelClass.find({createdDate : {$gte : firstphoto.createdDate, $lte : photo.createdDate}, markDelete: false} , function(err, qualifiedPhotos){
                                                        if(!err){
                                                            console.log('qualifiedPhotos: %s', qualifiedPhotos.length);
                                                            async.eachSeries(qualifiedPhotos, function(qualifiedPhoto, done){
                                                                console.log(qualifiedPhoto._id);
                                                                var photoS3Obj = {facilityID : qualifiedPhoto.facilityID, sourceURL: qualifiedPhoto.sourceURL};

                                                                self.photoS3.findOne(photoS3Obj, function(err, savedPhoto){
                                                                    if(err){
                                                                        done && done(err);
                                                                    //If photo is already exitsts but have no chance to upload to S3 then start upload procedure
                                                                    } else if(savedPhoto && !savedPhoto.s3UploadStatus){
                                                                        //Upload to S3
                                                                        uploadFile.uptoS3(savedPhoto._id.toString(), savedPhoto.sourceURL, function(err){
                                                                            var updateData = {
                                                                                s3UploadStatus : !err,
                                                                                errMessage : err || "",
                                                                            }

                                                                            self.photoS3.findOneAndUpdate({_id: savedPhoto._id}, updateData, function(err, updated){
                                                                                done && done(err);
                                                                            });
                                                                        });
                                                                    //If photo doesn't exitsts then start upload procedure
                                                                    } else{
                                                                        //Create new record
                                                                        photoS3Obj._id = qualifiedPhoto._id;
                                                                        self.photoS3.create(photoS3Obj,function(err, newPhoto){
                                                                            if(!err){
                                                                                //Upload to S3
                                                                                uploadFile.uptoS3(newPhoto._id.toString(), newPhoto.sourceURL, function(err){
                                                                                    var updateData = {
                                                                                        s3UploadStatus : !err,
                                                                                        errMessage : err || "",
                                                                                    }

                                                                                    self.photoS3.findOneAndUpdate({_id: newPhoto._id}, updateData, function(err, updated){
                                                                                        done && done(err);
                                                                                    }); 
                                                                                });
                                                                            } else{
                                                                                done && done(err);
                                                                            }
                                                                        })
                                                                    }
                                                                })

                                                            }, function(err){
                                                                fn && fn(err, results);
                                                            });
                                                            // Send response to server rigth after the upload process started
                                                            fn && fn(err, results);
                                                        } else{
                                                            fn && fn(err, results);
                                                        }
                                                    });
                                                } else{
                                                    fn && fn(err, results);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        } else{
                            fn && fn(err, results);
                        }
                    }
                    else {
                        fn && fn(err, results);
                    }
                });
            }
        })
    },
    */
});