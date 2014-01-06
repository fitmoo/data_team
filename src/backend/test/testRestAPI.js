var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api',
    testFacility = {
        facilityName : 'FacilityName',
        address  : 'address',
        city  : 'city',
        state : 'state',
        zip : 'zip',
        phoneNumber : '0905093480',
         email  : 'email',
        websiteURL  : 'websiteURL',
        aboutus  : 'aboutus',
        ownersName : 'ownersName',
        images : ['http://localhost/demofile.png', 'http://localhost/demofile2.png'],
        video: ['http://www.youtube.com/watch?feature=player_detailpage&v=eBq1AupSrLI', 'http://www.youtube.com/watch?feature=player_detailpage&v=eoVNF1Zus7Q'],
        tags : ['tag1', 'tag2']

    },

    testUpdateFacility = {
        facilityName : 'FacilityName_Update',
        address  : 'address_Update',
        city  : 'city_Update',
        state : 'state_Update',
        zip : 'zip_Update',
        phoneNumber : '0905093480__Update',
         email  : 'email_Update',
        websiteURL  : 'websiteURL_Update',
        aboutus  : 'aboutus_Update',
        ownersName : 'ownersName_Update',
        images : ['http://localhost/demofile_update.png', 'http://localhost/demofile2_update.png'],
        video: ['http://www.youtube.com/watch?feature=player_detailpage&v=eBq1AupSrLI', 'http://www.youtube.com/watch?feature=player_detailpage&v=eoVNF1Zus7Q'],
        tags : ['tag1_update', 'tag2_update']

    };


function compareObject(reqObject, resObject){
    copy = _.omit(resObject, '__v', 'id');
    isEqual = _.isEqual(reqObject, copy);
    copy = null;
    return isEqual;
}


describe('Test RESTFUL API', function(){
  var id;

  it('Create New Facility', function(done){
    var request = superagent.post(URI + '/facilities/');

    request
    .send(testFacility)
    .end(function(e,res){
       
        expect(e).to.eql(null);
        expect(res.body._id.length).to.eql(24);
        testFacility._id = res.body._id;
        var equal = compareObject(testFacility, res.body);
        expect(equal).to.eql(true);
        done();
    });

  })

  it('Retrieves Facility', function(done){
    superagent.get(URI + '/facilities/' + testFacility._id)
      .end(function(e, res){
        expect(e).to.eql(null);
        expect(res.body._id.length).to.eql(24);
        var equal = compareObject(testFacility, res.body);
        expect(equal).to.eql(true);
        console.log('Retrieved facilityID '+ testFacility._id);
        done()
      })
  })

  
  it('retrieves a collection', function(done){
    superagent.get(URI + '/facilities/')
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })

  
  it('updates a facility', function(done){
    testUpdateFacility._id = testFacility._id;
    superagent.put(URI + '/facilities/' + testFacility._id)
              .send(testUpdateFacility)
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body).not.to.eql(null)
                var isEqual = compareObject(testUpdateFacility, res.body);
                expect(res.body._id).to.eql(testFacility._id)
                expect(isEqual).to.eql(true)
                done()
              })
  })

  it('removes a facility', function(done){
    console.log('Going to delete facilityID ' + testFacility._id);
    superagent.del(URI + '/facilities/' + testFacility._id)
      .end(function(e, res){
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body.status).to.eql('success')    
        done()
      })
  })
});


/*
* TEST CLASS API
*/

