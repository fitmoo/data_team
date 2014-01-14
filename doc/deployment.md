This document guide how to deploy the latest source code, database to production environment

## Production server information

```
Amazon EC2
	IP Address: 23.23.190.88
	Database: MongoDB
	Database Name: ScrapingData
	
```

## Deployment step by step

### 1. Clone code from Github for the first time


```
mkdir -p ~/fitmooSourceCode
cd ~/fitmooSourceCode
git clone git@github.com:fitmoo/data_team.git
```


### 2. Install production environment for the first time

From the pulled source code, execute the following command to install production environment

```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/deployment_installenv.sh
```

### 3. Setup initial data
```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/deployment_initialdata.sh
```

### 4. Build and deployment

The following commands pull source code from Github then deploy the system

```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/deployment.sh
```

### 5. Start the webserver
```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/start_webserver
```

### 6. Stop the webserver

```
$ cd ~/fitmooSourceCode/data_team/src/backend/
$ ./bin/stop_webserver
```
