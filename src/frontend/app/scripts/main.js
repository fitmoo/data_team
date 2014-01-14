require.config({
    paths: {
        'jquery': '../bower_components/jquery/jquery',
        'bootstrap': 'vendor/bootstrap',
        'text': '../bower_components/requirejs-text/text',
        'underscore': '../bower_components/underscore/underscore',
        'dom-ready': '../bower_components/requirejs-domready/domReady',
        'mockjax': '../bower_components/jquery-mockjax/jquery.mockjax',

        // backbone and modules
        'backbone':  '../bower_components/backbone/backbone',

        // The core view engine
        'backbone.marionette': '../bower_components/backbone.marionette/lib/core/amd/backbone.marionette',
        'backbone.wreqr': '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
        'backbone.babysitter': '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',

        // Backbone model validation
        'backbone-validation':   '../bower_components/backbone-validation/dist/backbone-validation-amd',

        // Local storage
        'backbone.localStorage': '../bower_components/backbone.localStorage/backbone.localStorage',

        // Event broker
        'backbone-eventbroker': 'vendor/backbone-eventbroker.amd',

        // Backbone Paginator
        'backbone.paginator': '../bower_components/backbone.paginator/lib/backbone.paginator',

        // Backbone Stickit
        // http://nytimes.github.io/backbone.stickit
        'stickit': '../bower_components/backbone.stickit/backbone.stickit',

        // backbone route-filter
        'route-filter': '../bower_components/backbone-route-filter/backbone-route-filter',

        // For handlebar template
        'hbs': '../bower_components/requirejs-hbs/hbs',
        'handlebars': '../bower_components/require-handlebars-plugin/Handlebars',

        // For getting json data file
        'json': '../bower_components/requirejs-plugins/src/json',

        // jquery file upload
        'jquery.fileupload': '../bower_components/jquery-file-upload/js/jquery.fileupload',
        'jquery.iframe.transport': '../bower_components/jquery-file-upload/js/jquery.iframe-transport',
        'jquery.fileupload.widget': '../bower_components/jquery-file-upload/js/vendor/jquery.ui.widget',
        'image.picker': 'vendor/image-picker',

        // A library for working with date time
        'moment': '../bower_components/momentjs/moment',

        'jquery.datepicker': '../bower_components/jquery.ui/ui/jquery.ui.datepicker',
        'jquery.core': '../bower_components/jquery.ui/ui/jquery.ui.core',

        // A library for jquery append when scrolldown
        'infiniScroll': 'vendor/infiniScroll',

        // A libarary for jquery pre-load images
        'pxLoader': '../bower_components/PxLoader/PxLoader',
        'pxLoaderImage': '../bower_components/PxLoader/PxLoaderImage',

        // A library for working with TAG
        'tagsinput': 'vendor/bootstrap-tagsinput'
    },
    shim: {
        'jquery': {
            exports: '$'
        },

        'jquery.datepicker': {
            deps: ['jquery', 'jquery.core']
        },

        'pxLoaderImage': {
            deps: ['jquery', 'pxLoader']
        },

        'underscore': {
            exports: '_'
        },

        'bootstrap': {
            deps: ['jquery']
        },

        'mockjax': {
          deps: ['jquery']
        },

        'backbone': {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },

        'backbone.marionette': {
            deps: ['backbone', 'backbone.wreqr', 'backbone.babysitter'],
            exports: 'Marionette'
        },

        'backbone.wreqr': {
            deps: ['backbone']
        },

        'backbone.babysitter': {
            deps: ['backbone']
        },

        'backbone-eventbroker': {
            deps: ['backbone']
        },

        'backbone-validation': {
            deps: ['backbone'],
            exports: ['Validation']
        },
        'backbone.paginator': {
            deps: ['backbone']
        },
        'route-filter': {
            deps: ['backbone']
        },
        'stickit': {
            deps: ['backbone']
        },
        'tagsinput': {
            deps: ['jquery']
        }

    }
});

require([
        'dom-ready',
        'jquery',
        'bootstrap',
        'underscore',
        'backbone'
    ], function (domReady) {
        'use strict';
        
        // use app here
        console.log('Running Admin tool');
        domReady(function () {
            require(['app'], function(app) {
                app.start();
                Backbone.history.start();
            });
        });
});
