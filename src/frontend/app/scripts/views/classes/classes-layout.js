/* Global define */
define([
	'handlebars',
	'api',
	'conf',
	'backbone-eventbroker',

	// templates
	'hbs!templates/classes/classes',

	// views
	'views/classes/classes-list',

	'backbone.marionette'
], function(
	Handlebars,
	api,
	conf,
	EventBroker,
	classesTpl,
	classesListView
) {
	'user strict';

	var ClassesLayout = Backbone.Marionette.Layout.extend({
		template: classesTpl,

		el: '#classes',

		ui: {
			thead: '.sort-btn',
			classesList: '.classes-content',
			totalPages: '.total-pages',
			currentPage: '.current-page',
			header: '.sub-header',
			indicator: '.indicator'
		},

		events: {
			'click .sort-btn': 'sortBy',
			'click .previous': 'previousPage',
			'click .next': 'nextPage',
			'click .goto-btn': 'goToPage',
			'keyup :input': 'onPressKey'
		},

		initialize: function() {
			EventBroker.register({
				'classes:totalPages': 'totalPages',
				'eventPages:reset': 'defaultPageOpts',
				'classesHeader:hide': 'hideHeader',
				'classesHeader:show': 'showHeader',
				'classes:show': 'show',
				'classes:load': 'loadClassesList',
				'classes:reset': 'reInitClassesDefaultData',
				'classes:hideIndicator': 'hideIndicator',
				'classes:showIndicator': 'showIndicator',
				'classes:clear': 'clearHtml'
			},this);
		},

		show: function() {
			this.$el.show();
			
			// render classes list
			if(!this.classesListView){
				this.showIndicator();
				this.classesListView = new classesListView();
				this.currentPage = 1;
				this.collection = this.classesListView.collection;
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
			self.loadClassesList();
		},

		// show default classes list (without search/sort result)
		loadClassesList: function() {
			this.ui.classesList.html('');
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
			if (nextPage <= conf.classesTotalPages)
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
			this.loadClassesList();
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

		reInitClassesDefaultData: function() {
			if (!this.classesListView) {
				this.classesListView = new classesListView(false);
				this.currentPage = 1;
				this.collection = this.classesListView.collection;
			}
			var sortParam = this.collection.server_api;
			sortParam.sort = '{"orderBy":"","columnName":""}';
			sortParam.search = "";
			sortParam.advanceSearch = "";
			this.defaultPageOpts();
			this.loadClassesList();
		},

		showIndicator: function() {
			this.ui.indicator.show();
		},

		hideIndicator: function() {
			this.ui.indicator.hide();
		},

		clearHtml: function() {
			this.ui.classesList.html('');
		}
	});

	return ClassesLayout;

});