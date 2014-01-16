var spawn = require('child_process').spawn,
	path = require('path'),
	async = require('async'),
	_ = require('underscore');

var dateUtils = require('../../utils/dateUtils'),
	imageChecker = require('../../utils/imageChecker'),
	configs = require('../../utils/configs');

var DatabaseManager = require('../../data/');



module.exports = {

	crawlType : '',
	pageResource : { videos: [], imageArray : [], imagesNeedLoading: [], cacheImages: [], linkArray : [], rearchedLinks : [] },
	DEEPLINK : 0,
	siteCrawlerJSFile : path.resolve(__dirname, 'siteCrawler.js'),
	facilityService: null,

	reset: function(){
		this.crawlingCriteria = configs.get('crawlingCriteria') || {
	        totalImages: 50,
        	spendMins: 2,
		};

		this.startTime = new Date();
		this.pageResource.videos = [];
		this.pageResource.imagesNeedLoading = [];
		this.pageResource.cacheImages = [];
		this.pageResource.imageArray = [];
		this.pageResource.linkArray = [];
		this.pageResource.rearchedLinks = [];
	},

	getHost: function(url){
		try{
			var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
			return url.match(re)[1].toString();
		}catch(err){
			return "";
		}
	},

	removeItems: function (sourceArray, reachedArray){
		return _.filter(sourceArray, function(link){
			return !_.contains(reachedArray, link);
		})
	},
	
	/*
	*	Crawl facility website
	*	Pass websiteURL if wanna debug
	*/
	crawlMedia: function(websiteURL, fn){
		var services = ["Facility", "Photo"],
			self = this,
			db = new DatabaseManager(configs);
		var debugPageResource = null;

		db.init(services, function(){
			self.facilityService = db.getInstance("Facility");
			self.photoService = db.getInstance("Photo");
			self.facilityService.getCrawlingFacilities(websiteURL, function(err, facilities){
				console.log('Total facilities :%s', facilities.length);
				if(err || !facilities) fn && fn(err, null);
				else{
					async.eachSeries(facilities, function(facility, done){

						if(facility.websiteURL && facility.websiteURL.length > 0){
							console.log('URL:%s', facility.websiteURL);
							self.crawlPhotoVideo(facility.websiteURL, function(pageResource){
								if(websiteURL){
									debugPageResource = pageResource;
								}
								//Update the facility crawl status
								var tempLength = pageResource.videos &&  pageResource.videos.length;
								var videos = [];

								_.each(pageResource.videos, function(url){
									videos.push({url : url});
								})

								console.log(videos);
								self.facilityService.modelClass.findOneAndUpdate({_id : facility._id}, {isCrawl: true, crawlPhotos: pageResource.imageArray.length, crawlVideos: pageResource.videos.length, $pushAll: { 'video' : videos }, $inc : { videoCount : pageResource.videos.length}, spendTime: pageResource.spendTime}, function(err, savedfacility){
									console.log('ID: %s, websiteURL: %s, crawlPhotos: %s, crawlVideos: %s, spendTime: %s', savedfacility._id, savedfacility.websiteURL, savedfacility.crawlPhotos, savedfacility.crawlVideos, savedfacility.spendTime);
									if(err) done && done(err);
									else{
										//Insert photos url
										self.photoService.createBundle(facility._id, pageResource.imageArray, function(err){
											done && done();
										})
									}
								});
							});
						} else{
							done && done();
						}
					}, function(err){
						//Return value for testing purpose
						if(websiteURL){
							fn && fn(err, debugPageResource);
						} else{
							fn && fn(err);
						}
					});
					
				}
			})
		});

	},

	/*
	*	Crawl both image and video
	*/
	crawlPhotoVideo: function(url, fn, deepIndex){
		this.reset();
		this.crawlType = 'media';
		this.crawl(url, fn, deepIndex);
	},

	/*
	*	Crawl images
	*/
	crawlImages: function(url, fn, deepIndex){
		this.reset();
		this.crawlType = 'image';
		this.crawl(url, fn, deepIndex);
	},

	/*
	*	Crawl video
	*/
	crawlVideos: function(url, fn, deepIndex){
		this.reset();
		this.crawlType = 'video';
		this.crawl(url, fn, deepIndex);
	},

	crawl: function(url, fn, deepIndex, host, startTime){
		var self = this;

		if (!host) host = this.getHost(url);
		//If url is in valid format then stop crawl process
		if (!host || host.length == 0){
			fn && fn(self.pageResource);
		} else{

			if (!deepIndex) deepIndex = 0;
			if (!startTime) startTime = new Date();

			if (!this.pageResource.linkArray[deepIndex])
				this.pageResource.linkArray[deepIndex] = [];
			
			crawler = spawn('phantomjs', [this.siteCrawlerJSFile, url, this.crawlType]);

			
			crawler.stdout.setEncoding('utf8');
			crawler.stderr.setEncoding('utf8');

			crawler.stderr.on('data', function(data){
				console.log('stderr:' + data);
			});

			var processData = '';

			crawler.stdout.on('data', function(data) {
				console.log(data);
				processData = processData.concat(data);
			});

			crawler.stdout.on('end', function() {

				var page;

				try{
					page = JSON.parse(processData);
				} catch(err){
					console.log(err);
					return fn && fn(self.pageResource);
				}

				if(page){
					
					//Remove duplicate, checked dimension image url
					////Find new images
					self.pageResource.imagesNeedLoading =  _.union([], page.images);
					self.pageResource.imagesNeedLoading = _.reject(self.pageResource.imagesNeedLoading, function(url){
						return _.contains(self.pageResource.cacheImages, url);
					});
					////Store new image to cache
					self.pageResource.cacheImages = _.union(self.pageResource.cacheImages, page.images);
					self.pageResource.videos = _.union(self.pageResource.videos, page.videos);

					if (!self.pageResource.linkArray[deepIndex + 1])
						self.pageResource.linkArray[deepIndex + 1] = [];
					
					//Remove external link
					page.linkArray = _.reject(page.linkArray, function(link){
						return link.indexOf(host) < 0;
					});

					self.pageResource.linkArray[deepIndex + 1] = _.union(self.pageResource.linkArray[deepIndex + 1], page.linkArray);

				}

				//Add the current URL has been processed to reachedLink
				self.pageResource.rearchedLinks.push(url);

				//Remove reached link out.
				self.pageResource.linkArray[deepIndex] = self.removeItems(self.pageResource.linkArray[deepIndex], self.pageResource.rearchedLinks);
				self.pageResource.linkArray[deepIndex + 1] = self.removeItems(self.pageResource.linkArray[deepIndex + 1], self.pageResource.rearchedLinks);

				//Update spend time
				self.pageResource.spendTime = (new Date() - startTime)/60000;

				//Validate image dimension
				if(self.crawlType === 'media'){
					//console.log(self.pageResource.imagesNeedLoading.length);
					async.reject(self.pageResource.imagesNeedLoading, function(imageURL, done){
						imageChecker.getDimension(imageURL, function(result){
							done && done(!result || !result.status);
						})
					}, function(results){
						self.pageResource.imageArray = _.union(self.pageResource.imageArray, results);

						//console.log('images: %s', self.pageResource.imageArray.length);
						if(self.pageResource.imageArray >= self.crawlingCriteria.totalImages
							||
							self.pageResource.spendTime > self.crawlingCriteria.spendMins
						){
							fn && fn(self.pageResource);
						}
						else {
							crawler = null;
							if (self.pageResource.linkArray[deepIndex].length > 0){
								self.crawl(self.pageResource.linkArray[deepIndex][0], fn, deepIndex, host, startTime);
							}
							else{
								deepIndex++;
								if (self.pageResource.linkArray[deepIndex] && self.pageResource.linkArray[deepIndex].length > 0){
									self.crawl(self.pageResource.linkArray[deepIndex][0], fn, deepIndex, host, startTime);
								} else{
									
									fn && fn(self.pageResource);
								}
							}
						}
					});
				//Video | image
				} else{
					async.reject(self.pageResource.imagesNeedLoading, function(imageURL, done){
						imageChecker.getDimension(imageURL, function(result){
							done && done(!result || !result.status);
						})
					}, function(results){
						self.pageResource.imageArray = _.union(self.pageResource.imageArray, results);
						if (self.pageResource.linkArray[deepIndex].length > 0){
							crawler = null;
							self.crawl(self.pageResource.linkArray[deepIndex][0], fn, deepIndex, host, startTime);
						}
						else if (deepIndex < self.DEEPLINK){
							deepIndex++;
							if (self.pageResource.linkArray[deepIndex] && self.pageResource.linkArray[deepIndex].length > 0){
								crawler = null;
								self.crawl(self.pageResource.linkArray[deepIndex][0], fn, deepIndex, host, startTime);
							}
						}
						else {
							fn && fn(self.pageResource);
						}
					});
				}
			});
		}
	}
} 

