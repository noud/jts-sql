const args = require('minimist')(process.argv.slice(2))
const http = require('http');
var Sequelize = require('sequelize');
var SchemaTable = require('jts-sql-js').SchemaTable;
var streamify = require('stream-array'); // only needed to turn array -> stream

var schema = args['schema'];
var data = '';
var dbdialect = args['dbdialect'];
var dbname = args['dbname'];
var tablename = schema.substring(schema.lastIndexOf('/')+1);
var tablename = tablename.substring(0, tablename.indexOf('.json'));

http.get(schema, (resp) => {
  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
	  data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
	  //console.log(data);
	  var dataJson = JSON.parse(data);
	  switch (dbdialect) {
		case 'sqlite':
			var engine = new Sequelize('datastore', 'datastore', '', {
				dialect: dbdialect,
				storage:  './var/'+dbname+'.db'
			});
			break;
		case 'mysql':
			var engine = new Sequelize({
			    dialect: dbdialect,
			    database: dbname,
			    username: 'root',
			    password: 'root'
			  });
			//tableStorage = 'mysql://root:root@mysql:3306/'+dbname;
			break;
	  };

	  var table = SchemaTable(engine, tablename, dataJson);
	  table.create().then(function () {
	  	console.log('CREATE TABLE '+tablename);
	  });
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
