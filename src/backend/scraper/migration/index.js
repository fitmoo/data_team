var facilityMigration = require('./facilityMigration.js');
var classMigration = require('./classMigration.js');
var event_facility = require('./event_facility.js');

//facilityMigration.migrateFacility();
//console.log(classMigration);
classMigration.migrate();
//event_facility.link();

