var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    BaseDBService = require('../base-mongodb-service');
    Country = require('../models/countryModel');
    State = require('../models/stateModel');


module.exports = BaseDBService.extend({
	countryModel : Country,
    stateModel : State,

    /*
    * Get all countries
    */
	getCountryList: function(fn){
        this.countryModel.find({}, {_id: false}, fn);
    },

    /*
    * Get all countries
    */
    getCountriesName: function(fn){
        this.countryModel.find({}, {_id: false, code2: false, code3: false}, function(err, countries){
            if(!err && countries)
                fn(err, _.pluck(countries, 'name'));
            else
                fn(err, null);
        });
    },
    
    /*
    * Get All state by country code
    */
    getStatesByCountryCode: function(countryCode, fn){
        this.stateModel.find({countryCode : countryCode}, {_id: false}, fn);
    },

    /*
    * Get All states
    */

    getStatesByCountryCode: function(fn){
        this.stateModel.find({countryName : {$exists : true}}, {_id: false}, function(err, states){
            if(!err && states){
                var returnObject = {};

                _.each(states, function(item){
                    if(!returnObject[item.countryName]) returnObject[item.countryName] = [];
                    returnObject[item.countryName].push(item.name);
                });

                fn(err, returnObject);
            } else{
                fn(err, null);
            }
        });
    }    
});