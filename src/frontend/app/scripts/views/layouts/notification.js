/* Global define */
define([
  'handlebars',
  'api',
  'models/session',

	// home template
	'hbs!templates/views/notification',

	// collection
	'collections/facilities',

	'backbone-eventbroker',

	'backbone.marionette'
], function(
	Handlebars,
	api,
	Session,
	notificationTpl,
	facilities
){
	'use strict';

	var NotificationView = Backbone.Marionette.ItemView.extend({
		el: '#notification',

		template: notificationTpl,

		events: {
			'click #check-them-now': 'showFacilities'
		},

		show: function() {
			this.$el.show();
		},

		showFacilities: function() {
				this.collection = new facilities();

				// remove search param value
				this.collection.server_api.search = '';
				this.collection.server_api.sort = '{"orderBy":"","columnName":""}';
				this.collection.server_api.media = 0;
				// show facilities view & result
				Backbone.EventBroker.trigger('views:hide');
				Backbone.EventBroker.trigger('facilities:show');
				Backbone.EventBroker.trigger('facilities:load');
				
				// reset current paginator to 1
				Backbone.EventBroker.trigger('facilitiesPages');
				Backbone.EventBroker.trigger('views:other');
		},

		render: function() {
			var self = this;

			api.get('facilities/needPhotoVideo?token='+ Session.get('user').token, function(res) {

				// redirect to login page when Token invalid
				Backbone.EventBroker.trigger('token:invalid', res);

				console.log('Facilities that need to select videos/photos:',res);
				self.$el.html(notificationTpl(res));
			});
		}
	});

	return NotificationView;
});