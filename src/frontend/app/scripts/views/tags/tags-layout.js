/* Global define */
define([
	'handlebars',
	'api',
	'models/session',
	'backbone-eventbroker',

	// views
	'views/tags/tags-list',

	// templates
	'hbs!templates/tags/tags-layout',

	'backbone.marionette',
	'tagsinput'
], function(
	Handlebars,
	api,
	Session,
	EventBroker,
	tagsListView,
	tagsLayoutTpl
) {
	'use strict';

	var TagsLayout = Backbone.Marionette.Layout.extend({
		template: tagsLayoutTpl,

		el: '#tags',

		ui: {
			createBtn: '.create-btn',
			deleteBtn: '.delete-btn',
			createTxt: '#tags-name',
			addTagBtn: '#add-tags',
			deleteTxt: '#delete-tag-names',
			createTagPopup: '#create-new-tags',
			deleteTagPopup: '#delete-tags-popup',
			indicator: '.indicator',
			cancelBtn: '.cancel-btn'
		},

		events: {
			'change #tags-name': 'enableAddTag',
			'change #delete-tag-names': 'enableDeleteTag',
			'click .create-btn': 'addNewTags',
			'click .delete-btn': 'deleteTags',
			'keyup input': 'disableQuickKeyCode',
			'keyup .add-tags': 'enterToSave'
		},

		initialize: function() {
			EventBroker.register({
				'tags:hideIndicator': 'hideIndicator',
				'tags:showIndicator': 'showIndicator',
				'tags:autocomplete': 'initAutocompleteSearch',
				'tags:showCreateForm': 'showCreateForm'
			},this);
		},

		showCreateForm: function() {
			this.ui.addTagBtn.click();
		},

		enableAddTag: function() {
			this.ui.createBtn.removeAttr('disabled');
		},

		enableDeleteTag: function() {
			this.ui.deleteBtn.removeAttr('disabled');
		},

		showIndicator: function() {
			this.ui.indicator.show();
		},

		hideIndicator: function() {
			this.ui.indicator.hide();
		},

		disableQuickKeyCode: function(e) {
			var keycode = e.keyCode;

			if(keycode === 65 || keycode === 97)
				e.stopPropagation();
		},

		enterToSave: function(e) {
			var keycode = e.keyCode;

			if(keycode === 13)
				this.addNewTags();

		},

		show: function() {
			this.$el.show();
			
			// render tags list
			if(!this.tagsListView){
				this.showIndicator();
				this.tagsListView = new tagsListView();
				this.collection = this.tagsListView.collection;
			}
		},

		addNewTags: function() {
			var self = this,
					val = this.ui.createTxt.val().trim(),
					data = val.split(',');
					console.log(this.collection);

			console.log('Create tags:', data);
			if (val !== "") {
				api.post('tags?token='+ Session.get('user').token, data, function(res) {
					console.log(res);

					// redirect to login page when Token invalid
					Backbone.EventBroker.trigger('token:invalid', res);

					// redirect to login page when Token invalid
					Backbone.EventBroker.trigger('token:invalid', res);
					
					self.ui.createTxt.tagsinput('removeAll');
					self.ui.createBtn.attr('disabled','disabled');
					self.collection.add(res.createdTags);
					self.ui.cancelBtn.click();
					
					// updat autocomplete search source
					self.initAutocompleteSearch(res.allTagName, true);
				});
			}
		},

		deleteTags: function() {
			var self = this,
					val = this.ui.deleteTxt.val().trim(),
					data = val.split(',');

			console.log('Delete tags:',data);
			if (val !== "") {
				api.del('tags?token=' + Session.get('user').token, data, function(res) {
					console.log(res);

					// redirect to login page when Token invalid
					Backbone.EventBroker.trigger('token:invalid', res);

					self.collection.remove(res.removedTag);

					// updat autocomplete search source
					self.initAutocompleteSearch(res.allTagName, true);

					self.ui.deleteTxt.tagsinput('removeAll');
					self.ui.deleteBtn.attr('disabled','disabled');
				});
			}

		},

		initAutocompleteSearch: function(answers, remove) {
			var input = this.ui.deleteTagPopup.find('input');

			if (remove) {
				var data;
				input.off();
				input.data('typeahead', (data = null));
			}

			input.typeahead({
				source: answers,
        items: 5
			});
			input.addClass('del-tags');
		},

		onRender: function() {
			this.ui.createTxt.tagsinput('items');
			this.ui.deleteTxt.tagsinput('items');
			this.ui.createTagPopup.find('input').addClass('add-tags');
		}
	});

	return TagsLayout;
});