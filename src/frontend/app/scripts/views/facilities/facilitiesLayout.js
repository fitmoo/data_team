/* Global define */
define([
	'handlebars',
	'conf',
	'api',
	'models/session',

	// views
	'views/facilities/facilities-list',

	// template
	'hbs!templates/facilities/facilities',

	// backbone event broker
	'backbone-eventbroker',

	'backbone.marionette'
],
function(
	Handlebars,
	conf,
	api,
	Session,
	facilitiesList,
	facilitiesLayoutTpl,
	Eventbroker
) {
	'use strict';

	var FacilitiesLayout = Backbone.Marionette.Layout.extend({
		el: '#facilities',

		template: facilitiesLayoutTpl,

		ui: {
			thead: '.sort-btn',
			header: '.sub-header',
			facilitiesList: '.list-content',
			currentPage: '.current-page',
			totalPages: '.total-pages',
			createForm: '#create-new-facility',
			indicator: '.indicator'
		},

		events: {
			'click .sort-btn': 'sortBy',
			'click .previous': 'previousPage',
			'click .next': 'nextPage',
			'click .goto-btn': 'goToPage',
			'keyup :input': 'onPressKey',
			'keyup input#facility-name': 'changeBtnStatus'
			// 'click .create-btn': 'createFacility',
			// 'keyup .container-fluid': 'createFacility'
		},

		initialize: function() {
			Eventbroker.register({
				'facilitiesHeader:hide': 'hideHeader',
				'facilitiesHeader:show': 'showHeader',
				'facilities:load': 'loadFacilitiesList',
				'facilities:reset': 'reInitFacilitiesDefaultData',
				'facilities:show': 'show',
				'facilities:totalPages': 'totalPages',
				'facilitiesPages:reset': 'defaultPageOpts',
				'facilities:hideIndicator': 'hideIndicator',
				'facilities:showIndicator': 'showIndicator',
				'facilities:clear': 'clearHtml',
				'facility:remove': 'removeFacility',
				'facilities:add': 'addFacility'
			},this);
		},

		show: function() {
			this.$el.show();
			
			// render facilities list
			if(!this.facilitiesList){
				this.showIndicator();
				this.facilitiesList = new facilitiesList();
				this.currentPage = 1;
				this.collection = this.facilitiesList.collection;
			}
		},

		sortBy: function(e) {
			var target = $(e.target).closest('.sort-btn'),
					sortBy = target.attr('sortBy'),
					self = this;

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
			self.loadFacilitiesList();
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
		loadFacilitiesList: function() {
			this.clearHtml();
			this.showIndicator();
			
			this.ui.facilitiesList.html('');
			this.ui.currentPage.val(this.currentPage);
			this.collection.fetch();
		},

		goToPage: function(e) {
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
			this.loadFacilitiesList();
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
			if(!this.facilitiesList){
				this.facilitiesList = new facilitiesList(false);
				this.currentPage = 1;
				this.collection = this.facilitiesList.collection;
			}
			var sortParam = this.collection.server_api;
			if (!keepParams) {
				sortParam.sort = '{"orderBy":"","columnName":""}';
				sortParam.search = "";
				sortParam.advanceSearch = "";
				this.defaultPageOpts();
			}
			this.loadFacilitiesList();
		},

		changeBtnStatus: function() {
			var facilityName = this.ui.createForm.find('input').val().trim(),
					createBtn = this.ui.createForm.find('.create-btn');

			if (facilityName) {
				createBtn.attr('data-dismiss', 'modal');
				createBtn.attr('aria-hidden', 'true');
				createBtn.removeAttr('disabled');
			}
			else {
				createBtn.attr('disabled', 'disabled');
				createBtn.removeAttr('data-dismiss');
				createBtn.removeAttr('aria-hidden');
			}
		},

		removeFacility: function(model) {
			if (this.collection) {
				this.collection.remove(model);
			}
		},

		addFacility: function(model) {
			if (this.collection)
				this.collection.add(model, {merge: true});
		},

		showIndicator: function() {
			this.ui.indicator.show();
		},

		hideIndicator: function() {
			this.ui.indicator.hide();
		},

		clearHtml: function() {
			this.ui.facilitiesList.html('');
		}
	});

	return FacilitiesLayout;
});