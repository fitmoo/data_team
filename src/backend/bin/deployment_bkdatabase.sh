#!/bin/bash

FILEPATH=${BASH_SOURCE}
DIR=${FILEPATH%/*}

#Photo Indexing
echo "--------------------------------------------------------------------------------"
echo "Index Photos collection"
echo "--------------------------------------------------------------------------------"
mongo ScrapingData $DIR/mongoScripts/photoIndexing.js

#Deploy Database
SOURCE="127.0.0.1:27017"
echo "--------------------------------------------------------------------------------"
echo "Back up DB from source: facilities, classes, events, countries, states, users, photos"
echo "--------------------------------------------------------------------------------"
mongodump --host $SOURCE --db ScrapingData --collection facilities --out $DIR/dump
mongodump --host $SOURCE --db ScrapingData --collection classes --out $DIR/dump
mongodump --host $SOURCE --db ScrapingData --collection events --out $DIR/dump
mongodump --host $SOURCE --db ScrapingData --collection countries --out $DIR/dump
mongodump --host $SOURCE --db ScrapingData --collection states --out $DIR/dump
mongodump --host $SOURCE --db ScrapingData --collection users --out $DIR/dump
mongodump --host $SOURCE --db ScrapingData --collection photos --out $DIR/dump
mongodump --host $SOURCE --db ScrapingData --collection photos3s --out $DIR/dump

ZIPFILE="database.zip"
echo "--------------------------------------------------------------------------------"
echo "Compress exported database folder to $ZIPFILE"
echo "--------------------------------------------------------------------------------"
rm $DIR/$ZIPFILE
zip -j -r $DIR/$ZIPFILE $DIR/dump
rm -rf $DIR/dump/*

 
