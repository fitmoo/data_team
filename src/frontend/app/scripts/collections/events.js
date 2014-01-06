/* Global define */
define([
	'backbone-eventbroker',
	'models/session',
	'models/event',
	'conf',

	// backbone paginator
	'backbone.paginator'
], function(
	EventBroker,
	Session,
	Event,
	conf
){
	'use strict';

	var Events = Backbone.Paginator.requestPager.extend({
		model: Event,

		paginator_core: {
			type: 'GET',
			dataType: 'json',
			url: function() {
				return conf.PREFIX + 'events?token=' + Session.get('user').token;
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
			
			var totalPages = conf.eventsTotalPages = Math.ceil(res.totalRecords/conf.PAGE_LIMIT);
			Backbone.EventBroker.trigger('events:totalPages',totalPages);

			this.reset(res.events);
			
			return res.events;
		}
	});

	return Events;

});