var migration = require('../scraper/migration/facilityMigration.js');
var classMigration = require('../scraper/migration/classMigration.js');



describe('Test migration API', function(){
  

  it('Migrate facilities', function(done){
    migration.migrateFacility(function(){
    	done();
    })

  })

  // it('Migrate classes', function(done){
  //   classMigration.migrate(function(){
  //   	done();
  //   })

  // })

});


