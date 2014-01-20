var count = 1;
db.photos.find( { $query: {}, $orderby: { createdDate : 1 } } ).forEach(
	function(photo){
		photo.index = count;
		count += 1;
		print(photo._id + ':' + photo.index);
		db.photos.save(photo);
	}
)

