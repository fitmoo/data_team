/* Global define */
define([
	// template
	'hbs!templates/classes/classes-list-item',

	'backbone.marionette'
], function(
	classItemTpl
) {
	'user strict';

	var ClassItemView = Backbone.Marionette.ItemView.extend({
		template: classItemTpl,

		tagName: 'tr',

		events: {
			'click .btn': 'onRemove'
		},

		onRemove: function() {
			var confirmPopup = confirm('Are you sure you wish to delete?');

			if (confirmPopup === true) {
				console.log('Remove class', this.model);
				this.model.destroy();
			}
		}

	});

	return ClassItemView;
});