var oop = require('node-g3').oop,
    strUtils = require('../utils/strUtils'),
    async = require('async'),
    _ = require('underscore'),
    //log = require('../utils/logger')('databaseManager'),
    
    // Services
    ActiveService = require('./services/event'),
    FacilityService = require('./services/facility'),
    EventRequestService = require('./services/eventRequest'),
    ClassService = require('./services/class'),
    TagService = require('./services/tag'),
    UserService = require('./services/user'),
    AuthenticationService = require('./services/authentication'),
    FacilityEventService = require('./services/facilityEvent'),
    LookupService = require('./services/lookup'),
    PhotoService = require('./services/photo');
    CrawlStatusService = require('./services/crawlStatus');

/**
 * List of database service
 */
var servicesClasses = {
    Event: ActiveService,
    Facility: FacilityService,
    EventRequest : EventRequestService,
    Class : ClassService,
    Tag : TagService,
    User : UserService,
    Authentication : AuthenticationService,
    FacilityEvent : FacilityEventService,
    Lookup : LookupService,
    CrawlStatus : CrawlStatusService,
    Photo : PhotoService
};

/**
 * @class
 */
var DatabaseManager = oop.Base.extend({

    constructor: function(app, opts) {
        this.container = {};
        this.app = app;
        return this;
    },

    /**
     * Initial service instances
     */
    init: function (neededServices, fn) {
        var container = this.container,
            app = this.app;
        async.each(neededServices, function (neededService, done) {
            var service = container[neededService] = new servicesClasses[strUtils.firstUppercase(neededService)](app);
            service.init(done);

        }, function (error) {
            if (error) {
                //log.error('Database service init fail', error);
                console.log('Database service init fail: ', error);
            }
            else {
                //log.info('Database service init success');
                console.log('Database service init success: ');
            }
            fn(error);
        });
        
    },

    /**
     * Destroy server
     */
    destroy: function () {
        _.each(this.container, function (instance) {
            instance.terminal();
        });

    },

    /**
     * Get instance of service by name
     */
    getInstance: function (name) {
        return this.container[name];
    }
    
}, servicesClasses);

/**
 * Expose.
 */
module.exports = DatabaseManager;