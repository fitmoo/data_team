/* Global define */
define([
	'backbone',
	'api',
	'conf',
	'models/session',

	// views
	'views/session/login',
	'views/facilities/facility-details-layout',
	'views/classes/classes-layout',
	'views/events/events-layout',
	'views/events/event-details',
	'views/layouts/home',
	'views/layouts/notification',
	'views/facilities/facilitiesLayout',
	'views/queue/queue-layout',

	// models
	'models/facility',
	'models/event',
	'models/queue',

	'backbone.marionette',
	'route-filter'
],
function (
	Backbone,
	api,
	conf,
	Session,
	login,
	facilitiesLayout,
	classLayout,
	eventsLayout,
	eventView,
	homeView,
	notificationView,
	facilitiesView,
	queueLayout,
	facilityModel,
	eventModel,
	queueModel,
	route
) {
	'use strict';

	// Working with mock data
	// Mock.mock();

	var Views = {};

	var AppRouters = Backbone.Router.extend({
		routes: {
			'': 'home',
			'home': 'home',

			// login route
			'login': 'login',

			// notification route
			'notification': 'showNotification',

			// facilities routes
			'facilities': 'showFacilities',
			'facilities/:id': 'showFacility',
			'create-facility': 'showFacility',

			// classes routes
			'classes': 'showClasses',
			'classes:id': 'showClass',

			// events routes
			'events': 'showEvents',
			'events/:id': 'showEvent',
			'create-event': 'showEvent',

			// tags routes
			'tags': 'showTags',

			// export data routes
			'export': 'export',

			// photos de-selection routes
			'photos': 'photos',

			// queue
			'queue': 'showQueue',
			'queue/:id': 'showQueueItem',

			'*default': 'redirect'
		},
    before: {
      '*any': function() {
        var
          self = this,
          path = Backbone.history.location.hash,
          subPath = path.split('/')[0],
          cancelAccess = _.contains(self.preventAccessWhenAuths, subPath);

        if (!Session.get('user') ) {

          // If user gets redirect to login because wanted to access
          // to a route that requires login, save the path in session
          // to redirect the user back to path after successful login
          Backbone.history.navigate('#login', { trigger : true });
          this.login();
          
          return false;

        } else if (cancelAccess) {
          // redirect the user to home page

          Backbone.history.navigate('#home', { trigger : true });
          return false;
        } else {
          if (Session.get('user')) {
            Backbone.history.navigate(path, { trigger : true });
          }
          // No problem, handle the route!!

					// show search function
					Backbone.EventBroker.trigger('search:show');

					switch(subPath) {
						case '#facilities':
							if (!Views.Facilities) {
								Views.Facilities = new facilitiesView();
								Views.Facilities.render();
							}

						case '#classes':
							if (!Views.Classes) {
								Views.Classes = new classLayout();
								Views.Classes.render();
							}

						case '#events':
							if (!Views.Events) {
								Views.Events = new eventsLayout();
								Views.Events.render();
							}
					}
          return true;
        }
      }
    },

		default: function () {
			
		},

		home: function() {
			console.log('Show home view');
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('advSearch:hide');

			if (Views.Home)
				Views.Home.show();
			else {
				Views.Home = new homeView();
				
				Views.Home.render();
				Views.Home.show();
			}
		},

		login: function() {
			console.log('Show login view');
			$('#main').hide();
			$('.modal-backdrop').remove();
			
			if (!Views.Login) {
				Views.Login = new login();
				Views.Login.render();
			} else {
				Views.Login.render();
			}
			$('#login').show();
		},

		showNotification: function() {
			console.log('Show notification view');
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('advSearch:hide');

			if (!Views.Facilities) {
				Views.Facilities = new facilitiesView();
				Views.Facilities.render();
			}

			if (Views.Notification) {
				Views.Notification.render();
				Views.Notification.show();
			}
			else {
				Views.Notification = new notificationView();

				Views.Notification.render();
				Views.Notification.show();
			}
		},

		showFacilities: function() {
			console.log('Show facilities view');
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('advSearch:hide');

			if (Views.Facilities) {
				Views.Facilities.show();
				Views.Facilities.facilitiesList.render();
			}
			else {
				Views.Facilities = new facilitiesView();

				Views.Facilities.render();
				Views.Facilities.show();
			}
		},

		showFacility: function(id) {
			var self = this;
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('views:other');
			Backbone.EventBroker.trigger('advSearch:hide');
			self.getAllTagName();

			if (Views.FacilityDetails)
				Views.FacilityDetails.remove();
			$('#main-container').append('<div class="layout-fluid" id="details"></div>');

			if (!id) {

					var facility = new facilityModel();
					
					Views.FacilityDetails = new facilitiesLayout({model: facility});

					// show info of facility
					Views.FacilityDetails.render();
					Views.FacilityDetails.show();

			} else {

				api.get(['facilities/', id, '?token=', Session.get('user').token].join(''), function(res) {
					console.log('Show Facility had id:',id,res);

					// redirect to login page when Token invalid
					Backbone.EventBroker.trigger('token:invalid', res);
					var facility = new facilityModel(res);

					Views.FacilityDetails = new facilitiesLayout({model: facility});

					// show info of facility
					Views.FacilityDetails.render();
					Views.FacilityDetails.show();
				});

			}
		},

		showClasses: function() {
			console.log('Show classes view');
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('advSearch:show');

			if (Views.Classes)
				Views.Classes.show();
			else {
				Views.Classes = new classLayout();

				Views.Classes.render();
				Views.Classes.show();
			}

		},

		showClass: function(id) {

		},

		showEvents: function() {
			console.log('Show events view');
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('advSearch:show');

			if (Views.Events) 
				Views.Events.show();
			else {
				Views.Events = new eventsLayout();

				Views.Events.render();
				Views.Events.show();
			}

		},

		showEvent: function(id) {
			var self = this;
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('views:other');
			self.getAllTagName();

			if (!id) {
					// show info of event
					var event = new eventModel();

					Views.EventDetails = new eventView({model: event});
					Views.EventDetails.render();
					Views.EventDetails.show();

			} else {

				api.get(['events/', id, '?token=', Session.get('user').token].join(''), function(res) {

					// redirect to login page when Token invalid
					Backbone.EventBroker.trigger('token:invalid', res);

					console.log("Show event had id:", id, res);
					// show info of event
					var event = new eventModel(res);

					Views.EventDetails = new eventView({model: event});
					Views.EventDetails.render();
					Views.EventDetails.show();
				});

			}
		},

		showTags: function() {
			console.log('Show Tags view');
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('advSearch:hide');

			if (Views.Tags) 
				Views.Tags.show();
			else
				requirejs(['views/tags/tags-layout'], function(tagsLayout) {
					Views.Tags = new tagsLayout();

					Views.Tags.render();
					Views.Tags.show();
				});

		},

		export: function() {
			console.log('Show Export data view');
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('advSearch:hide');

			if (Views.Export) 
				Views.Export.show();
			else
				requirejs(['views/data/data-layout'], function(exportLayout) {
					Views.Export = new exportLayout();

					Views.Export.render();
					Views.Export.show();
				});

		},

		photos: function() {
			console.log('Show Photos de-selection view');
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('advSearch:hide');

			if (Views.Photos) 
				Views.Photos.show();
			else
				requirejs(['views/photos/photos-layout'], function(photosLayout) {
					Views.Photos = new photosLayout();

					Views.Photos.render();
					Views.Photos.show();
				});

		},

		showQueue: function() {
			console.log('Show Queue view');
			// hide current layout
			Backbone.EventBroker.trigger('views:hide');
			Backbone.EventBroker.trigger('advSearch:hide');

			// hide search function
			Backbone.EventBroker.trigger('search:hide');

			// if (Views.Queue) {
			// 	Views.Queue.show();
			// 	Views.Queue.facilitiesList.render();
			// }
			// else {
			if (Views.Queue)
				Views.Queue.remove();
			$('#main-container').append('<div class="layout-fluid" id="queue"></div>');
			Views.Queue = new queueLayout();

			Views.Queue.render();
			Views.Queue.show();
			// }
		},

		showQueueItem: function(id) {
			console.log('Show Queue Item have id:', id);
			var self = this;

			// hide search function
			Backbone.EventBroker.trigger('search:hide');
			api.get(['facilities/checkout/', id, '?token=', Session.get('user').token].join(''), function(res) {
				console.log(res);

			if (Views.QueueDetails)
				Views.QueueDetails.remove();
			$('#main-container').append('<div class="layout-fluid" id="details"></div>');
				if (res.status !== false && res.status !== 'Finish') {
					console.log('Show Facility had id:', id, res);
					// hide current layout
					Backbone.EventBroker.trigger('views:hide');
					Backbone.EventBroker.trigger('views:other');
					Backbone.EventBroker.trigger('advSearch:hide');

					var queueItem = new queueModel(res);

					Views.QueueDetails = new facilitiesLayout({model: queueItem});

					// show info of facility
					Views.QueueDetails.render();
					Views.QueueDetails.show();
				} else {
					Backbone.history.navigate('#queue', {trigger: true});
					alert(res.msg);
				}
				
			});
		},

		getAllTagName: function() {
			api.get('tags?token=' + Session.get('user').token, function(res) {
				conf.allTagName = res.allTagName;
			});
		},

		redirect: function() {
			// console.log('redirect to home page');
		}

	});

	var app = new AppRouters();
	return app;
});