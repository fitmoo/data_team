var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    mongooseConnectionManager = require('../utils/mongoose-connection-manager'),
    BaseDBService = require('./base-db-service');
    require('mongoose-pagination');


module.exports = BaseDBService.extend({

    modelClass: null,

    /**
     * @overriden
     */
    init: function (fn) {
        mongooseConnectionManager.connect(this.nconf.get('database:mongodb:connectionString'), fn);
    },

    /**
     * @overriden
     */
    terminal: function (fn) {
        mongooseConnectionManager.disconnect();
        fn && fn();
    },

    /**
     * Count total records
     */
    countTotal: function (fn) {
        this.modelClass.count(fn);
    },

    /**
     * Count total records by condition
     */
    countTotalByCondition: function (opt, fn) {
        this.modelClass.count(opt, fn);
    },


    /**
     * Get all user in db
     */
    getAll: function (fn) {
        this.modelClass.find(fn);
    },

    /**
     * Find one records
     */
    getOne: function (opts, fn) {
        this.modelClass.findOne(opts, fn);
    },

    /**
     * Find one record by ID
     */
    findByID: function (id, fn) {
        this.modelClass.findById(id, fn);
    },

    /**
     * Find records
     */
    find: function (opt, fn) {
        var paginate = opt.paginate || {
                page: 0,
                limit: 100
            },
            sortOpts = opt.sort || {
                _id: -1
            },
            searchOpts = opt.search || {},
            responseFields = opt.fields || null;

        var findQuerySet = null,
            modelClass = this.modelClass;
        if (responseFields)
            findQuerySet = modelClass.find(searchOpts, responseFields);
        else
            findQuerySet = modelClass.find(searchOpts);

        var perPage = paginate.limit,
            page = paginate.page;
        
        // query & paging
        findQuerySet
            .limit(perPage)
            .skip(perPage * page)
            .sort(sortOpts)
            .exec(function (err, datas) {
                findQuerySet.count().exec(function (err, count) {
                    fn(err, datas, count);
                })
            })
    },



    /**
     * Create new record
     */
    create: function (data, fn) {
        new this.modelClass(data).save(fn);
    },

    /**
     * Update
     */
    update: function (id, data, fn) {
        var self = this;
        this.modelClass.findOne({_id: id}, function (err, model) {
            if (model) {
                _.each(data, function (value, key) {
                    model[key] = value;
                });
                model.save(fn);
            } else {
                self.create(data, fn);
            }
        });
    },

    /**
     * Update an existing document
     */
    updateData: function (id, data, fn) {
        var self = this;
        this.modelClass.findOne({_id: id}, function (err, model) {
            if (model) {
                
                _.each(data, function (value, key) {
                    model[key] = value;
                });
                model.save(fn);
            } else{
                fn && fn();
            }
        });
    },

    /*
    * Delete an document
    */
    remove : function(id, fn){
        this.modelClass.findOneAndRemove({_id: id}, fn);
    }
});