/* Global define */
define([

	// collections
	'collections/videos',

	// views
	'views/media/video-item',

	'backbone.marionette'
], function(
	videos,
	videoView
) {
	'use strict';

	var VideosLayout = Backbone.Marionette.CollectionView.extend({
		itemView: videoView,

		el: '.videos-list',

		initialize: function(opts) {
			this.collection = new videos();
			this.collection.reset(opts);
		}
	});

	return VideosLayout;
});