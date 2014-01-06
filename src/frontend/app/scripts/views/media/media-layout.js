/* Global define */
define([
	'conf',
	'api',
	'models/session',
	// template
	'hbs!templates/media/media-layout',
	'hbs!templates/media/find-photo-item',
	'hbs!templates/media/find-video-item',

	// views
	'views/media/photos',
	'views/media/videos',

	'jquery.fileupload',
	'image.picker',
	'backbone.marionette'
], function(
	conf,
	api,
	Session,
	mediaLayoutTpl,
	findPhotoItemtpl,
	findVideoItemtpl,
	photoView,
	videoView
) {
	'use strict';

	var MediaLayout = Backbone.Marionette.ItemView.extend({
		template: mediaLayoutTpl,

		el: '.media-wrapper',

		ui: {
			addPhotoBtn: '#photo-upload',
			imagePicker: '.image-picker',
			videoPicker: '.video-results',
			findPhotoTxt: '#find-photos-txt',
			findVideosTxt: '#find-videos-txt',
			overlay: '.overlay',
			photoList: '.photos-list',
			videoList: '.videos-list',
			noImage: '.no-image',
			photos: '#photos-wrapper',
			videos: '#videos-wrapper',
			videoItem: '.video-item',
			videoPopup: '#videos-popup',
			photoPopup: '#myModal',
			noPhotos: '.no-photos',
			noVideos: '.no-videos'
		},

		events: {
			'click #photo-upload': 'addPhotoFromMachine',
			'click .find-btn': 'findImages',
			'click .find-videos-btn': 'findVideos',
			'click .upload-photos-btn': 'uploadImages',
			'click .upload-videos-btn': 'uploadVideos',
			'click .video-btn': 'showVideo',
			'click .photo-btn': 'showPhoto',
			'click .close-btn': 'hideOverlay',
			'keyup #find-photos-txt': 'onEnterFindPhotoTextbox',
			'keyup #find-videos-txt': 'onEnterFindVideoTextbox'
		},

		addPhotoFromMachine: function() {
			console.log('Add new photo from machine');
			var self = this;

			this.ui.addPhotoBtn.fileupload({
        dataType: 'json',
        done: function (e, data) {
					self.ui.noPhotos.hide();
        	console.log('SUCCESS add new photo', data);
          self.photoView.collection.add({ url: data.result.url });
        }
    	});
		},

		findImages: function() {
			var self = this,
					val = this.ui.findPhotoTxt.val().trim();

			console.log("Find photos at:", val);

			this.ui.overlay.show();
			// clear old data
			self.ui.imagePicker.html('');

			// find images from website URL input
			api.get(['searchImages?url=', val].join(''), function(res) {

				// redirect to login page when Token invalid
				Backbone.EventBroker.trigger('token:invalid', res);

				var length = res.length;

				if (length === 0 || !length) {
					self.ui.noImage.show();
					self.ui.overlay.hide();
				} else {
					self.ui.noImage.hide();
					_.each(res, function(url,idx) {
						// append find search to Find Photos Popup
						self.ui.imagePicker.append(findPhotoItemtpl({url: url}));

						if (idx === length -1) {
							self.ui.imagePicker.imagepicker({
								limit: 8
							});
							self.hideOverlay();
						}
					});
				}
			});
		},

		onEnterFindPhotoTextbox: function(e) {
			// press enter to find photo textbox
			if (e.which === 13)
				this.findImages();
		},

		findVideos: function() {
			var self = this,
					val = this.ui.findVideosTxt.val().trim();

			console.log("Find videos at:", val);

			this.ui.overlay.show();
			// clear old data
			self.ui.videoPicker.html('');

			// find videos from website URL input
			api.get(['searchVideos?url=', val, '&token=', Session.get('user').token].join(''), function(res) {
				self.VideoItemLength = res.length;

				if (self.VideoItemLength === 0 || !self.VideoItemLength) {
					// VIDEO NOT FOUND CASE
					self.ui.videoPicker.append("<li>Video not found</li>");
					self.ui.overlay.hide();
				} else {
					_.each(res, function(url,idx) {
						// append find search to Find Videos Popup
						self.ui.videoPicker.append(findVideoItemtpl({url: url}));

						if (idx === self.VideoItemLength -1) {
							self.hideOverlay();
						}
					});
				}

			});

		},

		onEnterFindVideoTextbox: function(e) {
			// press enter to find video textbox
			if (e.which === 13)
				this.findVideos();
		},

		showPhoto: function() {
			this.ui.videos.hide();
			this.ui.photos.show();
		},

		showVideo: function() {
			this.ui.photos.hide();
			this.ui.videos.show();
		},

		hideOverlay: function() {
			this.ui.overlay.hide();
		},

		uploadImages: function() {
			var self = this,
					urls = this.ui.imagePicker.val(),
					param= ['facilities/', this.model.get('id'), '/addImages?token=', Session.get('user').token].join('');

			console.log('Upload urls:',urls);
			api.post(param,urls, function(res) {
				self.ui.noPhotos.hide();
				// add/render new photos to photos collection
				self.photoView.collection.add(res);
				self.ui.photoPopup.modal('hide');
			});
		},

		uploadVideos: function() {
			var self = this,
					urls = [],
					param= ['facilities/',this.model.get('id'),'/video?token=', Session.get('user').token].join(''),
					videoList =this.ui.videoPicker.find('input');

			// push all videos had choose to urls
			_.each(videoList, function(element, index) {
				var input = $(element);
					if (input.is(':checked')) {
						urls.push(input.val());
					}

					if (index === self.VideoItemLength-1) {
						api.post(param,urls, function(res) {

							// redirect to login page when Token invalid
							Backbone.EventBroker.trigger('token:invalid', res);
							
							self.ui.noVideos.hide();
							console.log('Upload video urls:',res);
							// add/render new videos to videos collection
							self.videoView.collection.add(res);
							self.ui.videoPopup.modal('hide');
						});
					}
			});
		},

		onRender: function() {
			console.log("Render media views");
			var images = this.model.get('images'),
					videos = this.model.get('video');
			this.photoView = new photoView(images);
			this.photoView.render();
			if(images.length && images.length > 0) {
				this.ui.noPhotos.hide();
			}

			// DEFAULT: show photos tags 
			this.showPhoto();

			this.videoView = new videoView(videos);
			this.videoView.render();
			if(videos.length && videos.length > 0) {
				this.ui.noVideos.hide();
			}
		}
	});

	return MediaLayout;
});