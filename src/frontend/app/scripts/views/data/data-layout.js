/* Global define */
define([
	'api',
	'models/session',

	// template
	'hbs!templates/data/data-layout',

	'backbone.marionette'
], function(
	api,
	Session,
	dataLayoutTpl
) {
	'use strict';

	var dataLayout = Backbone.Marionette.ItemView.extend({
		template: dataLayoutTpl,

		el: '#export-data',

		ui: {
			exportPopup: '#export-data-popup',
			waiting: '.waiting',
			modelBody: '.modal-body'
		},

		events: {
			'click .btn-primary': 'exportData'
		},

		show: function() {
			this.$el.show();
		},

		exportData: function() {
			console.log('Exporting data');
			var self = this,
					backdrop = $('#backdrop');

			// show waiting status
			this.ui.waiting.show();
			backdrop.show();

			api.get('exports?token=' + Session.get('user').token, null, function(res) {
				console.log(res);

				// hide waiting status
				self.ui.waiting.hide();
				backdrop.hide();

				// show export result popup
				self.ui.exportPopup.modal('show');
				self.ui.modelBody.html(['<a href="', res.url, '" target="_blank">', res.url, '</a>'].join(''));
			});
		}
	});

	return dataLayout;

});