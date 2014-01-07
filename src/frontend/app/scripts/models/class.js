/* Global define */
define([
	'conf',
	'models/session'
], function(
	conf,
	Session
){
	'use strict';

	var Class = Backbone.Model.extend({
		url: function() {
			var token = Session.get('user').token;
			
			if (this.id)
				return [conf.PREFIX, 'facilities/classes/', encodeURIComponent(this.id), '?token=', token].join('');
			else
				return [conf.PREFIX, 'facilities/classes/?token=', token].join('');
		},

		defaults: {
			dayOfWeek: 'Monday',
			className: '',
			instructor: '',
			startTime: '01:00 AM',
			endTime: '01:00 AM',
			classDescription: '',
			schedule: []
		},

		validation: {
			price: {
				pattern: 'number'
			},

			className: {
				required: true
			},

			// instructor: {
			// 	required: true
			// }
		},
	});

	return Class;
});