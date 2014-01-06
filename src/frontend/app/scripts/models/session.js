/* Global define */
define([
	'conf',
  'api',
  'views/sidebar/sidebarView',
  'backbone-eventbroker'
], function(
	conf,
  api,
  sidebarView,
  EventBroker
) {
	'use strict';

	var SessionModel = Backbone.Model.extend({

		initialize: function() {
			// Check for sessionStorage support
      if (Storage && sessionStorage) {
        this.supportStorage = true;
      }
      EventBroker.register({
        'token:invalid': 'invalidToken'
      },this);
		},

    get: function(key){
      if (this.supportStorage) {
        var data = sessionStorage.getItem(key);

        if (data && data[0] === '{'){
          return JSON.parse(data);
        } else {
          return data;
        }
      } else {
        return Backbone.Model.prototype.get.call(this, key);
      }
    },

    set: function(key, value) {
      console.log(JSON.stringify(value));
      if (this.supportStorage) {
        sessionStorage.setItem(key, JSON.stringify(value));
      } else {
        Backbone.Model.prototype.set.call(this, key, value);
      }
      return this;
    },

    clear: function() {
      console.log("Clear Localstorage");
      if (this.supportStorage) {
        sessionStorage.clear();
      } else {
        Backbone.Model.prototype.clear(this);
      }
    },

    login: function(data) {
    	var self = this,
          invalidMsg = $('#invalid-msg');

      api.post('login', data, function(res) {
        if (res.status === 401 || res.status === 500) {
          invalidMsg.show();
        } else {
          invalidMsg.hide();
          $('#login').hide();
          $('#main').show();
          self.set('user', res);
          Backbone.EventBroker.trigger('session:logged');

          var SidebarView = new sidebarView({isDataEntry: res.isDataEntry});
          if (res.isDataEntry)
            Backbone.history.navigate('#queue', {trigger: true});
          else
            Backbone.history.navigate('#home', {trigger: true});

          SidebarView.render();
        }
      });
    },

    logout: function() {
      var self = this;
      
      api.post('logout', {}, function(res) {
        console.log(res);
        self.clear();
        Backbone.history.navigate('#login', {trigger: true});
      });
    },

    invalidToken: function(res) {
      // redirect to login page when Token invalid
      if (res.status === 404) {
        console.log("Invalid Token");
        this.clear();
        Backbone.history.navigate('#login', {trigger: true});
        return false;
      }
    }
	});

	var Session = function() {};

	Session.getInstance = function() {
		if (!instance) {
			var instance = new SessionModel();
		}

		return instance;
	};

	return Session.getInstance();
});