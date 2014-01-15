/* Global define */
define([
	'stickit',
	'handlebars',
	'conf',
	'moment',
	// template
	'hbs!templates/events/event-details',
	'hbs!templates/events/empty-activity',

	'jquery.datepicker',

	'backbone.marionette',
	'tagsinput'
], function(
	stickit,
	Handlebars,
	conf,
	moment,
	eventTpl,
	emptyActivityTpl
) {
	'user strict';

	var EventDetails = Backbone.Marionette.ItemView.extend({
		template: eventTpl,

		el: '#event-details',

		ui: {
			editForm: '#editing-event',
			activitiesList: '.activities-list',
			saveBtn: '.save-btn',
			eventForm: '.form-horizontal',
			startTime: '#ev-startDateTime',
			endTime: '#ev-endDateTime',
			tags: '#ev-tags',
			price: '#ev-price',
			tagsinput: '.tag-wrapper',
			startHour: '#ev-startHour',
			startMins: '#ev-startMins',
			startMeridiem: '#ev-startMeridiem',
			endHour: '#ev-endHour',
			endMins: '#ev-endMins',
			endMeridiem: '#ev-endMeridiem',
		},

		events: {
			// 'click .edit-btn': 'onEdit',
			'click .add-btn': 'addActivity',
			'click .save-btn': 'onSave',
			'click .cancel-btn': 'onCancel',
			'click .rm-activity-btn': 'removeActivity'
		},

		bindings: {
			'#ev-eventName': 'eventName',
			'#ev-startDateTime': 'startDateTime',
			'#ev-endDateTime': 'endDateTime',
			'#ev-dropDownTimezone': 'timezone',
			'#ev-address1': 'address1',
			'#ev-address2': 'address2',
			'#ev-registrationSiteURL': 'registrationSiteURL',
			'#ev-hostEmail': 'hostEmail',
			'#ev-hostName': 'hostName',
			'#ev-hostPhone': 'hostPhone',
			'#ev-city': 'city',
			'#ev-country': 'country',
			'#ev-postal-code': 'postalCode',
			'#ev-stateProvinceCode': 'stateProvinceCode',
			'#ev-eventDescription': 'eventDescription',
			'#ev-tags': 'tags',
			'#ev-price': 'eventPrice',
			'#ev-startHour': 'startHour',
			'#ev-startMins': 'startMins',
			'#ev-startMeridiem': 'startMeridiem',
			'#ev-endHour': 'endHour',
			'#ev-endMins': 'endMins',
			'#ev-endMeridiem': 'endMeridiem'
	  },

		initialize: function() {
			this.listenTo(this.model, 'change', this.onChange);
		},

		onChange: function() {
			// if (this.ui.saveBtn.is(':disabled'))
			// 	// enabled Save button when have any model data changes
			// 	this.ui.saveBtn.removeAttr('disabled');
		},

		show: function() {
			this.$el.show();
		},

		onSave: function() {
			var self = this,
					data = [],
					activityItem = self.ui.activitiesList.find('tr'),
					length = activityItem.length,
					validation = this.ui.eventForm[0].checkValidity(),
					tagsVal = this.ui.tags.val().split(','),
					price = this.ui.price.val();

				self.model.set('tags', tagsVal);
				self.model.set('eventPrice', [{price : price}]);
				this.ui.price.val(price);
				if (length === 0) {
					// update activities data
					self.model.set('activities',[]);
					self.saveEventModel();
				} else {
					if (validation) {
						// get activities data from DOM
						activityItem.each(function(index, element) {
							var activityName = $(element).find('.activity-name'),
									activityPrice = $(element).find('.activity-price'),
									activityPriceVal = activityPrice.val();

							if ( activityPriceVal != activityPriceVal.replace(/[^0-9\.]/g,'' && !validation)) {
								activityPrice.parent().addClass('error');
								return false;
							} else {
								activityPrice.parent().removeClass('error');
								data.push({
									name: activityName.val(),
									price: activityPriceVal
								});
							}

							if (index === length - 1) {
								// update activities data
								self.model.set('activities', data);
								self.saveEventModel();
							}
						});
					}
				}
		},

		saveEventModel: function() {
			var self = this;

			self.model.save(self.model.toJSON(), {
				success: function(res) {
					console.log('Save event data:', self.model.toJSON());
					self.ui.editForm.removeClass('editing');
					self.ui.saveBtn.attr('disabled','disabled');
					// self.render();
					Backbone.history.navigate('#events', {trigger: true});
				},
				error: function(err) {
					console.log(err);
				}
			});
		},

		addActivity: function() {
			console.log("Add a activity");
			this.ui.activitiesList.append(emptyActivityTpl);
		},

		removeActivity: function(e) {
			console.log('Remove Activity');
			var target = $(e.target).closest('tr');
			target.remove();
		},

		onCancel: function() {
			Backbone.history.navigate('#events', {trigger: true});
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

		invalid: function(view, attr, error, selector) {
			console.log(view, attr, error, selector);
	  	var $attr = view.$('#ev-' + attr).parent(),
	  		$msgHtml = $attr.find('span');

	  	if ( $msgHtml.hasClass('error-message') ) {

	  		$msgHtml.text(error);
	  	} else {
	  		var msgHtml = document.createElement('span');

	  		$(msgHtml).addClass('help-inline error-message').text(error).appendTo($attr);
	  	}

	    $attr.parent('.control-group').addClass('error');
	  },

	  valid: function(view, attr, selector) {
	    var $attr = view.$('#ev-' + attr).parent();

	    $attr.parents('.control-group').removeClass('error');
	    $attr.find('.error-message').remove();
	  },

	  onBeforeRender: function() {
	  	var startTime = this.model.get('startDateTime'),
	  			endTime = this.model.get('endDateTime');

			if (startTime || startTime === '')
	  		this.model.set('startDateTime', moment(startTime).calendar());

			if (endTime || endTime === '')
	  		this.model.set('endDateTime', moment(endTime).calendar());
	  },

		onRender: function() {
	  	this.stickit();
	  	this.ui.tags.tagsinput('items');
	  	var price = this.model.get('eventPrice');
	  	if (price && price.length > 0)
	  		this.ui.price.val(price[0].price);

			if (this.ui.price.val() === '') {
				this.ui.price.val('');
			}
			// use datepicker for input date format
			this.ui.startTime.datepicker();
			this.ui.endTime.datepicker();

			// init autocomplete search
			this.initAutocompleteSearch(conf.allTagName);

			// validate edit form input value
			Backbone.Validation.bind(this, {
				model: this.model,
				valid: this.valid,
				invalid: this.invalid
			});
		}
	});

	return EventDetails;
});