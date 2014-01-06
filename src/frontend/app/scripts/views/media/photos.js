/* Global define */
define([
	// collections
	'collections/photos',

	// views
	'views/media/photo-item',

	'backbone.marionette'
], function(
	photos,
	photoView
) {
	'use strict';

	var PhotosLayout = Backbone.Marionette.CollectionView.extend({
		itemView: photoView,

		el: '.photos-list',

		initialize: function(opts) {
			this.collection = new photos();
			this.collection.reset(opts);
		}
	});

	return PhotosLayout;
});