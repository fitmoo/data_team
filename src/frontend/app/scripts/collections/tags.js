/* Global define */
define([
	'conf',
	'models/session',
	'models/tag'
], function(
	conf,
	Session,
	tag
) {
	'use strict';

	var Tags = Backbone.Collection.extend({
		model: tag,

		url: conf.PREFIX + 'tags?token=' + Session.get('user').token,

		parse: function(res) {
			console.log(res);

			// redirect to login page when Token invalid
			Backbone.EventBroker.trigger('token:invalid', res);
			
			this.reset(res.data);

			// implement autocomplete search tag
			Backbone.EventBroker.trigger('tags:autocomplete',res.allTagName);

			return res.data;
		}
	});

	return Tags;
});