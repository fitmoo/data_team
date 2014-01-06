/* Global define */
define([
	// views 
	'views/classes/classes-list-item',

	// collection
	'collections/classes',

	'backbone.marionette'
], function(
	classItem,
	classesCollection
) {
	'user strict';

	var ClassesListView = Backbone.Marionette.CollectionView.extend({
		itemView: classItem,

		el: '.classes-content',

		initialize: function(opt) {
			this.collection = new classesCollection();
			if (typeof opt === 'undefined')
				this.collection.fetch();
		},

		onRender: function() {
			_.defer( function( view ){
				Backbone.EventBroker.trigger('classes:hideIndicator');
			});
		},
	});

	return ClassesListView;
});