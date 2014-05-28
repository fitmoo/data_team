#/bin/bash

echo "--------------------------------------------------------------------------------"
echo "SSH to Fitmoo Production server"
echo "--------------------------------------------------------------------------------"
echo "Important:"
echo "  This is an Amazon EC2 server. You need a .pem file to access it."
echo "  The ec2-dev.pem file must be placed in the bin/conf directory."
echo "  This server runs:"
echo "    - nginx for the tool-admin backbonejs frontend"
echo "--------------------------------------------------------------------------------"

HOST=54.243.35.56
PEM_FILE=bin/conf/ec2-vanda-production.pem
if [ -f $PEM_FILE ];
then
   ssh -i $PEM_FILE ubuntu@$HOST

else
   echo "Please contact EC2 admin for the pem file: $PEM_FILE"
   echo "You currently don't have permission to access the server"
fi


