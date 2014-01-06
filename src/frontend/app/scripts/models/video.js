/* Global define */
define([
	'conf',
	'models/session'
], function(
	conf,
	Session
) {
	'use strict';

	var Video = Backbone.Model.extend({
		url: function() {
			return [conf.PREFIX, 'facilities/', encodeURIComponent(this.get('facilityId')), '/video/', encodeURIComponent(this.id), '?token=', Session.get('user').token].join('');
		}
	});

	return Video;
});