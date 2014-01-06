/* Global define */
define([
  'conf'
], function(
  conf
) {
	'use strict';

	var urlPrefix = conf.PREFIX;
  var  user = conf.user;

	function adminApi(urlPrefix) {
		console.log("Initializes Rest Client");

    // Wrapping jquery ajax
    function ajax(type, url, data, callback) {

      if (_.isFunction(data)) {
        callback = data;
        data = null;
      } 

      var params = {
        type: type,
        url: url
      };

      if (data) {
        // format JSON data to string
        params.data = data? JSON.stringify(data) : null;      
        params.dataType = 'json';
      }

      if (type == 'POST' || type == 'PUT' || type == 'DELETE')
        params.contentType = 'application/json';

      return $.ajax(params).success(function(res) {
        callback(res);

      }).error(function(res) {
        callback(res);
      });
    }

    return {
      url: function(url) {
        return urlPrefix + url;
      },

      csrftoken: function() {
        return getCookie('csrftoken');
      },

      post: function(url, data, callback) {
        return ajax('POST', [urlPrefix, url].join(''), data, callback);
      },

      get: function(url, data, callback) {
        return ajax('GET', [urlPrefix, url].join(''), data, callback);
      },

      del: function(url, data, callback) {
        return ajax('DELETE', [urlPrefix, url].join(''), data, callback);
      },
      
      put: function(url, data, callback) {
        return ajax('PUT', [urlPrefix, url].join(''), data, callback);
      }
    };
	}

	var api = adminApi(urlPrefix);

	return api;
});