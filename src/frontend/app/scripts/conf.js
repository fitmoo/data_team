/* Global define */
define([
  'moment',
  'handlebars'
], function(
  moment,
  Handlebars
) {
  'use strict';
  (function() {
    var hbs = Handlebars;

    // Calendar time is displays time relative to now, but slightly differently than moment#fromNow.
    hbs.registerHelper('momentCalendar', function(value) {
      if (value === '' || value === null)
        return '';
      
      return moment(value).calendar();
    });

    // select/option value render
    hbs.registerHelper('select', function(selected, options) {
      return options.fn(this).replace(
        new RegExp(' value=\"' + selected + '\"'),
        '$& selected="selected"');
    });



    // select/option value render
    hbs.registerHelper('find', function(v1, v2, array) {
      if (v1 === v2)
        return true;
    });

  })();

  return {
    PREFIX: '/api/',
    PAGE_LIMIT: 50,
    facilitiesTotalPages: 1,
    eventsTotalPages: 1,
    classesTotalPages: 1,
    allTagName: ''
  };
});