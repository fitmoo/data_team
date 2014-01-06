#!/bin/bash

echo "--------------------------------------------------------------------------------"
echo "Start run fitmoo admin-tool local"
echo "--------------------------------------------------------------------------------"

mongod --repair
mongod &
echo "Run Backend"
cd /backend
node server/app.js &


echo "Run Front-end"
cd /frontend
grunt server &