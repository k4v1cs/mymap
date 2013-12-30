var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports.mongoose = mongoose;
module.exports.Schema = Schema;
// Connect to cloud database

var username = process.env.dbuser
var password = process.env.dbpwd;
var address = '@ds057528.mongolab.com:57528/mylands';
//'@localhost:27017/mylands';

connect();
// Connect to mongo
function connect() {
  var url = 'mongodb://' + username + ':' + password + address;
  mongoose.connect(url);
  console.log("Connected to mongo");
}
function disconnect() {mongoose.disconnect()}