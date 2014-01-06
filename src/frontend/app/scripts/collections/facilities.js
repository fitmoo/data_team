/* Global define */
define([
	'backbone-eventbroker',
	'conf',
	'models/session',
	'models/facility',

	// backbone paginator
	'backbone.paginator'
], function(
	EventBroker,
	conf,
	Session,
	facility
){
	'use strict';

	var Facilities = Backbone.Paginator.requestPager.extend({
		model: facility,

		paginator_core: {
			type: 'GET',
			dataType: 'json',
			url: function() {
				return conf.PREFIX + 'facilities?token=' + Session.get('user').token;
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
			'sort': '{"orderBy":"","columnName":""}',
			'media': ""
		},

		parse: function(res) {
			console.log(res);

			// redirect to login page when Token invalid
			Backbone.EventBroker.trigger('token:invalid', res);
			
			var totalPages = conf.facilitiesTotalPages = Math.ceil(res.totalRecords/conf.PAGE_LIMIT);
			Backbone.EventBroker.trigger('facilities:totalPages',totalPages);
			
			// reset facilitities collection
			this.reset(res.facilities);
			Backbone.EventBroker.trigger('facilities:hideIndicator');
			
			return res.facilities;
		}
	});

	return Facilities;

});