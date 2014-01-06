/* Global define */
define([
	// facility item view
	'views/facilities/facility-item',

	'collections/facilities',
	'conf',
	'backbone-eventbroker',

	'backbone.marionette'
], function(
	facilityView,
	facilitiesList,
	conf,
	Eventbroker
) {
	'use strict';

	var FacilitiesList = Backbone.Marionette.CollectionView.extend({
		itemView: facilityView,

		el: '.list-content',

		initialize: function(opt) {
			this.collection = new facilitiesList();
			if (typeof opt === 'undefined')
				this.collection.fetch();

		},

		onRender: function() {
		}
	});

	return FacilitiesList;
});