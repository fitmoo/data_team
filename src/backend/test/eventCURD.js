var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api',
    eventTesting = {  
      //Event GUID in action.com system.
      assetGuid : 'assetGuid',
      //Parent Event GUID in action.com system.
      assetParentGuid : 'assetParentGuid',

      eventPrice : [{effectiveUntilDate : '2013-12-13T04:13:00.000Z', price : 200}],
      activities : [ {name: 'Running', price: 300, endDate : null, startDate : null} ],
      eventDesctiption : 'eventDesctiption',
      startDateTime : '2013-12-13T04:13:00.000Z',
      endDateTime : '2013-12-13T04:13:00.000Z',
      timezone  : 'America/Indiana/Indianapolis',
      timezoneDST : 0,
      address1 : 'Address 1',
      address2 : 'Address 2',
      city : 'Indianapolis',
      stateProvinceCode : 'IN',
      country : 'US',
      desctiption : 'desctiption',
      registrationSiteURL : 'http://www.event.com',
      hostEmail : 'tran@gmail.com',
      hostName : 'Tran Hoang',
      hostPhone : '0905093480',
      tags : ['Running', 'Walking', 'tag1', 'tag2']
    },

    eventTestingUpdate = {  
      //Event GUID in action.com system.
      assetGuid : 'assetGuid',
      //Parent Event GUID in action.com system.
      assetParentGuid : 'assetParentGuid',


      eventPrice : [{effectiveUntilDate : '2013-12-13T04:13:00.000Z', price : 200}],
      activities : [ {name: 'Running', price: 400, endDate : null, startDate : null}, {name: 'Running2', price: 500, endDate : null, startDate : null} ],
      eventDesctiption : 'eventDesctiption_Update',
      startDateTime : '2013-12-13T04:13:00.000Z',
      endDateTime : '2013-12-13T04:13:00.000Z',
      timezone  : 'America/Indiana/Indianapolis',
      timezoneDST : 0,
      address1 : 'Address 1_Update',
      address2 : 'Address 2_Update',
      city : 'Indianapolis',
      stateProvinceCode : 'IN_Update',
      country : 'US',
      desctiption : 'desctiption_Update',
      registrationSiteURL : 'http://www.event_Update.com',
      hostEmail : 'tran_Update@gmail.com',
      hostName : 'Tran Hoang_Update',
      hostPhone : '0905093480_Update',
      tags : ['Running', 'Walking', 'tag1', 'tag2', 'tag3']
    };

function compareObject(reqObject, resObject){
    copy = _.omit(resObject, '__v', 'id');
    isEqual = _.isEqual(reqObject, copy);
    copy = null;
    return isEqual;
}


describe('Test RESTFUL API', function(){
  var id;

  it('Create New Event', function(done){
    var request = superagent.post(URI + '/events');

    request
    .send(eventTesting)
    .end(function(e,res){
        expect(e).to.eql(null);
        console.log(res.body);
        expect(res.body._id.length).to.eql(24);
        eventTesting._id = res.body._id;

        //Compare activities
        expect(eventTesting.activities.length).to.eql(res.body.activities.length);
        i = 0;
        var equal = false;
        _.each(eventTesting.activities, function(item){
          item._id = res.body.activities[i]._id;
          item.id = res.body.activities[i].id;
          equal = _.isEqual(item, res.body.activities[i]);
          expect(equal).to.eql(true);
          i++;
        })
        
        //Compare event price
        expect(eventTesting.eventPrice.length).to.eql(res.body.eventPrice.length);
        i = 0;
        var equal = false;
        _.each(eventTesting.eventPrice, function(item){
          item._id = res.body.eventPrice[i]._id;
          item.id = res.body.eventPrice[i].id;
          equal = _.isEqual(item, res.body.eventPrice[i]);
          expect(equal).to.eql(true);
          i++;
        })

        //Compare object
        var resObject = _.omit(res.body, ['eventPrice' , 'activities']);
        var reqObject = _.omit(eventTesting, ['eventPrice' , 'activities']);
        equal = compareObject(reqObject, resObject);
      
        done();
    });

  })


  it('updates an event', function(done){
    eventTestingUpdate._id = eventTesting._id;
    i = 0;

    superagent.put(URI + '/events/' + eventTesting._id)
              .send(eventTestingUpdate)
              .end(function(e, res){
                console.log(res.body);
                expect(e).to.eql(null)
                expect(res.body).not.to.eql(null)
                expect(res.body._id).to.eql(eventTesting._id)

                //Compare activities
                console.log(eventTesting._id);
                expect(eventTestingUpdate.activities.length).to.eql(2);
                
                //Compare event price
                expect(eventTestingUpdate.eventPrice.length).to.eql(res.body.eventPrice.length);
                i = 0;
                _.each(eventTestingUpdate.eventPrice, function(item){
                  item._id = res.body.eventPrice[i]._id;
                  item.id = res.body.eventPrice[i].id;
                  equal = _.isEqual(item, res.body.eventPrice[i]);
                  expect(equal).to.eql(true);
                  i++;
                })

                //Compare object
                var resObject = _.omit(res.body, ['eventPrice' , 'activities']);
                var reqObject = _.omit(eventTestingUpdate, ['eventPrice' , 'activities']);
                equal = compareObject(reqObject, resObject);
                expect(isEqual).to.eql(true)

                done()
              })
  })
/*
  
  it('retrieves a collection', function(done){
    superagent.get(URI + '/events/')
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })

  //Search event by eventName
  it('search event by eventName', function(done){

    superagent.get(URI + '/events?search=City Running Tours-Seattle 5k Beer Running Tour&perPage=120&currentPage=1&sort={"orderBy":"desc","columnName":"city"}')
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                //console.log(res.body.events[0]);
                done()
    });
  })

  //Search event by address
  it('search event by address', function(done){

    superagent.get(URI + '/events?search=929 South High Street&perPage=120&currentPage=2&sort={"orderBy":"desc","columnName":"city"}')
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })

  //Search event by city
  it('search event by city', function(done){

    superagent.get(URI + '/events?search=Indianapolis&perPage=120&currentPage=2&sort={"orderBy":"desc","columnName":"city"}')
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })

  //Search event by stateProvinceCode
  it('search event by stateProvinceCode', function(done){

    superagent.get(URI + '/events?search=PA&perPage=120&currentPage=2&sort={"orderBy":"desc","columnName":"city"}')
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })

  //Search event by country
  it('search event by country', function(done){

    superagent.get(URI + '/events?search=US&perPage=120&currentPage=2&sort={"orderBy":"desc","columnName":"city"}')
              .end(function(e, res){
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })
  
  //Search event by tags
  it('search event by tags', function(done){

    superagent.get(URI + '/events?search=tag1&perPage=120&currentPage=0&sort={"orderBy":"desc","columnName":"city"}')
              .end(function(e, res){
                expect(e).to.eql(null)
                //expect(res.body.totalRecords).to.be.above(0)
                done()
    });
  })

  it('removes an event', function(done){
  superagent.del(URI + '/events/' + eventTesting._id)
    .end(function(e, res){
      expect(e).to.eql(null)
      expect(typeof res.body).to.eql('object')
      expect(res.body.status).to.eql('success')    
      done()
    })
  })*/

});



