/* Global define */
define([
	'handlebars',

	// sidebar templates
	'hbs!templates/views/sidebar',
  'hbs!templates/views/data-entry-sidebar',

	'backbone-eventbroker',
	'backbone.marionette'
],
function (
	Handlebars,
	sidebarTpl,
  dataEntrySidebarTpl,
	EventBoker
) {
	'use strict';

	var SideBarView = Backbone.Marionette.ItemView.extend({
		ui: {
			menu: 'li'
		},

		el: '#sidebar',

		template: sidebarTpl,

		events: {
			'click li': 'onMenuClick'
		},

		initialize: function(opts) {
			if (opts.isDataEntry) {
				this.template = dataEntrySidebarTpl;
			}

			EventBoker.register({
				'views:other': 'onOtherView'
			},this);
		},

		onMenuClick: function(e) {
			var target = $(e.target).closest('li'),
					menuId = target.attr('menu-id'),
					menu = this.ui.menu,
					history = Backbone.history;

			this.ui.menu.removeClass('active');
			target.addClass('active');
			Backbone.EventBroker.trigger('advSearchPopup:hide');

			if (this.currentView !== menuId) {
				this.currentView = menuId;
			}

			switch(menuId) {

				case 'notification':
					history.navigate('#notification', {trigger: true});
					break;

				case 'facilities':
					if (menu.hasClass('on-search')) {
						console.log('Re-init facilities data');

						// REMOVE search value
						Backbone.EventBroker.trigger('search:removeVal');
						target.removeClass('on-search');

						// re-init default facilities
						Backbone.EventBroker.trigger('facilities:reset');
					}
					Backbone.EventBroker.trigger('facilitiesHeader:show');
					history.navigate('#facilities', {trigger: true});
					break;

				case 'classes':
					if (menu.hasClass('on-search')) {
						console.log('Re-init classes data');

						// REMOVE search value
						Backbone.EventBroker.trigger('search:removeVal');
						target.removeClass('on-search');

						// re-init default classes
						Backbone.EventBroker.trigger('classes:reset');
					}
					Backbone.EventBroker.trigger('classesHeader:show');
					history.navigate('#classes', {trigger: true});
					break;

				case 'events':
					if (menu.hasClass('on-search')) {
						console.log('Re-init events data');

						// REMOVE search value
						Backbone.EventBroker.trigger('search:removeVal');
						target.removeClass('on-search');

						// re-init default events
						Backbone.EventBroker.trigger('events:reset');
					}
					Backbone.EventBroker.trigger('eventsHeader:show');
					history.navigate('#events', {trigger: true});
					break;

				case 'tags':
					history.navigate('#tags', {trigger: true});
					break;

				case 'export':
					history.navigate('#export', {trigger: true});
					break;

				case 'photos':
					history.navigate('#photos', {trigger: true});
					break;

				case 'queue':
					history.navigate('#queue', {trigger: true});
					break;

				default:
					history.navigate('#home', {trigger: true});
					break;
			}

		},

		onOtherView: function() {
			this.ui.menu.addClass('on-search');
		}
	});

	return SideBarView;
});