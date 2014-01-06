/* Global define */
define([
	'conf',
	'models/session'
], function(
	conf,
	Session
) {
	'use strict';

	var PhotoSelection = Backbone.Model.extend({
		// urlRoot: '/api/photos'
	});

	return PhotoSelection;
});