mongo 127.0.0.1:27017/ScrapingData fixdatabase.js
mongoexport --host 127.0.0.1:27017 --db ScrapingData --collection facilities --fieldFile facility_export_fields.txt  --query '{status:2}' --csv --out facilities.csv




mongoexport --host 127.0.0.1:27017 --db ScrapingData --collection exportevents --fieldFile event_export_fields.txt --csv --out classes.csv