/* Global define */
define([
	'api',
	'models/session',
	'backbone-eventbroker',
	// collections
	'collections/photos-selection',

	// views
	'views/photos/photo-item',
	'infiniScroll',
	
	'image.picker',

	'backbone.marionette'
], function(
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

		initialize: function(opts) {
			var self = this;

			EventBroker.register({
				'photo:nextPage': 'loadingNextPage'
			}, this);
			this.collection = new photos();

			this.listenTo(this.collection, 'reset', function() {
				self.loadingNextPage();
			});

    	this.collection.onLoadingProgress = true;
			this.collection.fetch();
		},

		onRender: function() {
			var self = this,
				options = {
					pageSize: 50,
					scrollOffset: 1000,
					includePage: true,
					api: api,
					token: Session.get('user').token,
					success: function(collection, data) {
						// console.log(data);
						// collection.add(data);
						// console.log(collection);
					}
				};
			this.infiniScroll = new Backbone.InfiniScroll(this.collection, options);
			this.$el.imagepicker();
		},

		loadingNextPage: function() {
			var self = this;

			// only loading next one pagination
    	if (self.collection.onLoadingProgress) {
    		self.collection.onLoadingProgress = false;
  			self.collection.page = self.collection.page + 1;

  			// loading images of next pagination
				api.get(['photos?token=', Session.get('user').token, '&page=', self.collection.page].join(''), {}, function(res) {
					// save next pagination data
					self.collection.nextPage = res;
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
					    // console.log(e.completedCount + ' / ' + e.totalCount);
					    if (e.completedCount === e.totalCount) {
					    	self.collection.onLoadingProgress = true;
								self.collection.putLastestId = true;
					    	console.log('Finished load page', self.collection.page);
					    }
						});
						 
						loader.start();
					}
				});
    	}
				

		}
	});

	return PhotosLayout;
});