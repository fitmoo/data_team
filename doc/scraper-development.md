Crossfit scraping
==

## System Architecture


## General Requirements
 - [node.js](http://nodejs.org)
	Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.
	
 - [MongoDB](http://mongodb.org)
 	MongoDB (from "humongous") is an open-source document database, and the leading NoSQL database. Written in C++.
	
	[Mac OS] Brew
        1. $ brew update
        2. $ brew install mongodb
	[Ubuntu]
        Step 1 -- Create the Install Script
        The MongoDB install process is simple enough to be completed with a Bash script. Copy the following into a new file named `mongo_install.bash` in your home directory: 

        ```
        apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
        echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" | tee -a /etc/apt/sources.list.d/10gen.list
        apt-get -y update
        apt-get -y install mongodb-10gen
        ```

        Here's an explanation of each line in the script: 
        The `apt-key` call registers the public key of the custom 10gen MongoDB aptitude repository
        A custom 10gen repository list file is created containing the location of the MongoDB binaries
        Aptitude is updated so that new packages can be registered locally on the Droplet
        Aptitude is told to install MongoDB

        TIP: At any time, to change to your home directory, simply execute `cd` 
        Step 2 -- Run the Install Script
        Execute the following from your home directory: 
            ```
            $ sudo bash ./mongo_install.bash
            ```

        If everything is successful, you should see the output contain a PID of the newly started MongoDB process: 
        mongodb start/running, process 2368

        Step 3 -- Check It Out
        By default with this install method, MongoDB should start automatically when your Droplet is booted. This means that if you need to reboot your Droplet, MongoDB will start right back up. 
        To start learning about the running `mongod` process, run the following command: 
            
            ```
            $ ps aux | grep mongo
            ```

        One line of the output should look like the following: 
        mongodb    569  0.4  6.4 627676 15936 ?        Ssl  22:54   0:02 /usr/bin/mongod --config /etc/mongodb.conf

        ```
        We can see the... 
        User: `mongodb`
        PID: `569`
        Command: `/usr/bin/mongod --config /etc/mongodb.conf`
        Config File: `/etc/mongodb.conf`
        ```

        More detail refer at https://www.digitalocean.com/community/articles/how-to-install-mongodb-on-ubuntu-12-04
        
## Commands

### Production Deployment
#### 1. Install Environment
Install enviroment for webserver, scraper, libs etc. Make sure you execute the script below on the clean server. This command will install nodejs, mongodb, npm, expressJS, forever, nginx

```
$ bin/deployment_installEnv.sh
```
### 2.Install Database
Restore DB from zipfile to mongoDB

```
$ bin/deployment_RestoreDatabase.sh
```

### MongoDB
Make sure your machine install mongo
Only do that if mongoDB & redis service are not start yet

```
$ bin/dev_start_services
```

### Scraper
#### Crossfit facilities

```
$ bin/command --scraper crossfit
```

### Crawl media(photo/videos) for all facilities website

```
$ bin/command --scraper facilityWebsite
```

#### Events on active.com

```
1. Normal case
	$ bin/command --scraper active --mode reset
2. Incase the scraping process hang up, crash then we should start the process mannually
	$ bin/command --scraper active --mode continue
```
### Web server

```
1. Start webserver
	$ bin/start_webserver
2. Stop webserver
	$ bin/stop_webserver
```

### Photo de-select tool

Upload qualified image to S3

```
$ ./bin/command --uploadtos3
```

