var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api',
    testFacility = {
        facilityName : 'FacilityName1',
        address  : 'address',
        city  : 'city',
        state : 'state',
        zip : 'zip',
        phoneNumber : '(090) 509-3480',
         email  : 'email',
        websiteURL  : 'websiteURL',
        aboutus  : 'aboutus',
        ownersName : 'ownersName',
        videoCount: 0,
        imagesCount: 0,
        video: [],
        images: [],
        tags: null,
        verified : true
    },

    testUpdateFacility = {
        facilityName : 'FacilityName1_Update',
        address  : 'address_Update',
        city  : 'city_Update',
        state : 'state_Update',
        zip : 'zip_Update',
        phoneNumber : '0905093480__Update',
         email  : 'email_Update',
        websiteURL  : 'websiteURL_Update',
        aboutus  : 'aboutus_Update',
        ownersName : 'ownersName_Update',
        //images : [ {url : '/images-upload/saveTest.png'} ],
        images : [ ],
        //video: [{ url :'http://www.youtube.com/watch?feature=player_detailpage&v=eBq1AupSrLI'} , { url :'http://www.youtube.com/watch?feature=player_detailpage&v=eoVNF1Zus7Q' }],
        tags : ['tag1_update', 'tag2_update', 'tag1', 'tag2', 'tag3'],
        verified : true

    },

      //Facility ID that host the class
      facilityID : null,
      className : 'Class Name', 
      classDescription: 'Class Desription',
      dayOfWeek : 'Monday',
      instructor : 'Tran Hoang',
      startTime : '10:30 AM',
      endTime : '11:30 AM',
      price : 23.5,
      tags : ['Yoga', 'Climb']

    },


    classArray =  [
        {
          className : 'Class Name 1', 
          classDescription: 'Class Desription',
          dayOfWeek : 'Monday',
          instructor : 'Tran Hoang',
          startTime : '10:30 AM',
          endTime : '11:30 AM',
          price : 23.5,
          tags : ['Yoga', 'Climb']
        },
        {
          className : 'Class Name 2', 
          classDescription: 'Class Desription',
          dayOfWeek : 'Tuesday',
          instructor : 'Tran Hoang',
          startTime : '10:30 AM',
          endTime : '11:30 AM',
          price : 23.5
        }
    ];


function compareObject(reqObject, resObject){
    copy = _.omit(resObject, ['__v', 'id']);
    isEqual = _.isEqual(reqObject, copy);
    copy = null;
    return isEqual;
}


