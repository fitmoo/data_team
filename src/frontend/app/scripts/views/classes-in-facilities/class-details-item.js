/* Global define */
define([
	'handlebars',
	'stickit',

	// template
	'hbs!templates/classes/class-details-item',
	'hbs!templates/queue/class-details-item',
	'hbs!templates/classes/edit-class',
	'hbs!templates/queue/edit-class',
	'views/classes-in-facilities/class-details-view',

	'backbone.marionette'
], function(
	Handlebars,
	stickit,
	classTpl,
	queueClassTpl,
	editClassTpl,
	queueEditClassTpl,
	classDetailsView
) {
	'use strict';

	var ClassDetailsItemView = Backbone.Marionette.ItemView.extend({
		template: classTpl,

		tagName: 'tr',

		events: {
			'click .remove': 'onRemove',
			'click .edit': 'onEdit'
		},

		initialize: function() {
			var path = Backbone.history.location.hash;
    	this.currentView = path.split('/')[0];
    	if (this.currentView === '#queue')
				this.template = queueClassTpl;
		},

		onRemove: function() {
			var confirmPopup = confirm('Are you sure you wish to delete?');

			if (confirmPopup === true) {
				console.log('Remove class', this.model);
				this.model.destroy();
			}
		},

		bindings: {
			'#cl-className': 'className'
		},

		onEdit: function() {
			console.log('Edit class:', this.model);

			var model = this.model,
					startTime = this.model.get('startTime'),
					endTime = this.model.get('endTime'),
					calendarForm = $('.calendar-form');

			// substring start Time, end Time to render template
			model.set('stHour', startTime.substring(0,2));
			model.set('stMinute', startTime.substring(3,5));
			model.set('stMeridiem', startTime.substring(6,8));

			model.set('etHour', endTime.substring(0,2));
			model.set('etMinute', endTime.substring(3,5));
			model.set('etMeridiem', endTime.substring(6,8));

			if (this.currentView === '#queue')
				calendarForm.html(queueEditClassTpl(model.toJSON()));
			else
				calendarForm.html(editClassTpl(model.toJSON()));

			Backbone.EventBroker.trigger('class:updateModel',model);

			// show the form to edit class value
			Backbone.EventBroker.trigger('class:formShow');
			calendarForm.addClass('editing');
		}
	});

	return ClassDetailsItemView;
});