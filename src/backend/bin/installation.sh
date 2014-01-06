
echo "Install system lib"
sudo apt-get install unzip

echo "Install git"
sudo apt-get install build-essential openssl libssl-
sudo apt-get install git
git clone git://github.com/joyent/node.git
cd node
./configure
make
sudo make install


git clone https://github.com/isaacs/npm.git
cd npm     
sudo make install


#Install mongodb
sudo mkdir -p /data/db


#install nginx
sudo apt-get install nginx -y
sudo cp nginx_vhost /etc/nginx/sites-available/fitmoo.com
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/fitmoo.com /etc/nginx/sites-enabled/default
sudo service nginx start