describe('Test RESTFUL API', function(){
  var id;

  /*it('Create New Facility', function(done){
    var request = superagent.post(URI + '/facilities/');

    request
    .send(testFacility)
    .end(function(e,res){
       
        expect(e).to.eql(null);
        console.log(res.body.id);
        expect(res.body._id.length).to.eql(24);
        i = 0;
        _.map(testFacility.images, function(item){
          item._id = item.id = res.body.images[i]._id;
          testUpdateFacility.images[i]._id = item._id;
          testUpdateFacility.images[i].id = item._id;
          i++;
        })

        i = 0;
        _.map(testFacility.video, function(item){
          item._id = item.id = res.body.video[i]._id;
          testUpdateFacility.video[i]._id = item._id;
          testUpdateFacility.video[i].id = item._id;
          i++;
        })

        testFacility._id = res.body._id;
        //console.log(res.body);
        //console.log(testFacility);
        var equal = compareObject(testFacility, res.body);
        expect(equal).to.eql(true);
        done();
    });

  })

  it('Create New Class for Facility', function(done){
    var request = superagent.post(URI + '/facilities/classes');
    classTesting.facilityID = testFacility._id;
    request
    .send(classTesting)
    .end(function(e,res){
        expect(e).to.eql(null);
        expect(res.body._id.length).to.eql(24);
        classTesting._id = res.body._id;

        var equal = compareObject(classTesting, res.body);
        expect(equal).to.eql(true);
        done();
    });

  })

  it('Retrieves Facility ', function(done){
    superagent.get(URI + '/facilities/' + testFacility._id)
      .end(function(e, res){
        expect(e).to.eql(null);
        expect(res.body._id.length).to.eql(24);
        var classes = res.body.classes;
        var copy = _.omit(res.body, 'classes');
        
        //Compare classes
        expect(classes.length).to.eql(1);
        var equal = compareObject(classTesting, classes[0]);
        expect(equal).to.eql(true);
        

        //Compare facility
        i = 0;
        _.map(testFacility.images, function(item){
          item.facilityId = res.body.images[i].facilityId;
          i++;
        })

        i = 0;
        _.map(testFacility.video, function(item){
          item.facilityId = res.body.video[i].facilityId;
          i++;
        })


        equal = compareObject(testFacility, copy);
        expect(equal).to.eql(true);

        console.log('Retrieved facilityID '+ testFacility._id);
        done()
      })
  })

   it('removes a class', function(done){
    console.log('Going to delete class ' + classTesting._id);
    superagent.del(URI + '/facilities/classes/' + classTesting._id)
      .end(function(e, res){
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body.status).to.eql('success')    
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
                //console.log(res.body);
                expect(e).to.eql(null)
                expect(res.body).not.to.eql(null)
                var isEqual = compareObject(testUpdateFacility, res.body);
                expect(res.body._id).to.eql(testFacility._id)
                expect(isEqual).to.eql(true)
                done()
              })
  })

  var imageId = '';
  it('Add image to facility', function(done){
      superagent.post(URI + '/facilities/' +  testFacility._id + '/uploadImages')
                .attach('files[0]', path.resolve(__dirname, 'crossfit.png'))
                .end(function(e, res){

                    expect(e).to.eql(null);
                    expect(res.body).not.to.eql(null);
                    expect(res.body.id).not.to.eql(null);
                    imageId = res.body.id;
                    //expect(res.body.url).not.to.eql(null);
                    done();
                });
  })

   it('Take image away a facility', function(done){
      superagent.del(URI + '/facilities/' + testFacility._id + '/images/' + imageId )
                .end(function(e, res){
                    expect(e).to.eql(null);
                    expect(res.body).not.to.eql(null);
                    expect(res.body.status).to.eql('success');
                    done();
                });
  })

  
  var videoLink = ['http://www.youtube.com/watch?feature=player_detailpage&v=eBq1AupSrLI',
                    'http://www.youtube.com/watch?feature=player_embedded&v=mlVrkiCoKkg'];
  var videoId;
  it('Add video link to facility', function(done){
      superagent.post(URI + '/facilities/' +  testFacility._id + '/video')
                .send(videoLink)
                .end(function(e, res){
                    expect(e).to.eql(null);
                    //console.log(res.body);
                    expect(res.body.length).to.eql(2);
                    videoId = res.body[0]._id;
                    done();
                });
  })


  it('Delete video link to facility', function(done){
      superagent.del(URI + '/facilities/' +  testFacility._id + '/video/' + videoId)
                .end(function(e, res){
                    expect(e).to.eql(null);
                    expect(res.body.status).to.eql('success');
                    done();
                });
  })

  var arrayImages = [
      'http://katocrossfit.com/wp-content/uploads/2013/04/kato-crossfit-header-logo-300x128.png',
      'http://katocrossfit.com/wp-content/uploads/2013/04/ThanksgivingThrowdown-1120x356.png'
   
  ];

  it('Add a list of images link', function(done){
      superagent.post(URI + '/facilities/' +  testFacility._id + '/addImages')
                    .send(arrayImages)
                    .end(function(e, res){
                      //console.log(res.body);
                      expect(e).to.eql(null);
                      done();
      });
  });

  it('removes a facility', function(done){
    console.log('Going to delete facilityID ' + testFacility._id);
    superagent.del(URI + '/facilities/' + testFacility._id)
      .end(function(e, res){
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body.status).to.eql('success')    
        done()
      })
  })*/
  
  it('Create New Facility', function(done){
    var request = superagent.post(URI + '/facilities/');

    request
    .send(testFacility)
    .end(function(e,res){
       
        expect(e).to.eql(null);
        expect(res.body._id.length).to.eql(24);
        i = 0;
        testFacility._id = res.body._id;
        //console.log(res.body);        
        //console.log(testFacility);        
        var equal = compareObject(testFacility, res.body);
        expect(equal).to.eql(true);
        done();
    });
  });

  //Update classes inside facility
  it('Update Facility with class', function(done){
    var newFacility = _.clone(testFacility);
    newFacility.classes = classArray;

    var request = superagent.put(URI + '/facilities/' + newFacility._id)

    request
    .send(newFacility)
    .end(function(e,res){
        expect(e).to.eql(null);
        expect(res.body._id.length).to.eql(24);
        i = 0;
        expect(res.body.classes.length).to.above(0);
        expect(res.body.classes.length).to.eql(newFacility.classes.length);
        
        done();
    });
  });

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

