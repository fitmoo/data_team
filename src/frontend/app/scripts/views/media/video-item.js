/* Global define */
define([
	'handlebars',

	// template
	'hbs!templates/media/video',

	'backbone.marionette'
], function(
	Handlebars,
	videoTpl
) {
	'use strict';

	var MediaLayout = Backbone.Marionette.ItemView.extend({
		template: videoTpl,

		tagName: 'li',

		events: {
			'click .remove-btn': 'onRemove'
		},

		onRemove: function() {
			var confirmPopup = confirm('Are you sure you wish to delete?');

			if (confirmPopup === true) {
				console.log('DELETE video:', this.model);
				this.model.destroy();
			}
		}
	});

	return MediaLayout;
});