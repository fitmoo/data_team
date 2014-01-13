var index = 0;
db.photos.find({debugData : {$exists : false}}).forEach(
  function(photo) {
  	index++;
  	var facility_photo = db.facilities_crawlPhoto.findOne({_id : photo.facilityID});
  	if(facility_photo){
  		//Update photo.facilityID by _id in db.facilities collection
  		var facility = db.facilities.findOne({websiteURL : facility_photo.websiteURL});
  		if(facility){
  			photo.websiteURL = facility.websiteURL;
  			photo.facilityID = facility._id;
  			db.photos.save(photo);
  			print('Updated: Index = ' + index + ' _id:' + photo._id);
  		}
  	}
  }
)
print('Finish');