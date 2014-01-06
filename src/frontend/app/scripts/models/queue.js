/* Global define */
define([
	'conf',
	'models/session'
], function(
	conf,
	Session
) {
	'use strict';

	var Facility = Backbone.Model.extend({

		url: function() {
			var token = Session.get('user').token;
			if (this.id)
				return [conf.PREFIX, 'facilities/', encodeURIComponent(this.id), '?token=', token].join('');
			else
				return [conf.PREFIX, 'facilities/?token=', token].join('');
		},

		defaults: {
			zip: '',
			facilityName: '',
			address: '',
			phoneNumber: '',
			classes: '',
			images: [],
			video: []
		},

		validation: {
			facilityName: {
				required: true
			},

			// zip: {
   //      pattern: 'number'
   //    },

			email: {
        pattern: 'email'
      },

			address: {
				required: true
			}
		}
	});

	return Facility;
});