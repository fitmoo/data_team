/* Global define */
define([
	'handlebars',
	'conf',
	'api',
	'models/session',

	// views
	'views/queue/queue-list',

	// template
	'hbs!templates/queue/queue',

	// backbone event broker
	'backbone-eventbroker',

	'backbone.marionette'
],
function(
	Handlebars,
	conf,
	api,
	Session,
	queueList,
	facilitiesLayoutTpl,
	Eventbroker
) {
	'use strict';

	var QueueLayout = Backbone.Marionette.Layout.extend({
		el: '#queue',

		template: facilitiesLayoutTpl,

		ui: {
			// thead: '.sort-btn',
			header: '.sub-header',
			queueList: '.queue-content',
			currentPage: '.current-page',
			totalPages: '.total-pages',
			indicator: '.indicator'
		},

		events: {
			// 'click .sort-btn': 'sortBy',
			'click .previous': 'previousPage',
			'click .next': 'nextPage',
			'click .goto-btn': 'goToPage',
			'keyup :input': 'onPressKey',
			// 'click .create-btn': 'createFacility',
			// 'keyup .container-fluid': 'createFacility'
		},

		initialize: function() {
			Eventbroker.register({
				'queueHeader:hide': 'hideHeader',
				'queueHeader:show': 'showHeader',
				'queue:load': 'loadqueueList',
				// 'facilities:reset': 'reInitFacilitiesDefaultData',
				'queue:show': 'show',
				'queue:totalPages': 'totalPages',
				'queue:reset': 'defaultPageOpts',
				'queue:hideIndicator': 'hideIndicator',
				'queue:showIndicator': 'showIndicator',
				'queue:clear': 'clearHtml'
			},this);
		},

		show: function() {
			this.$el.show();
			
			// render facilities list
			if(!this.queueList){
				this.showIndicator();
				this.queueList = new queueList();
				this.currentPage = 1;
				this.collection = this.queueList.collection;
			}
		},

		// hide header when search facilities
		hideHeader: function() {
			this.ui.header.hide();
		},

		// hide header when click to facilities tab on sidebar
		showHeader: function() {
			this.ui.header.show();
		},

		// show default facilities list (without search/sort result)
		loadqueueList: function() {
			this.clearHtml();
			this.showIndicator();
			
			this.ui.queueList.html('');
			this.ui.currentPage.val(this.currentPage);
			this.collection.fetch();
		},

		goToPage: function(e) {
			var val = parseInt(this.ui.currentPage.val());

			if (val !== this.currentPage)
				this.loadPagination(val);
		},

		onPressKey: function(e) {
			var val = $(e.target).val();
			this.$el.find('input').val(val);
			// press enter to go to page
			if (e.which === 13)
				this.goToPage();
		},

		nextPage: function() {
			var nextPage = parseInt(this.ui.currentPage.val()) + 1;
			if (nextPage <= conf.facilitiesTotalPages)
				this.loadPagination(nextPage);
		},

		previousPage: function() {
			var previousPage = parseInt(this.ui.currentPage.val()) - 1;

			if (previousPage > 0)
				this.loadPagination(previousPage);
		},

		loadPagination: function(val) {
			console.log('Loading facilities page: ',val);
			this.currentPage = this.collection.currentPage = val;
			this.loadqueueList();
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

		reInitFacilitiesDefaultData: function(keepParams) {
			if(!this.queueList){
				this.queueList = new queueList(false);
				this.currentPage = 1;
				this.collection = this.queueList.collection;
			}
			var sortParam = this.collection.server_api;
			if (!keepParams) {
				sortParam.sort = '{"orderBy":"","columnName":""}';
				sortParam.search = "";
				sortParam.advanceSearch = "";
				this.defaultPageOpts();
			}
			this.loadqueueList();
		},

		showIndicator: function() {
			this.ui.indicator.show();
		},

		hideIndicator: function() {
			this.ui.indicator.hide();
		},

		clearHtml: function() {
			this.ui.queueList.html('');
		}
	});

	return QueueLayout;
});