/* Global define */
define([
	'backbone-eventbroker',
	'models/session',
	'models/class',
	'conf',

	// backbone Paginator
	'backbone.paginator'
], function(
	EventBroker,
	Session,
	Class,
	conf
){
	'use strict';

	var Classes = Backbone.Paginator.requestPager.extend({
		model: Class,

		paginator_core: {
			type: 'GET',
			dataType: 'json',
			url: function() {
				return conf.PREFIX + 'classes?token=' + Session.get('user').token;
			}
		},

		paginator_ui: {
			firstPage: 1,
			currentPage: 1,
			perPage: conf.PAGE_LIMIT,
			totalPages: 50
		},

		server_api: {
			'perPage': function() { return this.perPage; },
			'currentPage': function() { return this.currentPage; },
			'search': function() { return this.textSearch; },
			'sort': '{"orderBy":"","columnName":""}'
		},

		parse: function(res) {
			console.log(res);

			// redirect to login page when Token invalid
			Backbone.EventBroker.trigger('token:invalid', res);
			
			var totalPages = conf.classesTotalPages = Math.ceil(res.totalRecords/conf.PAGE_LIMIT);
			Backbone.EventBroker.trigger('classes:totalPages',totalPages);

			this.reset(res.classes);
			
			return res.classes;
		}
	});

	return Classes;

});