/* Global define */
define([
	'backbone-eventbroker',
	'conf',
	'models/session',
	'models/photo-selection',

	// backbone paginator
	'backbone.paginator',
	'pxLoaderImage'
], function(
	EventBroker,
	conf,
	Session,
	photo
){
	'use strict';

	var PhotosSelection = Backbone.Paginator.requestPager.extend({
		model: photo,

		paginator_core: {
			type: 'GET',
			dataType: 'json',
			url: function() {
				return conf.PREFIX + 'photos?token=' + Session.get('user').token;
			}
		},

		paginator_ui: {
			firstPage: 1,
			page: 1,
			nextOnePage: [],
			nextTwoPage: [],
			putLastestId: true,
			perPage: conf.PHOTO_LIMIT,
			totalPages: 50
		},

		server_api: {
			'perPage': function() { return this.perPage; },
			'page': function() { return this.page; }
		},

		parse: function(res) {
			console.log(res);

			// redirect to login page when Token invalid
			Backbone.EventBroker.trigger('token:invalid', res);

			if (res.msg) {
				alert('Server returned error');
			} else if (res.photos.length === 0 || res.totalRecords === 0) {
				Backbone.EventBroker.trigger('photosIndicator:hide');
				alert('Have no photo');
			} else {
				// show indicator when loading images
				Backbone.EventBroker.trigger('photosIndicator:show');
				var loader = new PxLoader(),
						self = this; 
				
				// reset facilitities collection
				_.each(res.photos, function(photo) {
					var pxImage = new PxLoaderImage(photo.sourceURL);
					loader.add(pxImage);
				});

				// checking loading images progress
				loader.addProgressListener(function(e) { 
			    // the event provides stats on the number of completed items 
			    console.log(e.completedCount + ' / ' + e.totalCount);
			    if (e.completedCount === e.totalCount) {
						self.page = res.currentPage;
						self.reset(res.photos);

						// hide indicator
			    	Backbone.EventBroker.trigger('photosIndicator:hide');
			    }
				});
				 
				loader.start();
			}
			
			return res.photos;
		}
	});

	return PhotosSelection;

});