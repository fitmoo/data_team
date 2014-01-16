#Stop script if got exception
set -o errexit
mongod --repair
mongod &

	#Restore Database
	SOURCE="127.0.0.1:27017"
	DATABASEFILE="/backend/bin/database.zip"

	echo "Unzip database file"
	unzip -o $DATABASEFILE -d /backend/bin

	echo "--------------------------------------------------------------------------------"
	echo "Backup data on production server before restore"
	echo "--------------------------------------------------------------------------------"
	DBNAME="ScrapingData"
	_NOW=$(date +"%m_%d_%Y")
	BACKUPFOLDER="dump"$_NOW

	echo "--------------------------------------------------------------------------------"
	echo "Backup data on production server before restore. Folder Name: $BACKUPFOLDER"
	echo "--------------------------------------------------------------------------------"

	mongodump --host $SOURCE --db $DBNAME --collection facilities --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection classes --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection events --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection countries --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection states --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection users --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection photoviewlogs --out $BACKUPFOLDER
	mongodump --host $SOURCE --db $DBNAME --collection photos --out $BACKUPFOLDER

	echo "Delete the following collections: facilities, classes, events, countries, states"	
	mongo $DBNAME /backend/bin/mongoScripts/deleteCollection.js

	echo "Restore collection facilities, classes, events, countries, states, photos"
	mongorestore /backend/bin/dump


kill -9 `ps aux | grep mongod | grep -v grep | awk '{print $2}'`

