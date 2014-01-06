/* Global define */
define([
	'conf',
	'models/session'
], function(
	conf,
	Session
) {
	'use strict';

	var Photo = Backbone.Model.extend({		
		url: function() {
			return [conf.PREFIX, 'facilities/', encodeURIComponent(this.get('facilityId')), '/images/', encodeURIComponent(this.id), '?token=', encodeURIComponent(Session.get('user').token)].join('');
		}
	});

	return Photo;
});