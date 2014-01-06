/* Global define */
define([
	// collection
	'collections/classes-details',

	// views
	'views/classes-in-facilities/class-details-item',

	'backbone.marionette'
], function(
	classesDetailsCollection,
	classDetailsItem,
	EventBroker
) {
	'use strict';

	var ClassesDetailsList = Backbone.Marionette.CollectionView.extend({
		itemView: classDetailsItem,

		el: '.list-class-content',

		initialize: function(opts) {
			this.collection = new classesDetailsCollection();
			this.collection.reset(opts);
		}
	});

	return ClassesDetailsList;
});