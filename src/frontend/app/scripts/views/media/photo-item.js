/* Global define */
define([
	'handlebars',

	// template
	'hbs!templates/media/photo',

	'backbone.marionette'
], function(
	Handlebars,
	photoTpl
) {
	'use strict';

	var MediaLayout = Backbone.Marionette.ItemView.extend({
		template: photoTpl,

		tagName: 'li',

		className: 'span4',

		events: {
			'click .remove-btn': 'onRemove'
		},

		onRemove: function() {
			var confirmPopup = confirm('Are you sure you wish to delete?');

			if (confirmPopup === true) {
				console.log('DELETE photo:', this.model);
				this.model.destroy();
			}
		}
		
	});

	return MediaLayout;
});