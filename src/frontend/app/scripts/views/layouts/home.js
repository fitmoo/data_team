/* Global define */
define([
  'handlebars',
  'api',
  'models/session',

	// home template
	'hbs!templates/views/home',

	'backbone.marionette'
], function(
	Handlebars,
	api,
	Session,
	homeTpl
){
	'use strict';

	var HomeView = Backbone.Marionette.ItemView.extend({
		el: '#home',

		template: homeTpl,

		initialize: function() {
			this.indicator = $('#indicator');
		},

		show: function() {
			this.$el.show();
		},

		onBeforeRender: function() {
			this.indicator.show();
		},

		onRender: function() {
			var self = this;

			api.get('dashBoard?token='+ Session.get('user').token, function(res) {
				// redirect to login page when Token invalid
				Backbone.EventBroker.trigger('token:invalid', res);
				
				console.log('Render Dashboard View:',res);
				self.$el.html(homeTpl(res));
				self.indicator.hide();
			});
		}
	});

	return HomeView;
});