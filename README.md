# Fitmoo Data

## Getting Started

1. [Install VirtualBox](https://www.virtualbox.org/wiki/Downloads) version 4.3.3

2. [Install Vagrant](http://www.vagrantup.com/downloads.html) Latest (tested with 1.3.5)

3. Clone the project and execute commands below

	```
	cd vagrant
	vagrant up
	```

4. SSH to the vagrant machine

	```
	vagrant ssh
	```


## Restore MongoDB data for the first time


	bash /backend/bin/deployment_restoredatabase.sh


## Run Front-end & Backend admin-tool on local

1. Start

	```
	bash /vagrant/start-local.sh
	```
2. Stop and kill processes run on background

	***Make sure this script is executed before the vagrant machine halt.***
	
	```
	bash /vagrant/stop-local.sh
	```
3. Access admin-tool  [admin-tool]( http://127.0.0.1:9000/)

4. Access mongoDB
	
	Make sure the mongo service has been started
	
	```
	mongo
	use ScrapingData
	
	```
	
## Run the `design` application (HTML mockup)

	cd /design
	docpad run
	
[Open http://localhost:8003/](http://localhost:8003/)


## Backup and restore production database

### 1. Backup

```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/deployment_bkdatabase.sh
```
The scripts backup and save database as zip file at: ~/fitmooSourceCode/data_team/src/backend/bin/database.zip

### 2. Restore
Before running restore script, please make sure the database.zip and deployment_initialdata.sh are in the same folder

```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ $ ./bin/deployment_initialdata.sh
```