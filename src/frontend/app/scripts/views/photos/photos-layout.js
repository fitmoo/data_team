/* Global define */
define([
	'api',
	'models/session',
	'backbone-eventbroker',

	// template
	'hbs!templates/photos/photos-layout',

	'views/photos/photos-list',

	'json!data/photos.json',
	'infiniScroll',

	'backbone.marionette'
], function(
	api,
	Session,
	EventBroker,
	photoLayoutTpl,
	photoListView,
	photosData
) {
	'use strict';

	var photosLayout = Backbone.Marionette.ItemView.extend({
		template: photoLayoutTpl,

		el: '#photos',

		ui: {
			imagePicker: '#photo-selection',
			indicator: '.indicator'
		},

		scrollValue: 0,

		initialize: function() {
			EventBroker.register({
				'photosIndicator:hide': 'hideIndicator',
				'photosIndicator:show': 'showIndicator'
			}, this);
		},

		events: {
		},

		show: function() {
			this.$el.show();
			this.photoList = new photoListView();
			this.collection = this.photoList.collection;
		},

		hideIndicator: function() {
			this.ui.indicator.hide();
		},

		showIndicator: function() {
			this.ui.indicator.show();
		},

		onRender: function() {
		}
	});

	return photosLayout;

});