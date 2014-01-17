#Stop script if got exception
set -o errexit

read -p "This script backup the following collection: facilities, classes, events, countries, states, users, photoviewlogs then replace the new collections. Y[Yes] or N[No]?   "  -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    
    FILEPATH=${BASH_SOURCE}
	DIR=${FILEPATH%/*}
	DBNAME="ScrapingData"
	_NOW=$(date +"%m_%d_%Y")
	BACKUPFOLDER="$DIR/databackup/dump"$_NOW
    
    #Restore Database
	SOURCE="127.0.0.1:27017"
	DATABASEFILE="$DIR/database.zip"

	echo "Delete dump folder"
	rm -rf $DIR/dump/*
	mkdir -p $DIR/dump/$DBNAME

	echo "Unzip database file"
	unzip $DATABASEFILE -d $DIR/dump/$DBNAME
	echo $DIR

	echo "--------------------------------------------------------------------------------"
	echo "Backup data on production server before restore"
	echo "--------------------------------------------------------------------------------"
	
	

	echo "--------------------------------------------------------------------------------"
	echo "Backup data on production server before restore. Folder Path: $BACKUPFOLDER"
	echo "--------------------------------------------------------------------------------"

	mongodump --host $SOURCE --db $DBNAME --collection facilities --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection classes --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection events --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection countries --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection states --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection users --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection photoviewlogs --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection photos --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection photos3s --out $BACKUPFOLDER

	echo "Delete the following collections: facilities, classes, events, countries, states, photos"	
	mongo $DBNAME $DIR/mongoScripts/deleteCollection.js

	echo "Restore collection facilities, classes, events, countries, states"
	mongorestore $DIR/dump

	rm -rf $DIR/dump/*
else
	exit
fi



