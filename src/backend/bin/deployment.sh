DIR=$PWD
_NOW=$(date +"%m_%d_%Y")
FRONTENDBACKUPFOLDER="frontend_"$_NOW
BACKENDBACKUPFOLDER="backend_"$_NOW

echo "------------------------------------------------"
echo "Pull source code from Github"
echo "------------------------------------------------"
git pull git@github.com:fitmoo/data_team.git

echo "------------------------------------------------"
echo "	Creating webserver directory and backup"
echo "------------------------------------------------"
mkdir -p ~/fitmoo/backup
rm -rf ~/fitmoo/backup/$FRONTENDBACKUPFOLDER
rm -rf ~/fitmoo/backup/$BACKENDBACKUPFOLDER
mv ~/fitmoo/frontend ~/fitmoo/backup/$FRONTENDBACKUPFOLDER
mv ~/fitmoo/backend ~/fitmoo/backup/$BACKENDBACKUPFOLDER
mkdir -p ~/fitmoo/backend

echo "------------------------------------------------"
echo '### Install Front-end Packages & Modules ...'
echo "------------------------------------------------"
cd ../frontend
sudo npm cache clean
sudo npm install
bower install


echo "------------------------------------------------"
echo "	Build frontend"
echo "------------------------------------------------"
cd ../frontend
rm -rf dist
grunt build

echo "------------------------------------------------"
echo "	Move distribution folder to webserver location"
echo "------------------------------------------------"
mv dist ~/fitmoo/frontend

echo "------------------------------------------------"
echo '### Install Back-end Packages & Modules ...'
echo "------------------------------------------------"
cd ../backend
sudo npm install


echo "------------------------------------------------"
echo "	Copy backend folder to webserver location"
echo "------------------------------------------------"
cd ../backend
cp -a * ~/fitmoo/backend


