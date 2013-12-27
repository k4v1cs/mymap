var db = require('../lib/db_mylands')
    crypto = require('crypto');

var UserSchema = new db.Schema({
        username : {type: String, unique: true}
      , salt : String
      , hash : String
      , role : String
})

var MyUser = db.mongoose.model('User', UserSchema);

// Exports
module.exports.addUser = addUser;
module.exports.validateUser = validateUser;
module.exports.findByUsername = findByUsername;
module.exports.findById = findById;

// Add user to database
function addUser(username, password, callback) {
  var instance = new MyUser();
  instance.username = username;
  instance.password = password;
  instance.save(function (err) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, instance);
    }
  });
}

function findByUsername(username, callback) {
    MyUser.findOne({username: username}, function(err, user) {
        if(err) {
            callback(err);
        } else {
            callback(null, user);
        }
    });
}

function findById(userId, callback) {
    MyUser.findById(userId, '-hash -salt', function(err, user) {
        if(err) {
            callback(err);
        } else {
            callback(null, user);
        }
    });
}

function validateUser(user, password, callback) {
    crypto.pbkdf2(password, user.salt, 10000, 512, function(err, derivedKey) {
        if(err) {
            callback(err, false);
        } else {
            var didSucceed = derivedKey.toString('base64') === user.hash;
            callback(null, didSucceed);
        }
    });
}

UserSchema.pre('save', function(next) {
  var user = this;

  var salt = crypto.randomBytes(128).toString('base64');
  crypto.pbkdf2(user.password, salt, 10000, 512, function(err, derivedKey) {
    user.hash = derivedKey.toString('base64');
    user.salt = salt;
    next();
  });
});