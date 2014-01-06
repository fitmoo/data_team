var oop = require('node-g3').oop;

module.exports = oop.Base.extend({

    constructor: function (nconf, app, opts) {
      this.nconf = nconf;
      this.app = app;
      this.opts = opts;  
    },

    /**
     * Initialize service
     * Should be overriden by subclass
     */
    init: function (fn) {
        fn && fn();

    },

    /**
     * Terminal service
     * Should be overriden by subclass
     */
    terminal: function (fn) {
        fn && fn();
    }

});