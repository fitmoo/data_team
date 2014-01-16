/* Global define */
define([
	'handlebars',
	'api',
	'models/session',
	'conf',
	'backbone-eventbroker',
	// template
	'hbs!templates/events/events',

	// views
	'views/events/events-list',

	'backbone.marionette'
], function(
	Handlebars,
	api,
	Session,
	conf,
	EventBroker,
	eventsLayoutTpl,
	eventsListView
) {
	'user strict';

	var EventsLayout = Backbone.Marionette.Layout.extend({
		template: eventsLayoutTpl,

		el: '#events',

		ui: {
			thead: '.sort-btn',
			listEvents: '.events-content',
			createForm: '#create-new-event',
			eventsList: '.events-list',
			totalPages: '.total-pages',
			currentPage: '.current-page',
			header: '.sub-header',
			indicator: '.indicator',
			crawlBtn: '#crawl-event'
		},

		events: {
			'click #add-new-event-btn': 'createEvent',
			'click .sort-btn': 'sortBy',
			'click .previous': 'previousPage',
			'click .next': 'nextPage',
			'click .goto-btn': 'goToPage',
			'keyup :input': 'onPressKey',
			'click #crawl-event': 'crawlEvents'
		},

		crawlStatus: true,

		initialize: function() {
			EventBroker.register({
				'events:totalPages': 'totalPages',
				'eventPages:reset': 'defaultPageOpts',
				'eventsHeader:hide': 'hideHeader',
				'eventsHeader:show': 'showHeader',
				'events:show': 'show',
				'events:load': 'loadEventsList',
				'events:reset': 'reInitEventsDefaultData',
				'events:hideIndicator': 'hideIndicator',
				'events:showIndicator': 'showIndicator',
				'events:clear': 'clearHtml'
			},this);
		},

		show: function() {
			this.$el.show();
			
			// render events list
			if(!this.eventsListView){
				this.showIndicator();
				this.eventsListView = new eventsListView();
				this.currentPage = 1;
				this.collection = this.eventsListView.collection;
			} else {
				this.checkCrawlEventStatus();
			}
		},

		createEvent: function() {
			var self = this,
					input = this.ui.createForm.find('input'),
					eventName = input.val().trim(),
					data = {
						eventName: eventName
					};

			if (eventName) {
				console.log('Create new Event have name:', eventName);

				// create new event
				api.post('events?token='+ Session.get('user').token, data, function(res) {
					console.log(res);

					// redirect to login page when Token invalid
					Backbone.EventBroker.trigger('token:invalid', res);

					// remove text input value
					input.val('');
					// add new event to events collection
					self.collection.add(res);
					// go to edit event page if create success
					Backbone.history.navigate('/#events/' + res.id);
				});
			}
		},

		sortBy: function(e) {
			var target = $(e.target).closest('.sort-btn'),
					sortBy = target.attr('sortBy'),
					self = this;console.log(this.collection);

			console.log('Sort by:', sortBy);

			// UI handling
			this.ui.thead.removeClass('sorting active');
			target.addClass('sorting active')
						.removeClass('arrow-default')
						.toggleClass('asc');

			var sortParam = this.collection.server_api;

			// reset current page to 1
			this.defaultPageOpts();

			if (target.hasClass('asc'))
				sortParam.sort = '{"orderBy":"asc","columnName":"' + sortBy + '"}';
			else
				sortParam.sort = '{"orderBy":"desc","columnName":"' + sortBy + '"}';

			// render sort result
			self.loadEventsList();
		},

		// show default events list (without search/sort result)
		loadEventsList: function() {
			this.ui.eventsList.html('');
			this.ui.currentPage.val(this.currentPage);
			this.collection.fetch();
		},

		goToPage: function() {
			var val = parseInt(this.ui.currentPage.val());

			if (val !== this.currentPage)
				this.loadPagination(val);
		},

		onPressKey: function(e) {
			e.preventDefault();
			var val = $(e.target).val();
			this.$el.find('input').val(val);
			// press enter to go to page
			if (e.which === 13)
				this.goToPage();
		},

		nextPage: function() {
			var nextPage = parseInt(this.ui.currentPage.val()) + 1;
			if (nextPage <= conf.eventsTotalPages)
				this.loadPagination(nextPage);
		},

		previousPage: function() {
			var previousPage = parseInt(this.ui.currentPage.val()) - 1;

			if (previousPage > 0)
				this.loadPagination(previousPage);
		},

		loadPagination: function(val) {
			console.log('Loading events page: ',val);
			this.clearHtml();
			this.showIndicator();
			
			this.currentPage = this.collection.currentPage = val;
			this.loadEventsList();
		},

		totalPages: function(totalPages) {
			this.ui.totalPages.html(totalPages);
		},

		defaultPageOpts: function() {
			if (this.collection)
				this.collection.currentPage = this.currentPage = 1;
			else
				this.currentPage = 1;
			this.ui.currentPage.val(this.currentPage);
		},

		// hide header when search facilities
		hideHeader: function() {
			this.ui.header.hide();
		},

		// hide header when click to facilities tab on sidebar
		showHeader: function() {
			this.ui.header.show();
		},

		reInitEventsDefaultData: function() {
			if(!this.eventsListView){
				this.eventsListView = new eventsListView(false);
				this.currentPage = 1;
				this.collection = this.eventsListView.collection;
			}
			var sortParam = this.collection.server_api;
			sortParam.sort = '{"orderBy":"","columnName":""}';
			sortParam.search = "";
			sortParam.advanceSearch = "";
			this.defaultPageOpts();
			this.loadEventsList();
		},

		showIndicator: function() {
			this.ui.indicator.show();
		},

		hideIndicator: function() {
			this.ui.indicator.hide();
		},

		clearHtml: function() {
			this.ui.listEvents.html('');
		},

		crawlEvents: function() {
			var self = this;
			if (this.crawlStatus === true) {
				api.get("crawl/active.com?token=" + Session.get('user').token, null, function(res) {
					console.log('Started crawl event', res);
					// disabled crawl event button when the process is stated
					self.ui.crawlBtn.attr('disabled', 'disabled');
					self.ui.crawlBtn.html('Crawling...');
				});
			}
		},

		checkCrawlEventStatus: function() {
			var self = this;

			// check status of Crawl event
			api.get("crawl/active.com/checkStatus?token=" + Session.get('user').token, null, function(res) {
				console.log('Checking Crawl status', res);
				var status = res.status;

				if (status === 'Finish') {
					self.ui.crawlBtn.removeAttr('disabled');
				} else {
					// disabled crawl event button when have process is running
					self.ui.crawlBtn.attr('disabled', 'disabled');
					self.ui.crawlBtn.html('Crawling...');
					self.crawlStatus = false;
				}
			})

		},

		onRender: function() {
			this.checkCrawlEventStatus();
		}
	});

	return EventsLayout;
});