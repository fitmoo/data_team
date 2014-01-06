/* Global define */
define([
	//views
	'views/events/events-list-item',

	// collection
	'collections/events',

	'backbone.marionette'
], function(
	eventsItem,
	eventsCollection
) {
	'user strict';

	var EventsListView = Backbone.Marionette.CollectionView.extend({
		el: '.events-content',

		itemView: eventsItem,

		initialize: function(opt) {
			this.collection = new eventsCollection();
			if (typeof opt === 'undefined')
				this.collection.fetch();
		},

		onRender: function() {
			_.defer( function( view ){
				Backbone.EventBroker.trigger('events:hideIndicator');
			});
		}
	});

	return EventsListView;
});