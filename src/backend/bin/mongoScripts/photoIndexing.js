var count = 1;
db.photos.find({debugData:true}, {}, {createdDate : 1}).forEach(
	function(photo){
		photo.index = count;
		count ++;
		print(photo._id + ':' + photo.index);
		db.photos.save(photo);
	}
)