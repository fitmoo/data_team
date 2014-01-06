/* Global define */
define([
	'jquery',
	'underscore',
	'mockjax'
], function(
	$,
	_

){
	'use strict';
	
	var doMock = function() {
		$.mockjax(function(settings) {
			var url = settings.url;

			// GET facilities list data
			if (url.match(/\/api\/facilities/))
				return {
					proxy: '/scripts/data/facilities.json'
				};
		});
	};

	return {
		mock: doMock
	};
});