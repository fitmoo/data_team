var mongoose = require('mongoose');

var FacilitySchema = new mongoose.Schema({ 
	//This is FacilityID of map.crossfit.com
	facilityID : Number,
	
	//This is FacilityID of existing Fitmoo facility
	fitmooFacilityID: Number,
	facilityName : String,
	lat : Number,
	lng : Number,
	address  : String,
	city  : String,
	state : String,
	zip : String,
	country : String,
	phoneNumber : String,
	 email  : String,
	websiteURL  : String,
	aboutus  : String,
	ownersName : String,
	images : [{ url : String, facilityId : String }],
	video: [ {url : String}],
	imagesCount : {type: Number, default: 0},
	videoCount : {type: Number, default: 0},
	tags : Array,
	verified : {type: Boolean, default: false},
	
	//0: Default
	//1: Save and finish later
	//2: Waiting for verified
	status: {type: Number, default: 0, enum : [0, 1, 2]},
	//Total missing fields
	missing: {type: Number, default: 0},
	//Order index to display on queue
	index: {type: Number, default: 0},
	checkOutBy: {type: String, default: ""},
	checkOutDate: {type: Date},

	//Migration status: 0 not OK, 1 : OK
	migrationStatus: { type: String, enum : [0, 1]},
	//Migration error note
	migrationNote: { type: String },

	//Check the website is already crawled
	isCrawl: {type: Boolean, default: false},
	//Number of photo crawl
	crawlPhotos: {type: Number, default: 0},
	//Number of video crawl
	crawlVideos: {type: Number, default: 0},
	//Crawling time in mins
	spendTime:  {type: Number, default: 0}

});

FacilitySchema.set('toJSON', { getters: true });

module.exports = FacilitySchema;

