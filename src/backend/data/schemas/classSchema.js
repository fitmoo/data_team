var mongoose = require('mongoose');



var ClassSchema = new mongoose.Schema({ 
	//Facility ID that host the class
	facilityID : String,
	//Searching purpose
	facilityName: String,
	//Fitmo FacilityId on old system
	fitmooFacilityID : Number,

	className : String,	
	classDescription: String,
	instructor : String,
	//dayOfWeek : Array,
	//startTime : String,
	//endTime : String,
	schedule: [
		{
			dayOfWeek : {type : String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']},
			times:
			[
				{ startTime : {type: String, default: ""}, endTime : {type: String, default: ""} }
			]
		}
	],
	timeZone : String,
	price : Number,
	tags : Array,
	
	//Migration status: 0 not OK, 1 : OK
	migrationStatus: { type: String, enum : [0, 1]},
	//Migration error note
	migrationNote: { type: String }

});

ClassSchema.set('toJSON', { virtuals: true, id : true, getters: true });
module.exports = ClassSchema;
