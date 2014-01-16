/* Global define */
define([
	'handlebars',
	'backbone-eventbroker',
	'models/session',

	// sidebar templates
	'hbs!templates/views/header',

	// collections
	'collections/classes',
	'collections/events',
	'collections/facilities',

	'jquery.datepicker',

	'backbone.marionette'
],
function (
	Handlebars,
	EventBroker,
	Session,
	headerTpl,
	classes,
	events,
	facilities
) {
	'use strict';

	var HeaderView = Backbone.Marionette.ItemView.extend({
		template: headerTpl,

		ui: {
			search: '.search-query',
			advanceSearch: '.popover',
			advSearchText: '#advanced-search',
			priceFrom: '#adv-price-from',
			priceTo: '#adv-price-to',
			startDate: '#adv-startDateTime',
			endDate: '#adv-endDateTime',
			searchDate: '.adv-date',
			username: '#user-name',
			searchWrapper: '.m-search',
			searchBtn: '.btn-search'
		},

		events: {
			'click .btn-search': 'search',
			'click .btn-search-adv': 'advancedSearch',
			'click .advanced-search': 'toggleAdvancedSearch',
			'keyup :input': 'onPressKey',
			'click #logout': 'logout'
		},

		initialize: function() {
			EventBroker.register({
				'search:removeVal': 'removeValue',
				'session:logged': 'onLogin',
				'advSearch:show': 'showAdvSearch',
				'advSearch:hide': 'hideAdvSearch',
				'advSearchPopup:hide': 'hideAdvSearchPopup',
				'search:hide': 'hideSearch',
				'search:show': 'showSearch'
			},this);
		},

		toggleAdvancedSearch: function() {
			this.ui.advanceSearch.toggleClass('show');
			var currentView = Backbone.history.fragment;
			if (currentView === 'classes') {
				this.ui.searchDate.hide();
			} else {
				this.ui.searchDate.show();
			}
		},

		onPressKey: function(e) {
			e.preventDefault();
			var keycode = e.which;
			if(keycode === 65 || keycode === 97 || keycode === 67 || keycode === 99 || keycode === 86 || keycode === 118) {
				e.stopPropagation();
			}
			// press enter to searching
			if (keycode === 13)
				this.search();
		},

		onLogin: function() {
			var user = Session.get('user');
			if (user)
				this.ui.username.html(user.username);
		},

		logout: function() {
			console.log("Logout");
			Session.logout();
		},

		showAdvSearch: function() {
			this.ui.advSearchText.show();
		},

		hideAdvSearch: function() {
			this.ui.advSearchText.hide();
		},

		hideAdvSearchPopup: function(e) {
			this.ui.advanceSearch.removeClass('show');
		},

		hideSearch: function() {
			// this.ui.search.hide();
			// this.ui.searchBtn.hide();
			this.ui.search.attr('disabled', 'disabled');
			this.ui.searchBtn.hide();
		},

		showSearch: function() {
			this.ui.search.removeAttr('disabled');
			this.ui.searchBtn.show();
		},

		search: function() {
			var self = this,
					searchVal = this.ui.search.val().trim(),
					currentView = Backbone.history.location.hash.split('/')[0];

			console.log('Search: ', searchVal, currentView);
			switch	(currentView) {
				case '#classes':
					this.searchClasses('default', searchVal);
					break;

				case '#events':
					this.searchEvents('default', searchVal);
					break;

				default:
						Backbone.EventBroker.trigger('facilitiesHeader:hide');
						Backbone.EventBroker.trigger('facilities:clear');
						Backbone.EventBroker.trigger('facilities:showIndicator');

						if (!this.facilitiesCollection) {
							this.facilitiesCollection = new facilities();
						}
						this.facilitiesCollection.server_api.sort = '{"orderBy":"","columnName":""}';
						// set search parameter value
						this.facilitiesCollection.server_api.search = searchVal;

						// show facilities view & result
						Backbone.EventBroker.trigger('views:hide');
						Backbone.EventBroker.trigger('facilities:show');
						Backbone.EventBroker.trigger('facilities:load');
						
						// reset current paginator to 1
						Backbone.EventBroker.trigger('facilitiesPages');
						Backbone.EventBroker.trigger('views:other');
					break;
			}
			
			Backbone.history.navigate(currentView);
		},

		advancedSearch: function() {
			var self = this,
					currentView = Backbone.history.location.hash.split('/')[0],
					priceFrom = this.ui.priceFrom.val().trim(),
					priceTo = this.ui.priceTo.val().trim();

			switch (currentView) {
				case '#classes':
					if ( priceFrom != priceFrom.replace(/[^0-9\.]/g)) {
						this.ui.priceFrom.parent().addClass('error');
						return false;
					} else {
						this.ui.priceFrom.parent().removeClass('error');
					}

					if ( priceTo != priceTo.replace(/[^0-9\.]/g)) {
						this.ui.priceTo.parent().addClass('error');
						return false;
					} else {
						this.ui.priceTo.parent().removeClass('error');
					}

					if (priceTo === "" && priceFrom === "")
						return false;
					
					console.log('Classes advanced search',priceFrom,priceTo);

					var val = {
						priceTo: priceTo,
						priceFrom: priceFrom
					};
					this.searchClasses('advancedSearch', val);

					break;

				case '#events':
					if ( priceFrom != priceFrom.replace(/[^0-9\.]/g)) {
						this.ui.priceFrom.parent().addClass('error');
						return false;
					} else {
						this.ui.priceFrom.parent().removeClass('error');
					}

					if ( priceTo != priceTo.replace(/[^0-9\.]/g)) {
						this.ui.priceTo.parent().addClass('error');
						return false;
					} else {
						this.ui.priceTo.parent().removeClass('error');
					}
					console.log('Events advanced search',priceFrom,priceTo);

					var val = {
						priceTo: priceTo,
						priceFrom: priceFrom,
						startDate: this.ui.startDate.val(),
						endDate: this.ui.endDate.val()
					};
					this.searchEvents('advancedSearch', val);

					break;

				// default: 

			}

			this.ui.advanceSearch.find('input').val('');
			this.hideAdvSearchPopup();
		},

		searchClasses: function(opts, val) {
			console.log(opts, val);

			Backbone.EventBroker.trigger('classesHeader:hide');
			Backbone.EventBroker.trigger('classes:clear');
			Backbone.EventBroker.trigger('classes:showIndicator');

			if (!this.classesCollection) {
				this.classesCollection = new classes();
			}
			this.classesCollection.server_api.sort = '{"orderBy":"","columnName":""}';
			if (opts === 'default') {
				// set search parameter value
				this.classesCollection.server_api.search = val;
				this.classesCollection.server_api.advanceSearch = '';
			} else {
				this.classesCollection.server_api.search = "";
				this.classesCollection.server_api.advanceSearch = ['{"minPrice":"', val.priceFrom, '","maxPrice":"', val.priceTo, '"}'].join('');
			}

			// show facilities view & result
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('classes:show');
			Backbone.EventBroker.trigger('classes:load');
			
			// reset current paginator to 1
			Backbone.EventBroker.trigger('classesPages:reset');
			Backbone.EventBroker.trigger('views:other');
		},

		searchEvents: function(opts, val) {

			Backbone.EventBroker.trigger('eventsHeader:hide');
			Backbone.EventBroker.trigger('events:clear');
			Backbone.EventBroker.trigger('events:showIndicator');

			if (!this.eventsCollection) {
				this.eventsCollection = new events();
			}
			
			this.eventsCollection.server_api.sort = '{"orderBy":"","columnName":""}';
			if (opts === 'default') {
				// set search parameter value
				this.eventsCollection.server_api.search = val;
				this.eventsCollection.server_api.advanceSearch = '';
			} else {
				this.eventsCollection.server_api.search = "";
				this.eventsCollection.server_api.advanceSearch = ['{"minPrice":"', val.priceFrom, '","maxPrice":"', val.priceTo, '","startDate":"', val.startDate, '","endDate":"', val.endDate, '"}'].join('');
				console.log(this.eventsCollection.server_api.advanceSearch);
			}

			// show facilities view & result
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('events:show');
			Backbone.EventBroker.trigger('events:load');
			
			// reset current paginator to 1
			Backbone.EventBroker.trigger('eventPages:reset');
			Backbone.EventBroker.trigger('views:other');

		},

		removeValue: function() {
			this.ui.search.val('');
		},

		onRender: function() {
			this.onLogin();
			this.ui.startDate.datepicker();
			this.ui.endDate.datepicker();
		}
	});

	return HeaderView;
});