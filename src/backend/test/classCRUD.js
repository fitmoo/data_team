var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api',
    classTesting = { 
          facilityID : "527388f95c4c8caa03001cc1",
          className : 'Class Name', 
          classDescription: 'Class Desription',
          instructor : 'Tran Hoang',
          schedule : [
            {
                dayOfWeek: "monday",
                times:[
                  { startTime: '06:00 PM', endTime: '07:00 PM'},{ startTime: '06:00 AM', endTime: '07:00 AM'}
                ]
            },
            {
                dayOfWeek: "tuesday",
                times:[
                  { startTime: '05:00 PM', endTime: '06:00 PM'},{ startTime: '05:00 AM', endTime: '06:00 AM'}
                ]
            }
          ],
          price : 23.5,
          tags : ['Tag1']
        };

function compareObject(reqObject, resObject){
    copy = _.omit(resObject, '__v', 'id');
    isEqual = _.isEqual(reqObject, copy);
    copy = null;
    return isEqual;
}


describe('Test Class API', function(){
  var id;

  it('Create New Class', function(done){
    var request = superagent.post(URI + '/facilities/classes');

    request
    .send(classTesting)
    .end(function(e,res){
        expect(e).to.eql(null);
        expect(res.body._id.length).to.eql(24);
        classTesting._id = res.body._id;
        expect(res.body.schedule.length).to.eql(2);
        done();
    });

  })

  it('update a class', function(done){
    classTesting.className = classTesting.className + '_Update';
    classTesting.classDescription = classTesting.classDescription + '_Update';
    classTesting.instructor = classTesting.instructor + '_Update';
    classTesting.schedule = [
            {
                dayOfWeek: "wednesday",
                times:[
                  { startTime: '06:00 PM', endTime: '07:00 PM'},{ startTime: '06:00 AM', endTime: '07:00 AM'}
                ]
            },
            {
                dayOfWeek: "friday",
                times:[
                  { startTime: '05:00 PM', endTime: '06:00 PM'},{ startTime: '05:00 AM', endTime: '06:00 AM'}
                ]
            }
    ];
    console.log('Going to update class ' + classTesting._id);
    superagent.put(URI + '/facilities/classes/' + classTesting._id)
      .send(classTesting)
      .end(function(e, res){
        expect(e).to.eql(null);
        expect(res.body.schedule.length).to.eql(2);
        done()
      })
  })



  var criteria1 = "?search=Class Name";
  var criteria3 = '?search=Class Name&advanceSearch={"minPrice": "23.5", "maxPrice": "24.5"}';
  var noRecordCriteria = '?search=Class Name&advanceSearch={"minPrice": "24.5", "maxPrice": "24.5"}';
  var timecriteria1 = '?search=wednesday&advanceSearch={"minPrice": "23.5", "maxPrice": "24.5"}';

  it('retrieves a collection', function(done){
    superagent.get(URI + '/classes' + criteria1)
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })


  it('Search class criteria3', function(done){
    superagent.get(URI + '/classes' + criteria3)
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })

  it('Search class timecriteria1', function(done){
    superagent.get(URI + '/classes' + timecriteria1)
              .end(function(e, res){
                console.log('%j',res.body);
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })

  
  it('Search class noRecordCriteria', function(done){
    superagent.get(URI + '/classes' + noRecordCriteria)
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.eql(0)
                done()
    });
  })

  it('removes a class', function(done){
    console.log('Going to delete class ' + classTesting._id);
    superagent.del(URI + '/facilities/classes/' + classTesting._id)
      .end(function(e, res){
        expect(e).to.eql(null)
        console.log(res.body);
        expect(typeof res.body).to.eql('object')
        expect(res.body.status).to.eql('success')    
        done()
      })
  })
});


