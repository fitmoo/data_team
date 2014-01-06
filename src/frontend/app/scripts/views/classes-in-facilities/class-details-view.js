/* Global define */
define([
	'handlebars',
	'stickit',
	'conf',
	'backbone-eventbroker',

	// template
	'hbs!templates/classes/class-details',
	'hbs!templates/queue/class-details',
	'hbs!templates/classes/edit-class',
	'hbs!templates/queue/class',

	// views
	'views/classes-in-facilities/classes-details-list',

	'models/class',

	'backbone.marionette',
	'tagsinput'
], function(
	Handlebars,
	stickit,
	conf,
	EventBroker,
	classDetailsTpl,
	queueclassDetailsTpl,
	editClassTpl,
	queueClassTpl,
	classesDetailsList,
	classModel
) {
	'user strict';
	var ClassDetailsView = Backbone.Marionette.ItemView.extend({
		el: '#calendar',

		template: classDetailsTpl,

		ui: {
			addClassForm: '.add-calendar-item',
			classes: '.classes-wrapper',
			saveBtn: '.save-btn',
			calendarForm: '.calendar-form',
			classList: '.list-class-content',
			tags: '#cl-tags',
			startTime: '#cl-startTime',
			endTime: '#cl-endTime',
			ETHour: '.et-select-hour',
			STHour: '.st-select-hour',
			ETMins: '.et-select-minute',
			STMins: '.st-select-minute',
			STMeridiem: '.st-select-meridiem',
			ETMeridiem: '.et-select-meridiem',
			dayOfWeek: '.cl-dayOfWeek',
			tagsinput: '.tag-wrapper'
		},

		events: {
			'click #addItem-btn': 'showAddNewClass',
			'click .save-btn': 'addNewClass',
			'click .facility-cancel-btn': 'cancelEntry',
			'change .cl-startTime': 'updateStartTimeVal',
			'change .cl-endTime': 'updateEndTimeVal',
			'change .st-select-hour': 'updateEndTimeHour',
			'change .st-select-minute': 'updateEndTimeMins',
			'change .st-select-meridiem': 'updateEndTimeMeridiem',
			'click .date-name': 'checkedDateInput'
		},

		otherBindings: {
			'#cl-className': 'className',
			'.cl-dayOfWeek': 'dayOfWeek',
			'#cl-startTime': 'startTime',
			'#cl-endTime': 'endTime',
			'#cl-instructor': 'instructor',
			'#cl-price': 'price',
			'#cl-tags': 'tags',
			'#cl-classDescription': 'classDescription'
		},

		initialize: function() {
			var path = Backbone.history.location.hash;
    	this.currentView = path.split('/')[0];
    	if (this.currentView === '#queue') {
    		this.template = queueclassDetailsTpl;
    	}

			EventBroker.register({
				'class:stickit': 'enableStickit',
				'class:updateModel': 'updateModel',
				'class:formShow': 'showCreateClassForm',
				'class:new': 'showAddNewClass'
			},this);
		},

		showCreateClassForm: function() {
			console.log('Show add new a class form');
			this.ui.addClassForm.show();
			this.ui.calendarForm.removeClass('editing');

			// init backbone validation for edit class
			Backbone.Validation.bind(this, {
				model: this.otherModel,
				valid: this.valid,
				invalid: this.invalid
			});

			if (this.currentView !== '#queue') {
				$('#cl-tags').tagsinput('items');
				this.initAutocompleteSearch(conf.allTagName, true);
			}
		},

		showAddNewClass: function() {
			this.ui.addClassForm.show();
			this.newModelForCreateClass();
		},

		newModelForCreateClass: function(attr) {
			this.ui.calendarForm.removeClass('editing');

			if (this.currentView !== '#queue')
				this.initAutocompleteSearch(conf.allTagName);

			if (attr) {
				this.otherModel = new classModel(attr);
			} else
				this.otherModel = new classModel();

			this.enableStickit(this.otherModel);

			// init backbone validation for create a class
			Backbone.Validation.bind(this, {
				model: this.otherModel,
				valid: this.valid,
				invalid: this.invalid
			});

		},

		updateStartTimeVal: function() {
			var self=this,
					hour = this.$el.find('.st-select-hour').val(),
					mins = this.$el.find('.st-select-minute').val(),
					meridiem = this.$el.find('.st-select-meridiem').val();
					
			var val = [hour,':',mins,' ',meridiem].join('');

			this.otherModel.set({startTime: val});
			setTimeout(function() {
				self.updateEndTimeVal();
			},50);
		},

		updateEndTimeVal: function() {
			var hour = this.$el.find('.et-select-hour').val(),
					mins = this.$el.find('.et-select-minute').val(),
					meridiem = this.$el.find('.et-select-meridiem').val();

			var val = [hour,':',mins,' ',meridiem].join('');
			this.otherModel.set({endTime: val});
		},

		updateEndTimeHour: function() {
			var val = this.ui.STHour.val(),
					ETHour = this.ui.ETHour;

			if (val === '12')
				ETHour.val('01');
			else if (val < 9 )
				ETHour.val('0' + (Number(this.ui.STHour.val()) + 1));
			else
				ETHour.val(Number(this.ui.STHour.val()) + 1);
		},

		updateEndTimeMins: function() {
			var val = this.ui.STMins.val(),
					ETMins = this.ui.ETMins;

			ETMins.val(val);
		},

		updateEndTimeMeridiem: function() {
			var val = this.ui.STMeridiem.val(),
					ETMeridiem = this.ui.ETMeridiem;

			ETMeridiem.val(val);
		},

		addNewClass: function(e) {
			console.log('Add New Class');
			var self = this;

			if (!this.otherModel.get('facilityID')) {
				// mapping facilityID from model to otherModel
				this.otherModel.set('facilityID', this.model.get('id'));
			}

			if (this.currentView !== '#queue') {
				var tagsVal = $('#cl-tags').val().split(',');
					this.otherModel.set('tags', tagsVal);

				this.otherModel.save(this.otherModel.toJSON(), {
					success: function(res) {
						console.log(res);
						self.classesDetailsList.collection.create(res);
						self.classListStatusChecking(true);

						if (self.ui.calendarForm.hasClass('editing')) {
							self.classesDetailsList.render();
						}

						// clear form data
						self.clearFormData(res);
					},

					error: function(error) {
						console.log(error);
					}
				});

			} else {
				var _class = this.otherModel.attributes,
						classes = this.model.get('classes'),
						isValid = this.otherModel.isValid(true),
						isValidName = this.otherModel.isValid('className');

						if (isValid || isValidName) {
							self.classesDetailsList.collection.add(_class);
							classes.push(_class);
							self.classListStatusChecking(true);
						}
			}
		},

		classListStatusChecking: function(show) {
			var controls = this.ui.classes.find('.controls'),
					table = this.ui.classes.find('.table');

			if (this.model.get('classes').length > 0 || show ) {
				controls.hide();
				table.show();
			} else {
				table.hide();
				controls.show();
			}
		},

		clearFormData: function(otherModel) {
			var selectDate = this.ui.dayOfWeek;

		 	otherModel.unset('id');
			otherModel.unset('_id');
			otherModel.set('dayOfWeek', selectDate.val());
			this.newModelForCreateClass(_.clone(otherModel.attributes));
		},

		checkedDateInput: function(e) {
			var checkbox = $(e.target).parent().find('input');
			checkbox.trigger('click');
		},

		cancelEntry: function() {
			console.log('Cancel Entry');
			var startTime = this.$el.find('.cl-startTime'),
					endTime = this.$el.find('.cl-endTime');

		 	startTime.prop('selectedIndex', 0);
		 	endTime.prop('selectedIndex', 0);
			this.newModelForCreateClass(true);
			this.ui.addClassForm.hide();
			// console.log('Undo input class value');
			// console.log(this.lastModelAttr);
			// if (!this.otherModel.get('id')) {
			// 	this.showAddNewClass();
			// } else {
			// 	this.ui.calendarForm.html(editClassTpl(this.lastModelAttr.toJSON()));
			// }
		},

		invalid: function(view, attr, error, selector) {
	  	var $attr = view.$('#cl-' + attr).parent(),
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
	    var $attr = view.$('#cl-' + attr).parent();

	    $attr.parents('.control-group').removeClass('error');
	    $attr.find('.error-message').remove();
	  },

	  enableStickit: function(model) {
			this.stickit(model, this.otherBindings);
	  },

	  updateModel: function(model) {
	  	this.otherModel = model;
	  	this.lastModelAttr = this.otherModel.clone();
			this.enableStickit(this.otherModel);
	  },

		initAutocompleteSearch: function(answers, remove) {
			var input = this.ui.addClassForm.find('.tag-wrapper input');

			// remove old typeahead data
			if (remove) {
				var data;
				input.off();
				input.data('typeahead', (data = null));
			}

			// init old typeahead data
			input.typeahead({
				source: answers,
        items: 5
			});
		},

		onRender: function() {
			var classes = this.model.get('classes');

			if (this.currentView !== '#queue')
				this.ui.tags.tagsinput('items');

			this.classesDetailsList = new classesDetailsList(classes);

			// render class list
			this.classesDetailsList.render();
			this.classListStatusChecking();
		}
	});

	return ClassDetailsView;
});