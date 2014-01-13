
/**
 * Module dependencies.
 */

var express = require('express')
  , namespace = require('express-namespace')
  , http = require('http')
  , path = require('path');


var facility = require('./routes/facility'),
    classRouter = require('./routes/class'),
    eventRouter = require('./routes/event'),
    dashBoard = require('./routes/dashBoard'),
    tag = require('./routes/tag'),
    lookup = require('./routes/lookup'),
    exportRouter = require('./routes/export'),
    user = require('./routes/user'),
    crawl = require('./routes/crawl'),
    photo = require('./routes/photo'),
    DatabaseManager = require('../data/'),
    configs = require('../utils/configs');

var passport = require('passport');
var app = express();



app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());

  //For testing purpose---//
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //--------------------//
  
  app.use(express.urlencoded());
  app.use(express.multipart());
  app.use(express.methodOverride());
  app.use(passport.initialize());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'exports')));
});


//Login request
app.namespace('/api/login', function(){
  app.post('/', user.login(), function(req, res){
    user.generateToken(req, res);
  });

});
//Log out request
app.namespace('/api/logout', function(){
  app.post('/', function(req, res){
    user.logout(req, res);
  });
});



//Facility function
app.namespace('/api/facilities', function(req, res, next){ user.verifyToken(req, res, next); } , function() {
  //Search Facility
  app.get('/', function(req, res){ facility.search(req, res); });

  //List Duplicate Facility
  app.get('/duplicate', function(req, res){ facility.listDuplicate(req, res); });

  //Search Facility Queue
  app.get('/queue', function(req, res){ facility.getQueue(req, res); });

  //Search Facility Queue
  app.get('/checkout/:id', function(req, res){ facility.checkOut(req, res); });

  //Undo checkout
  app.post('/undoCheckOut/:id', function(req, res){ facility.undoCheckOut(req, res); });

  

  //Get number of facilities don't have photo/video
  app.get('/needPhotoVideo', function(req, res){ facility.facilityNeedUpdateMedia(req, res); });
  
  //New Facility
  app.post('/', function(req, res){ facility.create(req, res); });

  //View a facility
  app.get('/:id', function(req, res){ facility.findById(req, res); });

  //Update Facility
  app.put('/:id', function(req, res){ facility.update(req, res); });
  
  //Delete Facility
  app.delete('/:id', function(req, res){ facility.delete(req, res); });

  //Create Class
  app.post('/classes', function(req, res){ classRouter.create(req, res); });

  //Update Class
  app.put('/classes/:id', function(req, res){ classRouter.update(req, res); });

  //Delete class
  app.delete('/classes/:id', function(req, res){ classRouter.delete(req, res); });

  //upload image
  app.post('/:id/uploadImages', function(req, res){ facility.uploadImage(req, res); });

  //add images
  app.post('/:id/addImages', function(req, res){ facility.addImages(req, res); });

  //Remove image
  app.delete('/:facilityId/images/:imageId', function(req, res){ facility.removeImage(req, res); });

  //Add video link
  app.post('/:facilityId/video', function(req, res){ facility.addVideoLinks(req, res); });

  //Remove video link
  app.delete('/:facilityId/video/:videoId', function(req, res){ facility.deleteVideoLink(req, res); });

});

//Dashboard
app.namespace('/api/dashBoard', function(req, res, next){ user.verifyToken(req, res, next); }, function() {
    app.get('/', function(req, res){ dashBoard.getDashBoard(req, res); });
});

//Search images
app.namespace('/api/searchImages', function() {
    app.get('/', function(req, res){ facility.searchImages(req, res); });
});

//Search videos
app.namespace('/api/searchVideos', function() {
    app.get('/', function(req, res){ facility.searchVideos(req, res); });
});

//Class Routing
app.namespace('/api/classes', function(req, res, next){ user.verifyToken(req, res, next); }, function() {
  //Search Classes
  app.get('/', function(req, res){ classRouter.search(req, res); });

});

//Event Routing
app.namespace('/api/events', function(req, res, next){ user.verifyToken(req, res, next); }, function() {
  
  //Search Events
  app.get('/', function(req, res){ eventRouter.search(req, res); });

  //Create Events
  app.post('/', function(req, res){ eventRouter.create(req, res); });

  //View an event
  app.get('/:id', function(req, res){ eventRouter.findById(req, res); });

  //Update an event
  app.put('/:id', function(req, res){ eventRouter.update(req, res); });
  
  //Delete an event
  app.delete('/:id', function(req, res){ eventRouter.delete(req, res); });

  //Delete an activity

});


//Tags Routing
app.namespace('/api/tags', function(req, res, next){ user.verifyToken(req, res, next); }, function() {
  
  //Get All tags
  app.get('/', function(req, res){ tag.getAllTags(req, res); });
  
  //Create tags
  app.post('/', function(req, res){ tag.createTags(req, res); });

  //Remove tags
  app.delete('/', function(req, res){ tag.removeTags(req, res); });
 

});

app.namespace('/api/exports', function(){
  app.get('/', function(req, res) { exportRouter.exportData(req, res); });
})
 
//Lookup data
app.namespace('/api/lookup', function(){

  //Countries
  app.get('/countries', function(req, res) { lookup.getCountries(req, res); });

  app.get('/countriesName', function(req, res) { lookup.getCountriesName(req, res); });
  
  //Countries list by name
  app.get('/countriesAndStates', function(req, res) { lookup.getCountryAndStates(req, res); });

  //Get States
  app.get('/countries/:countryCode/states', function(req, res) { lookup.getStatesByCountryCode(req, res); });

})

//Crawl event
app.namespace('/api/crawl', function(){

  app.get('/active.com', function(req, res) { crawl.startCrawlActive(req, res); });
  app.get('/active.com/checkStatus', function(req, res) { crawl.checkStatus(req, res); });

});

//Photos selector
app.namespace('/api/photos', function(){

  app.get('/', function(req, res) { photo.search(req, res); });
  app.put('/', function(req, res) { photo.markDelete(req, res); });

});

var db = new DatabaseManager(configs);
var services = ['Facility', 'Class', 'Event', 'Tag', 'User', 'Authentication', 'Lookup', 'CrawlStatus', 'Photo'];

db.init(services, function(){

  facility.init(db.getInstance(services[0]), db.getInstance(services[1]), db.getInstance(services[3]));
  classRouter.init(db.getInstance(services[0]), db.getInstance(services[1]), db.getInstance(services[3]));
  eventRouter.init(db.getInstance(services[2]), db.getInstance(services[3]));
  dashBoard.init(db.getInstance(services[0]), db.getInstance(services[1]), db.getInstance(services[2]));
  tag.init(db.getInstance(services[3]));
  user.init(db.getInstance(services[4]), db.getInstance(services[5]));
  lookup.init(db.getInstance(services[6]));
  crawl.init(db.getInstance(services[7]));
  photo.init(db.getInstance("Photo"));

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });


})

