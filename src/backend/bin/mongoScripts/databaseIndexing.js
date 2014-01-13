db.facilities.ensureIndex({"facilityName" : 1, "city" : 1, "state" : 1});
db.classes.ensureIndex({"className" : 1, "facilityName" : 1, "schedule" : 1, "classDescription" : 1, "price" : 1});
db.events.ensureIndex({"eventName" : 1, "address1" : 1, "address2" : 1, "city" : 1, "stateProvinceCode" : 1, "country" : 1, "startDateTime" : 1, "endDateTime" : 1, "eventPrice" : 1}, {name:"eventIndex"});