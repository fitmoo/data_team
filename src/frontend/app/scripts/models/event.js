/* Global define */
define([
	'conf',
	'models/session'
], function(
	conf,
	Session
){
	'use strict';

	var Event = Backbone.Model.extend({

		url: function() {
			var token = Session.get('user').token;
			if (this.id)
				return [conf.PREFIX, 'events/', encodeURIComponent(this.id), '?token=', token].join('');
			else
				return [conf.PREFIX, 'events/?token=', token].join('');
		},
		
		defaults: {
			eventName: '',
			startDateTime: '',
			endDateTime: '',
			eventDescription: '',
			city: '',
			timezone: '-12.0',
			// registrationSiteURL: '',
			country: '',
			hostPhone: '',
			hostName: '',
			startHour: '00',
			startMins: '00',
			startMeridiem: 'AM',
			endHour: '00',
			endMins: '00',
			endMeridiem: 'AM'
		},

		validation: {
			eventName: {
				required: true
			},

			address1: {
				required: true
			},

			startDateTime: {
				required: true
			},

			endDateTime: {
				required: true
			},

			description: {
				required: true
			},
			
			city: {
				required: true
			},
			
			country: {
				required: true
			},

			hostEmail: {
				pattern: 'email'
			},

			hostPhone: {
				required: true
			},

			hostName: {
				required: true
			},
			
			registrationSiteURL: {
				pattern: 'url',
				msg: 'Please enter a valid URL'
			}
		}
	});

	return Event;
});