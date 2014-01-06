/* Global define */
define([
	'handlebars',

	// template
	'hbs!templates/views/login',

	// model
	'models/session',

	'backbone.marionette'
], function(
	Handlebars,
	loginTpl,
	Session
) {
	'use strict';

	var LoginView = Backbone.Marionette.ItemView.extend({
		template: loginTpl,

		el: '#login',

		ui: {
			username: '#login-username',
			password: '#login-password',
			invalidBlankMsg: '#blank-val-msg',
			invalidMsg: '#invalid-msg'
		},

		events: {
			'click .btn-primary': 'login',
			'keyup input': 'onEnter'
		},

		onEnter: function(e) {
			// press enter to login
			if (e.which === 13)
				this.login();
		},

		login: function() {
			var username = this.ui.username.val().trim(),
					password = this.ui.password.val().trim(),
					data = {
						username: username,
						password: password
					};
			
      if (username === "" || password === "") {
      	this.ui.invalidBlankMsg.show();
      	this.ui.invalidMsg.hide();
      } else {
      	this.ui.invalidBlankMsg.hide();
				Session.login(data);
      }
		}

	});

	return LoginView;

});