/* Global define */
define([
	// model
	'models/class'
], function(
	Class
) {
	'use strict';

	var ClassDetails = Backbone.Collection.extend({
		model: Class
	});

	return ClassDetails;
});