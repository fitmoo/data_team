var mongoose = require('mongoose');

var ExportFacilitySchema = new mongoose.Schema({ 

    facilityname : {type: String, default: ""},
    description:  {type: String, default: ""}, 
    location: {type: String, default: ""},
    country: {type: String, default: ""},
    phone : {type: String, default: ""},
    email:  {type: String, default: ""}, 
    website: {type: String, default: ""}
});

ExportFacilitySchema.set('toJSON', { getters: true });

module.exports = ExportFacilitySchema;
