var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({ 

	_id : String,
	eventName : String,
	
	//Event GUID in action.com system.
	assetGuid : String,
	//Parent Event GUID in action.com system.
	assetParentGuid : String,

	eventPrice : [{effectiveUntilDate : {type: Date, default: null}, price : Number}],
	activities : [ { _id : String,  name: String, price: Number, startDate : {type: Date, default: null}, endDate : {type: Date, default: null}  } ],
	eventDescription : String,
	startDateTime : Date,
	startHour: {type: String},
	startMins: {type: String},
	startMeridiem: {type: String},
	endDateTime : Date,
	endHour: {type: String},
	endMins: {type: String},
	endMeridiem: {type: String},
	timezone  : String,
	timezoneDST : Number,
	address1 : String,
	address2 : String,
	city : String,
	postalCode : String,
	stateProvinceCode : String,
	country : String,
	desctiption : String,
	registrationSiteURL : String,
	hostEmail : String,
	hostName : String,
	hostPhone : String,
	tags : Array
});
EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('_id', false);
module.exports = EventSchema;


