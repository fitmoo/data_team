/* Global define */
define([
	'handlebars',

	// facility item template
	'hbs!templates/photos/photo-item',

	'backbone.marionette'
], function(
	Handlebars,
	photoItemTpl
) {
	'use strict';

	var PhotoItemView = Backbone.Marionette.ItemView.extend({
		tagName: 'li',

		template: photoItemTpl,

		i: 0,

		events: {
			'click .thumbnail': 'onSelectionPhoto'
		},
		
		onRemove: function() {
			var confirmPopup = confirm('Are you sure you wish to delete?');

			if (confirmPopup === true) {
				console.log('Delete facility', this.model);
				this.model.destroy();
			}
		},

		onSelectionPhoto: function(e) {
			e.preventDefault();
			var target = $(e.target),
					id = target.attr('id');

			if (target.hasClass('selected'))
				// remove selected photo in photo selected array
				Backbone.EventBroker.trigger('photo:removed', id);
			else
				// add selected photo to photo selected array
				Backbone.EventBroker.trigger('photo:selected', id);
			
			target.toggleClass('selected');
		}
	});

	return PhotoItemView;
});