/* Global define */
define([
	'models/photo'
], function(
	photo
) {
	'use strict';

	var Photos = Backbone.Collection.extend({
		model: photo
	});

	return Photos;
});