var count = 0;
//db.photos.find({debugData : {$exists : false}}).forEach(
  db.photos.find({_id: ObjectId("52c42a39a1357c4963000854")}).forEach( 
  function(photo) {
    count = count + 1;
    var facility_photo = null;

    if(photo.facilityID.toString().indexOf("ObjectId") == 0){
      facility_photo = db.facilities_crawlPhoto.findOne({_id : photo.facilityID});
    } else{
      facility_photo = db.facilities_crawlPhoto.findOne({_id : ObjectId(photo.facilityID)});
    }
    print('Updated: Index = ' + count + ' _id:' + photo._id);
    if(facility_photo && facility_photo.websiteURL){
        //Update photo.facilityID by _id in db.facilities collection
        var facility = db.facilities.findOne({websiteURL : facility_photo.websiteURL});
        print(facility_photo.websiteURL);
        if(facility){

          photo.websiteURL = facility.websiteURL;
          photo.facilityID = facility._id;
          db.photos.save(photo);
        }
    }
  }
)
print('Finish');