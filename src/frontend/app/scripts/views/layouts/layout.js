/* Global define */
define([
  'handlebars',
	'backbone.marionette'
],function(
	Handlebars
) {
	'use strict';

	var Layout = Backbone.Marionette.ItemView.extend({
		// template: head,

		id: 'layout'

	});

	return Layout;
});