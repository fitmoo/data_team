/* Global define */
define([
	'handlebars',

	// facility item template
	'hbs!templates/media/find-photo-item',

	'backbone.marionette'
], function(
	Handlebars,
	photoItemTpl
) {
	'use strict';

	var PhotoItemView = Backbone.View.extend({
		tagName: 'option',

		i: 0,

		events: {
			// 'click .btn': 'onRemove'
		},
		
		onRemove: function() {
			var confirmPopup = confirm('Are you sure you wish to delete?');

			if (confirmPopup === true) {
				console.log('Delete facility', this.model);
				this.model.destroy();
			}
		},

		render: function() {
			var id = this.model.get('id');
			this.$el.attr('data-img-src', this.model.get('sourceURL'));
			this.$el.attr('value', id);
		}
	});

	return PhotoItemView;
});