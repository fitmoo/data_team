var async = require('async');
var jwt = require('jwt-simple');

var guid = require('../../utils/guid.js'),
	dateUtils = require('../../utils/dateUtils');
	errorObject = require('./errorResponse');

//Authentication lib
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

module.exports = {

	userService : null,
	authenticationService : null,
	secretKey : 'litte secret!!',


	/***************************************************************/

	init: function(userService, authenticationService){
		this.userService = userService;
		this.authenticationService = authenticationService;
		var self = this;

		/**************************************************************
		Login function
		*************************************************************/
		passport.serializeUser(function(user, done) {
		  done(null, 'A');
		});

		passport.deserializeUser(function(id, done) {
		  findById(id, function (err, user) {
		    done(err, user);
		  });
		});

		passport.use(new LocalStrategy({
		    usernameField: 'username',
		    passwordField: 'password'
			},
			function(username, password, done) {
			    self.userService.getOne({username: { $regex: username, $options: 'i' }, password: password}, function(err, foundUser){
			    	if(!err && foundUser) done(null, foundUser);
			    	else{
			    		done(err, false, {message: 'Invalid user name or password'})
			    	}
			    });
		  	}
		));
	},

	login: function(){
		return passport.authenticate('local');
	},

	logout: function(req, res){
		var token = req.query.token;
		this.authenticationService.removeToken(token, function(err, count){
			if(err) res.send(errorResponse);
			else
				res.send({msg : 'logout'});
		})
	},

	generateToken: function(req, res){
		var object = { username: req.body.username, random : guid.s4()};
		var passport = { token : jwt.encode(object, this.secretKey)};
		var self = this;
		//Get right
		this.userService.getOne({username: { $regex: req.body.username, $options: 'i' }}, function(err, foundUser){
			if(err){
				res.send(errorObject);
			} else{
				var isDataEntry = foundUser && foundUser.right && foundUser.right.indexOf('dataentry') >= 0;
			
				self.authenticationService.createToken({ username: object.username, token : passport.token, lastLogin : new Date()}, function(err, savedToken){
					if(err) res.send(errorObject);
					else {
						var returnObject = savedToken.toJSON();
						returnObject.isDataEntry = isDataEntry;
						res.send(returnObject);
					}
				})		
			}
		});
		
	},
	
	verifyToken : function(req, res, next) {
		next();
		/*
		var token = req.query.token;
		var expirePeriod = 60;
		var lastLogin = dateUtils.addMins(0 - expirePeriod);

		errorObject.authenticated = false;
		errorObject.status = 404;
		errorObject.msg = "token is invalid or expired";

		if (token && token.length > 0){
			this.authenticationService.getOne({token : token, lastLogin : { $gte : lastLogin }}, function(err, foundToken){
				if(err || !foundToken) { 
					res.send(errorObject);
				} else{
					foundToken.lastLogin = new Date();
					foundToken.save(function(err, updated){
						if(err) res.send(errorObject);
						else next();
					})
				}
			});
		} else{
			res.send(errorObject);
		}*/
	},


};