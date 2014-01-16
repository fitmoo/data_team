This document guide how to deploy the latest source code, database to production environment

## Production server information

```
Amazon EC2
	IP Address: 23.23.190.88
	Database: MongoDB
	Database Name: ScrapingData
	
```

## Deployment step by step

### 1. Configure Github Deploy key on production server

Developer already have the private/public deploy key (id_rsa, id_rsa.pub)


```
Copy id_rsa and id_rsa.pub to ~/.ssh/ folder on production server.
```

### 2. Clone code from Github for the first time

```
sudo apt-get install git-core
mkdir -p ~/fitmooSourceCode
cd ~/fitmooSourceCode
git clone git@github.com:fitmoo/data_team.git
```


### 3. Install production environment for the first time

From the pulled source code, execute the following command to install production environment

```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/deployment_installenv.sh
```

### 4. Setup initial data
```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/deployment_initialdata.sh
```

### 5. Build and deployment

The following commands pull source code from Github then deploy the system

```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/deployment.sh
```

### 6. Start the webserver
```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/start_productionserver
```

### 7. Stop the webserver

```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/stop_server
```
