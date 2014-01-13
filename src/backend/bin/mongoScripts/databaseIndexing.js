db.facilities.ensureIndex("facilityName" : 1, "city" : 1, "state" : 1);
db.classes.ensureIndex("className" : 1, "facilityName" : 1, "classDescription" : 1);
 : regex} , {  : regex}, { schedule : {$elemMatch: {dayOfWeek: search.toLowerCase()}} }, { classDescription : regex}] }