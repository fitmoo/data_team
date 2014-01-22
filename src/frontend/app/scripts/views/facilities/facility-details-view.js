/* Global define */
define([
	'handlebars',
	'conf',
	'stickit',
	'backbone-eventbroker',
	'json!data/countries.json',
	'json!data/states.json',
	// template
	'hbs!templates/facilities/facility-details',
	'hbs!templates/queue/facility-details',

	// model
	'models/facility',

	'backbone.marionette',
	'backbone-validation',
	'tagsinput'
], function(
	Handlebars,
	conf,
	stickit,
	EventBroker,
	countries,
	states,
	facilityDetailsTpl,
	queueFacilityDetailsTpl,
	facility
) {
	'use strict';

	var FacilityDetails = Backbone.Marionette.ItemView.extend({
		template: facilityDetailsTpl,

		el: '.facility-wrapper',

		ui: {
			saveBtn: '.save-btn',
			verification: '#verification',
			tags: '#facility-tags',
			tagsinput: '#tags-wrapper',
			country: '#country',
			states: '#select-state',
			cancelBtn: '.cancel-btn'
		},

		events: {
			'click .save-btn': 'onSave',
			'click .cancel-btn': 'onUndo',
			'focus #select-state': 'onStateFocus'
		},

		bindings: {
			'#verification': {
				observe: 'verified',
				onSet: function(value) {
					return this.changeVerificationValue();
				}
			},
			'#facilityName': {
				observe: 'facilityName',
				updateView: true
			},
			'#address': 'address',
			'#city': 'city',
			'#country': 'country',
			'#select-state': 'state',
			'#zip': 'zip',
			'#phoneNumber': 'phoneNumber',
			'#email': 'email',
			'#websiteURL': 'websiteURL',
			'#owners-name': 'ownersName',
			'#about-us': 'aboutus',
			'#facility-tags': 'tags'
		},

		initialize: function() {
			var path = Backbone.history.location.hash;
    	this.currentView = path.split('/')[0];

      if (this.currentView === '#queue') {
      	this.template = queueFacilityDetailsTpl;
      }
			EventBroker.register({
				'facility:save': 'onSave'
			},this);
		},

		invalid: function(view, attr, error, selector) {
			console.log(view, attr, error, selector);
	  	var $attr = view.$('#' + attr).parent(),
	  		$msgHtml = $attr.find('span');

			// set status = 2 for DONE case
			// default is 0 or null
			if (this.currentView === '#queue') {
				this.model.set('status', this.statusBeforeSave);
			}

	  	if ( $msgHtml.hasClass('error-message') ) {

	  		$msgHtml.text(error);
	  	} else {
	  		var msgHtml = document.createElement('span');

	  		$(msgHtml).addClass('help-inline error-message').text(error).appendTo($attr);
	  	}

	    $attr.parent('.control-group').addClass('error');
	  },

	  valid: function(view, attr, selector) {
	    var $attr = view.$('#' + attr).parent();

	    $attr.parents('.control-group').removeClass('error');
	    $attr.find('.error-message').remove();
	  },

		onSave: function(callback) {
			var self = this,
					currentView = Backbone.history.fragment;

			if (this.currentView !== '#queue') {
				var tagsVal = this.ui.tags.val().split(',');
				this.model.set('tags', tagsVal);
			} else {
				this.model.set('queue', true);
				this.model.set('status', 2);
			}

			if (callback && !callback.target ) {
				this.model.set('verified', true);
			}

			this.model.save(this.model.toJSON(), {
				success: function(model, res) {
					console.log('Save facilities data:', res);
					Backbone.EventBroker.trigger('facilities:add', res);

					// show created successfully facility notification
					Backbone.EventBroker.trigger('notification:show');

					if (callback && !callback.target)
						callback();

					// redirect to next facility queue
					if (self.currentView === '#queue') {
						Backbone.history.navigate('#queue/' + res.id);
						// update model attributes
						self.model.attributes = res;

						self.model = self.model.clone();
						self.render({model: self.model});
						Backbone.EventBroker.trigger('mediaClass:render', self.model);
						$('html, body').animate({scrollTop : 30}, 200);
					}
				},
				error: function(err) {
					console.log(err);
				}
			});
		},

		onUndo: function() {
			console.log('Undo facility value');

			// reset model attribute
			this.model.attributes = this.modelAttr.attributes;
			this.render();
		},

		changeVerificationValue: function() {
			// change verification checkbox value when toggle click
			if (this.ui.verification.is(':checked'))
				return true;
			else
				return false;
		},

		initAutocompleteSearch: function(answers, remove) {
			var input = this.ui.tagsinput.find('input');
			
			if (remove) {
				var data;
				input.off();
				input.data('typeahead', (data = null));
			}

			input.typeahead({
				source: answers,
        items: 5
			});
		},

		onStateFocus: function() {
			var country = this.ui.country.val(),
					data,
					currentStates = states[country];

			console.log('Change autocomplete search state value of', country);

			// set default is USA if currentStates is undefined
			if (!currentStates) {
				currentStates = states["USA"];
			}

			// clear old autocomplete search value
			this.ui.states.off();
			this.ui.states.data('typeahead', (data = null));

			// implemente new coutry state  values
			this.ui.states.typeahead({
				source: currentStates,
        items: 5
			});
		},

		enableValidation: function() {
			Backbone.Validation.bind(this, {
				model: this.model,
				valid: this.valid,
				invalid: this.invalid
			});
		},

		onRender: function(opts) {
			var self = this;

			// change Undo button text to Clear
			if (this.currentView  === '#create-facility')
				this.ui.cancelBtn.text('Clear');

			this.stickit();
			this.ui.tags.tagsinput('items');

			// implement autocomplete search for coutry field
			this.ui.country.typeahead({
				source: countries,
        items: 5
			});

			this.enableValidation();

			self.modelAttr = self.model.clone();
			setTimeout(function() {
				self.initAutocompleteSearch(conf.allTagName);
			},300);
		}
	});

	return FacilityDetails;
});