#Stop script if got exception
set -o errexit

read -p "This script backup the following collection: facilities, classes, events, countries, states, users, photoviewlogs then replace the new collections. Y[Yes] or N[No]?   "  -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # do dangerous stuff
    #Restore Database
	SOURCE="127.0.0.1:27017"
	DATABASEFILE="bin/database.zip"

	echo "Delete dump folder"
	rm -rf dump/*

	echo "Unzip database file"
	unzip $DATABASEFILE

	echo "--------------------------------------------------------------------------------"
	echo "Backup data on production server before restore"
	echo "--------------------------------------------------------------------------------"
	DBNAME="ScrapingData"
	_NOW=$(date +"%m_%d_%Y")
	BACKUPFOLDER="databackup/dump"$_NOW

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

	echo "Delete the following collections: facilities, classes, events, countries, states"	
	mongo $DBNAME bin/mongoScripts/deleteCollection.js

	echo "Restore collection facilities, classes, events, countries, states"
	mongorestore dump

	rm -rf dump/*
else
	exit
fi



