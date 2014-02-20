/* Global define */
define([
	'conf',
	'api',
	'models/session',
	'backbone-eventbroker',
	// collections
	'collections/photos-selection',

	// views
	'views/photos/photo-item',
	'infiniScroll',

	'backbone.marionette'
], function(
	conf,
	api,
	Session,
	EventBroker,
	photos,
	photoView,
	waypoint
) {
	'use strict';

	var PhotosLayout = Backbone.Marionette.CollectionView.extend({
		itemView: photoView,

		el: '#photo-selection',

		// array photo selected
		photoSelectedList: [],

		initialize: function(opts) {
			var self = this;

			EventBroker.register({
				'photo:nextPage': 'loadingNextPage',
				'photo:selected': 'onSelectedPhoto',
				'photo:removed': 'onRemovedPhoto'
			}, this);
			this.collection = new photos();
			this.endOfPage = 0;

			this.listenTo(this.collection, 'reset', function() {
				self.loadingNextPage();
			});

    	this.collection.onLoadingProgress = true;
    	this.collection.fetch();
		},

		onRender: function() {
			var self = this,
				options = {
					pageSize: conf.PHOTO_LIMIT,
					scrollOffset: 1000,
					includePage: true,
					api: api,
					token: Session.get('user').token,
					success: function(collection, data, currentPage) {
						var photoLimitSize = conf.PHOTO_LIMIT,
								length = self.collection.length,
								dataLength = data.length;

						// scroll to last child of the first page
						$(window).scrollTop(self.scrollHeight);
						// delete first page and add new page when current page > 2 (100 items)
						if (length >= photoLimitSize*2 || dataLength === 0) {
							var firstPage;

							// check last photo page
							if (self.endOfPage) {
    						self.collection.onLoadingProgress = false;
								firstPage = self.collection.models;
							} else {
								firstPage = self.collection.slice(0, photoLimitSize);
							}
							if (firstPage.length > 0) {
								var firstPhotoId = firstPage[0].id,
		            		lastPhotoId = firstPage[firstPage.length - 1].id,
		            		deletedPhotos = self.photoSelectedList,
				            dataVal = {
				              deletedPhotos: deletedPhotos,
				              latestPhoto: lastPhotoId,
				              firstPhoto: firstPhotoId
				            };

								self.collection.putLastestId = true;
		            self.deletePhotos(dataVal);
								self.collection.remove(firstPage);

								// alert when have no photos to loading
								if (self.endOfPage) {
									$(window).scrollTop(30);
									alert('Have no photo');
								}

								if (currentPage) {
									self.endOfPage = true;
								}

							}
						}

						self.collection.add(data);
						self.loadingNextPage();

					}
				};
			this.infiniScroll = new Backbone.InfiniScroll(this.collection, options);
			this.scrollHeight = _.clone($('#photos').height() - 150);
		},

		loadingNextPage: function() {
			var self = this;

			// only loading next one pagination
    	if (self.collection.onLoadingProgress) {
    		this.collection.onLoadingProgress = false;
				self.collection.page = self.collection.page+1;

  			// loading images of next pagination
				api.get(['photos?token=', Session.get('user').token, '&perPage=', conf.PHOTO_LIMIT, '&page=', self.collection.page].join(''), {}, function(res) {
					console.log(res);
					var nextTwoPageSize = self.collection.nextTwoPage.length,
							nextOnePageSize = self.collection.nextOnePage.length,
							loadedPage = self.collection.page;
					if (loadedPage < res.currentPage) {
						self.collection.page = res.currentPage;
						
						if (nextTwoPageSize > 0)
							self.collection.nextTwoPage = res;
						else
							self.collection.nextOnePage = res;

					} else {
						// save next pagination data
						if (nextOnePageSize === 0 && nextTwoPageSize === 0) {
							self.collection.nextOnePage = res;
						} else if (self.collection.nextOnePage.currentPage === loadedPage - 1  ) {
							self.collection.nextTwoPage = res;
						} else {
							self.collection.nextOnePage = self.collection.nextTwoPage;
							self.collection.nextTwoPage = res;
						}

					}
					if (res.photos.length > 0) {
						var loader = new PxLoader();
					
						// reset facilitities collection
						_.each(res.photos, function(photo) {
							var pxImage = new PxLoaderImage(photo.sourceURL);
							loader.add(pxImage);
						});

						// checking loading images progress
						loader.addProgressListener(function(e) {
					    // the event provides stats on the number of completed items
					    if (e.completedCount === e.totalCount) {
								self.collection.putLastestId = true;
					    	console.log('Finished load page', res.currentPage);
					    	self.collection.onLoadingProgress = true;

					    	// load next two page if next one page was loaded
					    	if (loadedPage !== self.collection.nextTwoPage.currentPage) {
					    		self.loadingNextPage();
					    	}
					    }
						});
						 
						loader.start();
					} else {
			    	self.collection.onLoadingProgress = true;
					}
				});
    	}
		},

		deletePhotos: function(data) {
			var self = this,
					responseIds = [];

      if (this.collection.putLastestId) {
            
        if (data.firstPhoto) {
          console.log('Delete photos viewed:', data);
          this.collection.putLastestId = false;
          api.put(['photos?token=', Session.get('user').token, '&perPage=', conf.PHOTO_LIMIT].join(''), data, function(res) {
						console.log(self.photoSelectedList, res);
	      		// remove null item in array
						res = _.difference(res, [null]);
						_.each(res, function(photo, idx) {
							responseIds.push(photo.id);
							if (idx === res.length - 1 || photo === null) {
								// remove item deleted on server
								self.photoSelectedList = _.difference(self.photoSelectedList, responseIds);
								console.log(self.photoSelectedList);
							}
						});
          });
        }
      }

    },

    onSelectedPhoto: function(id) {
    	this.photoSelectedList.push(id);
    },

    onRemovedPhoto: function(id) {
    	this.photoSelectedList = _.without(this.photoSelectedList, id);
    }

	});

	return PhotosLayout;
});