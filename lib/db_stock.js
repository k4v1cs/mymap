var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports.mongoose = mongoose;
module.exports.Schema = Schema;
// Connect to cloud database

var username = "mongoman"
var password = "mosimosi";
var address = '@ds039088.mongolab.com:39088/stock';
connect();
// Connect to mongo
function connect() {
  var url = 'mongodb://' + username + ':' + password + address;
  console.log("mongo url:", url);
  mongoose.connect(url);
  console.log("Connected to mongo");
}
function disconnect() {mongoose.disconnect()}