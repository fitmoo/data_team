var mongoose = require('mongoose');

var ExportEventSchema = new mongoose.Schema({ 
    eventName : {type: String, default: ""},
    startDateTime : Date,
    endDateTime : Date,
    recurring: {type: String, default: ""},
    eventDescription: {type: String, default: ""}
});

ExportEventSchema.set('toJSON', { getters: true });

module.exports = ExportEventSchema;

