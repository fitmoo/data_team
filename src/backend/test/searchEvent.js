var superagent = require('superagent'),
    expect = require('expect.js'),
    _ = require('underscore'),
    path = require('path');

var URI = 'http://localhost:3000/api';

describe('Test RESTFUL API', function(){
  var id;

 var eventTesting = {  
      //Event GUID in action.com system.
      assetGuid : 'assetGuid',
      
      eventName : 'My Testing Event Name',
      eventPrice : [{effectiveUntilDate : '2013-12-13T04:13:00.000Z', price : 200}],
      activities : [ {name: 'Running', price: 300, endDate : null, startDate : null} ],
      eventDesctiption : 'eventDesctiption',
      startDateTime : '2013-12-13T04:13:00.000Z',
      endDateTime : '2013-12-15T04:13:00.000Z',
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
      tags : ['Running', 'Walking', 'tag1']
    };
  function compareObject(reqObject, resObject){
      copy = _.omit(resObject, '__v', 'id');
      isEqual = _.isEqual(reqObject, copy);
      copy = null;
      return isEqual;
  }


  // it('Create New Event', function(done){
  //   var request = superagent.post(URI + '/events');

  //   request
  //   .send(eventTesting)
  //   .end(function(e,res){
  //       expect(e).to.eql(null);

  //       expect(res.body._id.length).to.eql(24);
  //       eventTesting._id = res.body._id;

  //       //Compare activities
  //       expect(eventTesting.activities.length).to.eql(res.body.activities.length);
  //       i = 0;
  //       var equal = false;
  //       _.each(eventTesting.activities, function(item){
  //         item._id = res.body.activities[i]._id;
  //         item.id = res.body.activities[i].id;
  //         equal = _.isEqual(item, res.body.activities[i]);
  //         expect(equal).to.eql(true);
  //         i++;
  //       })
        
  //       //Compare event price
  //       expect(eventTesting.eventPrice.length).to.eql(res.body.eventPrice.length);
  //       i = 0;
  //       var equal = false;
  //       _.each(eventTesting.eventPrice, function(item){
  //         item._id = res.body.eventPrice[i]._id;
  //         item.id = res.body.eventPrice[i].id;
  //         equal = _.isEqual(item, res.body.eventPrice[i]);
  //         expect(equal).to.eql(true);
  //         i++;
  //       })

  //       //Compare object
  //       var resObject = _.omit(res.body, ['eventPrice' , 'activities']);
  //       var reqObject = _.omit(eventTesting, ['eventPrice' , 'activities']);
  //       equal = compareObject(reqObject, resObject);
      
  //       done();
  //   });

  // })


  var foundEventName = "?search=RUN UNITED 5k";

  var notFoundEventAndPrice = '?search=RUN UNITED 5k&advanceSearch={"price": "12121.5"}';

  var foundEventPrice = '?search=My Testing Event Name&advanceSearch={"minPrice": "200", "maxPrice": "250"}';

  var noRecordCriteria = '?search=My Testing Event Name&advanceSearch={"price": "250"}';
  var dateRange_norecord = '?search=My Testing Event Name&advanceSearch={"startDate": "12/11/2013","endDate": "13/11/2013"}';
  var dateRange = '?search=My Testing Event Name&advanceSearch={"startDate": "12/11/2013","endDate": "12/14/2013"}';

  var dateRange1 = '?advanceSearch={"startDate": "11/15/2013","endDate": "11/16/2013"}';
  // it('retrieves a collection', function(done){
  //   superagent.get(URI + '/events' + foundEventName)
  //             .end(function(e, res){
  //               expect(e).to.eql(null)
  //               expect(res.body.totalRecords).to.be.above(0)
  //               done()
  //   });
  // })

  // it('Search class notFoundEventAndPrice', function(done){
  //   superagent.get(URI + '/events' + notFoundEventAndPrice)
  //             .end(function(e, res){
  //               expect(e).to.eql(null)
  //               expect(res.body.totalRecords).to.eql(0)
  //               done()
  //   });
  // })

  it('Search class by date', function(done){
    superagent.get(URI + '/events' + dateRange1)
              .end(function(e, res){
                console.log(res.body.totalRecords);
                expect(e).to.eql(null)
                expect(res.body.totalRecords).to.be.above(0)
                done()
    });
   })

  // it('Search class by date range: NOT FOUND', function(done){
  //   superagent.get(URI + '/events' + dateRange_norecord)
  //             .end(function(e, res){
  //               expect(e).to.eql(null)
  //               expect(res.body.totalRecords).to.eql(0)
  //               done()
  //   });
  // })
  
  // it('Search class noRecordCriteria', function(done){
  //   superagent.get(URI + '/events' + noRecordCriteria)
  //             .end(function(e, res){
  //               expect(e).to.eql(null)
  //               expect(res.body.totalRecords).to.eql(0)
  //               done()
  //   });
  // })


});


