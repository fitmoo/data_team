#Deploy Database
SOURCE="127.0.0.1:27017"
echo "--------------------------------------------------------------------------------"
echo "Back up DB from source: facilities, classes, events, countries, states, users"
echo "--------------------------------------------------------------------------------"
mongodump --host $SOURCE --db ScrapingData --collection facilities
mongodump --host $SOURCE --db ScrapingData --collection classes
mongodump --host $SOURCE --db ScrapingData --collection events
mongodump --host $SOURCE --db ScrapingData --collection countries
mongodump --host $SOURCE --db ScrapingData --collection states
mongodump --host $SOURCE --db ScrapingData --collection users

ZIPFILE="database.zip"
echo "--------------------------------------------------------------------------------"
echo "Compress exported database folder to "
echo "--------------------------------------------------------------------------------"
zip -r $ZIPFILE dump

PRODUCTIONSERVER="54.227.229.224"
echo "--------------------------------------------------------------------------------"
echo "Copy data from $SOURCE to $PRODUCTIONSERVER"
echo "--------------------------------------------------------------------------------"
scp -i conf/ec2-vanda-production.pem $ZIPFILE ubuntu@$PRODUCTIONSERVER:~/


