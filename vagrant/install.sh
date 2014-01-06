#!/bin/bash

NODE_VERSION="0.10.24"
RUBY_VERSION="2.0.0-p247"

echo "--------------------------------------------------------------------------------"
echo "Provision Node.JS Box"
echo "--------------------------------------------------------------------------------"
echo "WhoAmI = $(whoami)"
echo "Home = $(pwd)"
echo I am provisioning...
date > /etc/vagrant_provisioned_at

source /usr/local/rvm/scripts/rvm
rvm use 2.0.0-p247 --default
source /usr/local/nvm/nvm.sh


echo "--------------------------------------------------------------------------------"
echo '### Install Design Packages & Modules ...'
echo "--------------------------------------------------------------------------------"
cd /design
npm cache clean
npm install

echo "--------------------------------------------------------------------------------"
echo '### Install Front-end Packages & Modules ...'
echo "--------------------------------------------------------------------------------"
cd /frontend
npm cache clean
npm install
bower --allow-root install


echo "--------------------------------------------------------------------------------"
echo '### Install Backend Packages ...'
echo "--------------------------------------------------------------------------------"
cd /backend
npm install


echo "--------------------------------------------------------------------------------"
echo '### Add resources need to have ...'
echo "--------------------------------------------------------------------------------"
sudo cp -fr /vagrant/resources/grunt-contrib-imagemin /frontend/node_modules/