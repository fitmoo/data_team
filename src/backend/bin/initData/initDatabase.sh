#/bin/bash

HOST=127.0.0.1
PORT=27017
DB=ScrapingData
echo "--------------------------------------------------------------------------------"
echo "Init Lookup Database at: $HOST"
echo "--------------------------------------------------------------------------------"


#mongoimport --host $HOST --db $DB --collection countries --type csv --file bin/initData/countries.csv --fields code2,code3,name  --upsertFields code2,code3,name --ignoreBlanks

#mongoimport --host $HOST --db $DB --collection states --type csv --file bin/initData/statesList.csv --fields countryCode,name  --upsertFields countryCode,name --ignoreBlanks

#mongo ScrapingData --eval "db.countries.find().forEach( function(x){ db.facilities.update({country: x.code2}, {$set : { country: x.name} }, {multi: true} )  })"
#mongo ScrapingData --eval "db.countries.find().forEach( function(x){ db.states.update({countryCode: x.code3}, {$set : { countryName: x.name} }, {multi: true} )  })"


#mongo $DB --eval "db.facilities.update({}, { $set : { orderIndex : 0, checkOutBy : "", checkOutDate : null } }, {multi : true})"

#Update Order index for Facilities
##Facilities have no class should be on the top


#Create initial data for photos collection
#db.facilities.find().forEach(function(x){ x.images.forEach( function(url){ db.photos.insert({facilityID: x._id, sourceURL: url.url, s3URL: "", markDelete: false, createdDate: new Date() } ) } ) })

