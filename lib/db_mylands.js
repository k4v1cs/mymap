var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports.mongoose = mongoose;
module.exports.Schema = Schema;
// Connect to cloud database

var username = "daii"
var password = "mosimosi";
var address = '@ds057528.mongolab.com:57528/mylands';
//'@localhost:27017/mylands';
//'@ds057528.mongolab.com:57528/mylands';
connect();
// Connect to mongo
function connect() {
  var url = 'mongodb://' + username + ':' + password + address;
  console.log("mongo url:", url);
  mongoose.connect(url);
  console.log("Connected to mongo");
}
function disconnect() {mongoose.disconnect()}