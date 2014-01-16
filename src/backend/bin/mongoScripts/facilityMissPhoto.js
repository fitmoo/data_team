var index = 0;
var totalCrawl = 0;
var totalNotCrawl = 0;

db.facilities.find().forEach(
	function(facility){
		var photo = db.photos.findOne({facilityID : facility._id});
		index = index + 1;		
		facility.isCrawl = !photo;

		if(facility.isCrawl){
			totalCrawl = totalCrawl + 1;
		} else{
			totalNotCrawl = totalNotCrawl + 1;
		}
		print('index:' + index + ' crawlStatus: ' + facility.isCrawl)		
		db.facilities.save(facility);
	}
)

print('totalCrawl');
print(totalCrawl);
print('totalNotCrawl');
print(totalNotCrawl);