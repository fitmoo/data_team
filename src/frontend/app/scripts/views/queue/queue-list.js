/* Global define */
define([
	// facility item view
	'views/queue/queue-item',

	'collections/queue',
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

	var QueueList = Backbone.Marionette.CollectionView.extend({
		itemView: facilityView,

		el: '.queue-content',

		initialize: function(opt) {
			this.collection = new facilitiesList();
			if (typeof opt === 'undefined')
				this.collection.fetch();

		},

		onRender: function() {
			_.defer( function( view ){
				Backbone.EventBroker.trigger('queue:hideIndicator');
			});
		}
	});

	return QueueList;
});