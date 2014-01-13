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
                                        
                                        console.log('firstPhotoId: %s',firstPhotoId);
                                        console.log('latestPhotoId: %s',latestPhotoId);
                                        console.log('Last page: %s', lastPage);
                                        console.log('firstphoto.index : %s, lastphoto.index : %s' , firstphoto.index, lastphoto.index);

                                        self.photoViewLogModel.findOneAndUpdate({userName : userName}, {latestPhotoByDate: lastphoto.createdDate, lastPage: lastPage}, {upsert: true}, function(err){
                                            
                                            //Move selected Photo to photoS3 collection
                                            
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

                        console.log();

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

    /*
    *   Upload qualified photos to S3
    */
    upLoadToS3: function(fn){
        this.photoS3.find({sourceURL : {$exists : true}, s3UploadStatus : false}, function(err, photos){
            if(err) fn && fn(err);
            else{
                var length = photos.length;
                var index = 0;

                console.log('Total images: %s', length);
                var folderPath = path.resolve(__dirname, '../../temp');
                async.eachSeries(photos, function(photo, done){
                    index ++;
                    if(photo.sourceURL != ''){
                        uploadFile.uptoS3(photo._id.toString(), photo.sourceURL, folderPath, function(err){
                            photo.s3UploadStatus = !err;
                            photo.errMessage = err;
                            photo.save(function(err){
                                console.log('Uploaded image: %s/%s', index, length);
                                done && done(err);
                            });
                        })
                    }
                }, function(err){
                    fn && fn(err);
                })
            }
        })
    }
});