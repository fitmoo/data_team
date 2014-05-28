var mongoose = require('mongoose');

var ExportEventSchema = new mongoose.Schema({
	facilityId : {type: String, default: ""},
    eventName : {type: String, default: ""},
    startDateTime : Date,
    endDateTime : Date,
    recurring: {type: String, default: ""},
    eventDescription: {type: String, default: ""},
    location : {type: String, default: ""},
});

ExportEventSchema.set('toJSON', { getters: true });

module.exports = ExportEventSchema;
