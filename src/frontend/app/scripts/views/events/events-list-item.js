/* Global define */
define([
	'handlebars',

	// template
	'hbs!templates/events/events-list-item',

	'backbone.marionette'
], function(
	Handlebars,
	eventItemTpl
) {
	'use strict';

	var EventsListItem = Backbone.Marionette.ItemView.extend({
		template: eventItemTpl,

		tagName: 'tr',

		events: {
			'click .rm-event-btn': 'onRemove'
		},

		onRemove: function() {
			var confirmPopup = confirm('Are you sure you wish to delete?');

			if (confirmPopup === true) {
				console.log('Remove class', this.model);
				this.model.destroy();
			}
		}
	});

	return EventsListItem;
});