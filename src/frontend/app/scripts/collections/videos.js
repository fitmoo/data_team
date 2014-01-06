/* Global define */
define([
	'models/video'
], function(
	video
) {
	'use strict';

	var Videos = Backbone.Collection.extend({
		model: video
	});

	return Videos;
});