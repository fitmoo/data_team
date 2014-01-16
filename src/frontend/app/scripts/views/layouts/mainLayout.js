/* Global define */
define([
  'handlebars',

	// header template
	'hbs!templates/mainLayout',

	'backbone-eventbroker',
	'backbone.marionette'
], function(
  Handlebars,
	mainLayoutTpl,
	Eventboker
) {
	'use strict';

	var MainLayout = Backbone.Marionette.Layout.extend({
		template: mainLayoutTpl,

		el: '#main',
		
		regions: {
			header: '#header',
			sidebar: '#sidebar',
			layout: '#main-container'
		},
		ui: {
			layout: '#main-container'
		},

		initialize: function() {
			Eventboker.register({
				'views:hide': 'hideViews'
			},this);

			$(document).bind('keyup', function(e) {
				e.preventDefault();
				var keycode = e.keyCode,
						location = Backbone.history.location.hash.split('/'),
						path = location[0],
          	subPath = location[1],
						currentView = Backbone.history.fragment;

				if (keycode === 65 || keycode === 97) {
					if (currentView === 'facilities') {
						Backbone.history.navigate('#create-facility', {trigger: true});
					} else if (currentView === 'events') {
						Backbone.history.navigate('#create-event', {trigger: true});
					} else if (currentView === 'tags') {
						Backbone.EventBroker.trigger('tags:showCreateForm');
					}
				} if (((path === '#facilities' && subPath) || path === '#create-facility') && (keycode === 99 || keycode ===67)) {
					Backbone.EventBroker.trigger('class:new');
				} if ((keycode === 118 || keycode === 86) && path === '#facilities'  && subPath) {
					Backbone.EventBroker.trigger('facility:verify');
				}
			});
		},

		hideViews: function() {
			this.ui.layout.find('.layout-fluid').hide();
		}
	});

	return MainLayout;
});