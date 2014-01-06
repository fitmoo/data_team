/* Global define */
define([
	'backbone-eventbroker',
	'conf',
	'models/session',
	'models/queue',

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
				return conf.PREFIX + 'facilities/queue?token=' + Session.get('user').token;
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
			'currentPage': function() { return this.currentPage; }
		},

		parse: function(res) {
			console.log(res);
			// redirect to login page when Token invalid
			Backbone.EventBroker.trigger('token:invalid', res);

			if (res.totalRecords === 0 || res.facilities.length === 0) {
				Backbone.EventBroker.trigger('queue:hideIndicator');
				alert('Have no facility in queue');
			} else {
				var totalPages = conf.facilitiesTotalPages = Math.ceil(res.totalRecords/conf.PAGE_LIMIT);
				Backbone.EventBroker.trigger('queue:totalPages', totalPages);
				
				// reset facilitities collection
				this.reset(res.facilities);
			}
			
			return res.facilities;
		}
	});

	return Facilities;

});