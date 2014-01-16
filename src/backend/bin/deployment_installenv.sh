#!/bin/bash

# FILEPATH=${BASH_SOURCE}
# DIR=${FILEPATH%/*}
# DIR=${DIR%/*}
DIR=$PWD

#Install environment for production server
cd $HOME

#Move to the Home folder

#Install Node
# echo "Install Node"

# sudo apt-get update
# sudo apt-get install build-essential openssl libssl-dev zip unzip
# git clone git://github.com/joyent/node.git
# cd node
# git checkout v0.10.24
# ./configure
# make
# sudo make install

# cd $HOME 
# #Install NPM
# echo "Install NPM"
# git clone https://github.com/isaacs/npm.git
# cd npm
# sudo make install

# #Install packages
# npm update -g
# sudo npm install -g grunt-cli
# sudo npm install -g bower

# cd $HOME 
# #Install Express
# echo "Install Express"
# sudo npm install express -g


# #Install forever
# echo "Install forever"
# sudo npm install forever -g
# sudo npm instal mocha -g

# #Install PhantomJS
# cd /usr/local/share
# sudo wget https://phantomjs.googlecode.com/files/phantomjs-1.9.2-linux-x86_64.tar.bz2
# sudo tar xjf phantomjs-1.9.2-linux-x86_64.tar.bz2
# sudo ln -s /usr/local/share/phantomjs-1.9.2-linux-x86_64/bin/phantomjs /usr/local/share/phantomjs
# sudo ln -s /usr/local/share/phantomjs-1.9.2-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs
# sudo ln -s /usr/local/share/phantomjs-1.9.2-linux-x86_64/bin/phantomjs /usr/bin/phantomjs

# #Install MongoDB
# cd $HOME
# echo "Install MongoDB"
# sudo mkdir -p /data/db
# sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
# echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
# sudo chmod 0755 /data/db
# sudo chown ubuntu:ubuntu /data/db
# sudo apt-get update
# sudo apt-get install mongodb-10gen


# #Install NGINX
# cd $HOME 
# echo 'Install NGINX'
# sudo apt-get install nginx -y
# sudo cp $DIR/bin/init_scripts/nginx_vhost_http /etc/nginx/sites-available/fitmoo.com
# sudo rm /etc/nginx/sites-enabled/default
# sudo ln -s /etc/nginx/sites-available/fitmoo.com /etc/nginx/sites-enabled/default
# mkdir -p web/vanda.com/logs
# sudo service nginx start


#Install RUBY
echo "--------------------------------------------------------------------------------"
echo '### Install Ruby Version Manager ...'
echo "--------------------------------------------------------------------------------"
curl -sSL https://get.rvm.io | bash -s stable
source $HOME/.rvm/scripts/rvm
echo "source $HOME/.rvm/scripts/rvm" >> ~/.bash_profile
RUBY_VERSION=2.0.0-p247
rvm install $RUBY_VERSION
rvm use $RUBY_VERSION --default
gem install sass
gem install compass

