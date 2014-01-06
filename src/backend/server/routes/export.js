var spawn = require('child_process').spawn,
	fstream = require('fstream'),
    tar = require('tar'),
    zlib = require('zlib'),
	path = require('path');

var errorObject = require('./errorResponse'),
	guid = require('../../utils/guid.js'),
	configs = require('../../utils/configs');


module.exports = {
	exportData: function(req, res){
		var temp = configs.get('database:mongodb:connectionString');

		var firstIndex = temp.indexOf('//');
		var lastIndex = temp.lastIndexOf('/');
		var len = temp.length;
		var databaseName = temp.substring(lastIndex + 1, len);
		var hostandPort = temp.substring(firstIndex + 2, lastIndex);

		temp = configs.get('exportData:folder');
		if (!temp || temp == '') temp = 'exports';
		var generatedFoler = guid.generate();
		var exportFolder = path.resolve(__dirname,  '../' ,temp, generatedFoler);
		var compressFile = exportFolder + '.tag.gz';
		var mongoDumpArgs =  ['-d', databaseName, '--collection', 'facilities', '--host', hostandPort, '--out', exportFolder];
		
		mongodump = spawn('mongodump', mongoDumpArgs);
		
		mongodump.stderr.on('data', function (data) {
			res.send(errorObject);
		});

		mongodump.on('exit', function (code) {
			if (code === 0){
				
				var readerStream = fstream.Reader({ 'path': exportFolder, 'type': 'Directory' }) /* Read the source directory */
									.pipe(tar.Pack()) /* Convert the directory to a .tar file */
									.pipe(zlib.Gzip()); /* Compress the .tar file */
				
				readerStream.on('close', function() {
  					var url = '';
  					url = url.concat(req.protocol, "://", req.get('host'), '/files/', generatedFoler, '.tag.gz');
  					res.send({ url : url});
				});

				readerStream.on('error', function(err) {
  					res.send(err);
				});

				readerStream.pipe(fstream.Writer({ 'path': compressFile })); /* Give the output file name */

			} else{
				res.send(errorObject);
			}

		});

	
	},

}