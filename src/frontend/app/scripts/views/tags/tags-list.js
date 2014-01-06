/* Global define */
define([
	// collection
	'collections/tags',

	// view
	'views/tags/tag-item',

	'backbone.marionette'
], function(
	tagsCollection,
	tagItemView
) {
	'use strict';

	var tagList = Backbone.Marionette.CollectionView.extend({
		itemView: tagItemView,

		el: '.tags-content',

		initialize: function() {
			var self = this;
			this.collection = new tagsCollection();
			this.collection.fetch();
		},

		onRender: function() {
			_.defer(function( view ){
				Backbone.EventBroker.trigger('tags:hideIndicator');
			});
		}
	});

	return tagList;
});