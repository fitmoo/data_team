/* Global define */
define([
	'handlebars',

	// facility item template
	'hbs!templates/queue/queue-item',

	'backbone.marionette'
], function(
	Handlebars,
	facilityItemTpl
) {
	'use strict';

	var FacilityItemView = Backbone.Marionette.ItemView.extend({
		template: facilityItemTpl,
		
		tagName: 'tr',

		// events: {
		// 	'click .btn': 'onRemove'
		// },

		// onRemove: function() {
		// 	var confirmPopup = confirm('Are you sure you wish to delete?');

		// 	if (confirmPopup === true) {
		// 		console.log('Delete facility', this.model);
		// 		this.model.destroy();
		// 	}
		// }
	});

	return FacilityItemView;
});