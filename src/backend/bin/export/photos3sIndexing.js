var count = 1;
db.photos3s.find( { $query: {}, $orderby: { facilityID : 1 } } ).forEach(
    function(photos3){
        photos3.index = count;
        count += 1;
        print(photos3._id + ':' + photos3.index);
        db.photos3s.save(photos3);
    }
)