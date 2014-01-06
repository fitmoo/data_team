/* Global define */
define([
	'handlebars',
	'models/session',
	'api',

	// templates
	'hbs!templates/tags/tag-item',

	'backbone.marionette'
], function(
	Handlebars,
	Session,
	api,
	tagItemTpl
) {
	'use strict';

	var tagList = Backbone.Marionette.ItemView.extend({
		template: tagItemTpl,

		tagName: 'td',

		events: {
			'click .remove-btn': 'onRemove'
		},

		onRemove: function() {
			var confirmPopup = confirm('Are you sure you wish to delete?');

			if (confirmPopup === true) {
				console.log('Delete tags', this.model);
				this.model.destroy();
				console.log(this.model);
				api.del('tags?token=' + Session.get('user').token, [this.model.get('name')], function(res) {
					console.log(res);
					Backbone.EventBroker.trigger('tags:autocomplete', res, true);
				});
			}
		}
	});

	return tagList;
});