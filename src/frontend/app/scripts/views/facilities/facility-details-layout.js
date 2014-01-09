/* Global define */
define([
	'handlebars',
	'backbone-eventbroker',
	'api',
	'models/session',

	// views
	'views/classes-in-facilities/class-details-view',
	'views/facilities/facility-details-view',
	'views/media/media-layout',

	// Facility details template
	'hbs!templates/facilities/facility',
	'hbs!templates/queue/facility',

	'backbone.marionette'
], function(
	Handlebars,
	EventBroker,
	api,
	Session,
	classDetailsView,
	facilityDetailsView,
	mediaLayout,
	facilityTpl,
	queueFacilityTpl
) {
	'use strict';

	var FacilityDetailsLayout = Backbone.Marionette.Layout.extend({
		template: facilityTpl,

		el: '#details',

		ui: {
			delBtn: '#delete-facility',
			verifyFacility: '#vefify-facility',
			editForm: '#editing-facility'
		},

		events: {
			'click #delete-facility': 'onDelete',
			'click #vefify-facility': 'onVerifyFacility',
			'keyup input': 'disableQuickKeyCode',
			'keyup textarea': 'disableQuickKeyCode',

			// events of facility details queue
			'click #save-finish-btn': 'saveAndFinishLater',
			'click .queue-save-btn': 'saveAndDone',
			'click .cancel-btn': 'onCancel'
		},

		initialize: function() {
			var path = Backbone.history.location.hash;
    	this.currentView = path.split('/')[0];

      if (this.currentView === '#queue') {
      	this.template = queueFacilityTpl;
      }
			this.listenTo(this.model, 'change', this.onChange);

			EventBroker.register({
				'facility:editOff': 'disabledEditMode',
				'facility:verify': 'onVerifyFacility',
				'mediaClass:render': 'renderMediaAndClassView'
			},this);
		},

		onDelete: function(e) {
			e.preventDefault();
			var confirmPopup = confirm('Are you sure you wish to delete?'),
					currentView = Backbone.history.fragment;

			if (confirmPopup === true) {
				console.log('DELETE facility', this.model);
				this.model.destroy();
				Backbone.EventBroker.trigger('facility:remove', this.model);
				if (currentView === 'create-facility')
					Backbone.history.navigate('#facilities', {trigger: true});
				else
					window.history.back();
			}
		},

		saveAndFinishLater: function() {
			var model = this.model;
			model.set('status', 1);
			model.set('queue', true);

			// bypass validation when Click SaveAndFinishLater button
			api.put(['facilities/', model.get('id'), '?token=', Session.get('user').token].join(''), model.toJSON(), function(res) {
				console.log(res);
				// redirect to next item
				Backbone.history.navigate('#queue/' + res.id, {trigger: true});
			});
		},

		saveAndDone: function() {
			var confirmPopup = confirm('This item will not be accessible again. Have you filled in as much information as possible?');

			if (confirmPopup === true) {
				console.log('Save and Done facility on queue', this.model);
				this.model.set('status', 2);
				Backbone.EventBroker.trigger('facility:save', function() {});
			}
		},

		onVerifyFacility: function() {
			var self = this;
			if (this.ui.verifyFacility.hasClass('btn-success')) {
				console.log('Unverified');
				this.model.set('verified', false);
				this.model.save(this.model.toJSON());

				self.ui.verifyFacility.html('Unverified')
															.removeClass('btn-success')
															.addClass('btn-warning');

			} else
				Backbone.EventBroker.trigger('facility:save', function() {
					self.ui.verifyFacility.html('Verified')
																.removeClass('btn-warning')
																.addClass('btn-success');
				});

		},

		show: function() {
			this.$el.show();
		},

		disabledEditMode: function() {
			this.ui.editForm.removeClass('editing');
		},

		disableQuickKeyCode: function(e) {
			var keycode = e.keyCode;

			if(keycode === 67 || keycode === 99 || keycode === 86 || keycode === 118) {
				e.stopPropagation();
			}
		},

		renderMediaAndClassView: function(model) {
			var ClassDetailsView = new classDetailsView({model: model});

			ClassDetailsView.render();
			if (this.currentView !== '#queue') {
				var MediaLayout = new mediaLayout({model: model});
					MediaLayout.render();
				this.ui.verifyFacility.show();
				this.ui.delBtn.show();
			}
		},

		onCancel: function() {

			if (this.currentView === '#queue') {
				Backbone.history.navigate('#queue', {trigger: true});
			}

		},

		onRender: function() {
			var self = this,
					model = this.model,
					currentView = Backbone.history.fragment,
					FacilityDetailsView = new facilityDetailsView({model: model});

			FacilityDetailsView.render();

			if (currentView !== 'create-facility')
				this.renderMediaAndClassView(model);

			$(window).bind('beforeunload', function() {
				if (self.currentView && self.currentView === '#queue')
					api.post(['facilities/undoCheckOut/', self.model.id, '?token=', Session.get('user').token].join(''), {}, function(res) {
						console.log(res);
					});
	    });
				
		}
	});

	return FacilityDetailsLayout;
});