﻿
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , landRoutes = require('./routes/lands')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , async = require('async')
  , everyauth = require('everyauth')
  , flash = require('connect-flash')
  , Land = require('./models/Land.js')
  , Ruin = require('./models/Ruin.js')
  , User = require('./models/User.js')
  , imgUtil = require('./utils/imageUtil.js')
  , storage = require('./utils/storage/storage.js');

/*everyauth*/

everyauth.everymodule.findUserById( function (userId, callback) {
  User.findById(userId, callback);
});

everyauth.everymodule.logoutPath('/logout');
everyauth.everymodule.logoutRedirectPath('/login');

everyauth.password
  .getLoginPath('/login')
  .postLoginPath('/login')
  .loginView('login')
  .loginLocals(function (req, res) {
    return {
         title: 'MyMap - Bejelentkezés',
         message: req.flash('message')}
   })
  .authenticate( function (login, password) {
    console.log("authenticating %s", login);
    var promise
      , errors = [];
      
    if (!login) errors.push('Add meg a felhasználóneved!');
    if (!password) errors.push('Add meg a jelszavad!');
    if (errors.length) return errors;

    promise = this.Promise();

    // findUser passes an error or user to a callback after finding the
    // user by login
    User.findByUsername( login, function (err, user) {
      var errorMessage = login + ' nevű felhasználó nem létezik, vagy hibás a jelszó';
      if (err) {
        errors.push(err.message || err);
        return promise.fulfill(errors);
      }
      if (!user) {
        errors.push(errorMessage);
        return promise.fulfill(errors);
      }
      
      User.validateUser(user, password, function (err, didSucceed) {
        if (err) {
          return promise.fail(err);
          errors.push(errorMessage);
          return promise.fulfill(errors);
        }
        if (didSucceed) return promise.fulfill(user);
        errors.push(errorMessage);
        return promise.fulfill(errors);
      });
    });

    return promise;
  })
  .loginSuccessRedirect('/')
  .getRegisterPath('/register')
  .postRegisterPath('/register')
  .registerView('')
  .validateRegistration( function (newUserAttributes) {
  })
  .registerUser( function (newUserAttributes) {
  })
  .registerSuccessRedirect('/login');
  
var app = express();

// all environments

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser('mr ripley'));
app.use(express.session());
app.use(flash());
app.use(everyauth.middleware(app));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
} 
 
function checkAuth(req, res, next) {
  if (!req.user) {
    req.flash('message', 'Jelentkezz be!');
    res.redirect('/login');
  } else {
    next();
  }
}

function checkAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    req.flash('message', 'Ez az oldal csak adminisztrátorok számára elérhető');
    res.redirect('/login');
  } else {
    next();
  }
}

function localQuery(req, res, next) {
  res.locals.query = req.query;
  next();
};

function fillImageUrls(kingdomMap, callback) {
    var calls = [];
    kingdomMap.forEach(function(value, key) {
        calls.push(function(callbackPush) {
            console.log("pushing element %s", value.picture);
            storage.getImageUrl(value.picture, function(url) {
                value.pictureUrl = url;
                callbackPush(null, url);
            });
        });
    });
    
    async.parallel(calls, function(err, result) {
        /* this code will run after all calls finished the job or
           when any of the calls passes an error */
        if (err)
            callback(err);
        else
            callback();
    });
}

app.get('/', checkAuth, routes.index);
app.get('/error', routes.error);

app.get('/lands/list', checkAuth, checkAdmin, function(req, res) {
    var lands;
    Land.findLands(function(err, land) {
        if(!err) {
            var landPics = [];
            for (var i = 0; i < land.length; i++) {
                var l = land[i];
                landPics.push({
                    img: l.picture,
                    type: l.type
                });
                
            }
            res.render('list_land', { 
                    title: "MyMap - foobar",
                    lands: landPics
            });
        }
    });
    
});
app.get('/lands/add', checkAuth, checkAdmin, landRoutes.add);
app.post('/lands/add', checkAuth, checkAdmin, function(req, res) {

    var coordinate = req.body.x + "-" + req.body.y + "-" + req.body.z;
    var imageName = coordinate + ".jpg";
    console.log("Saving new land: " + coordinate);
    
    var newLand = {
        x: req.body.x,
        y: req.body.y,
        z: req.body.z,
        fields: req.body.fields,
        cityLevel: req.body.cityLevel,
        type: req.body.type,
        obstacles: req.body.obstacles,
        grain: {
            inner: 0,
            outer: req.body['grain.outer']
        },
        iron: {
            inner: 0,
            outer: req.body['iron.outer']
        },
        stone: {
            inner: req.body['stone.inner'],
            outer: req.body['stone.outer']
        },
        picture: imageName
    };
    
    Land.addLand(newLand, function(err, land) {
        if (err) {
            console.log("Error: ", err);
            res.redirect('/error');
        } else {
            var image = new Buffer(req.body.picture.substr(req.body.picture.indexOf('base64') + 7), 'base64');
            imgUtil.saveImage(image, coordinate);
            req.flash("message", "'" + coordinate + "' terület sikeresen elmentve!");
            res.redirect('/lands/add');
        }
    });
});

app.post('/ruins/add', checkAuth, checkAdmin, function(req, res) {

    var coordinate = req.body.x + "-" + req.body.y + "-" + req.body.z;
    console.log("Saving new ruin: " + coordinate);
    
    var newRuin = {
        x: req.body.x,
        y: req.body.y,
        z: req.body.z,
        level: req.body.level,
        agressive: req.body.agressive ? true : false
    };
    
    Ruin.addRuin(newRuin, function(err, ruin) {
        if (err) {
            console.log("Error: ", err);
            var errorMessage = "'" + coordinate + "' romot nem sikerült elmenteni!";
            res.send(errorMessage, 500);
        } else {
            res.send(ruin);
        }
    });
});

app.post('/ruins/remove', checkAuth, checkAdmin, function(req, res) {
    var coordinate = req.body.x + "-" + req.body.y + "-" + req.body.z;
    console.log("Removing ruin: " + coordinate);
    
    Ruin.removeRuin(req.body.x, req.body.y, req.body.z, function(err) {
        if(err) {
            console.log("Error: ", err);
            var errorMessage = "'" + coordinate + "' romot nem sikerült eltávolítani!";
            res.send(errorMessage, 500);
        } else {
            res.send(200);
        }
    });
});

app.get('/lands', checkAuth, localQuery, function(req, res) {
        var level = req.query.level ? parseInt(req.query.level) : null;
        Land.findKingdomCounts(level, function(err, result) {
            if(err) {
                console.log("Error: ", err);
                res.redirect('/error');
            } else {
                res.render("map", {title: "MyMap - Királyságok", kingdomCounts: result, mapType: 'lands'});
            }
        })
    }
);

app.get('/ruins', checkAuth, localQuery, function(req, res) {
        var level = req.query.level ? parseInt(req.query.level) : null;
        Ruin.findKingdomCounts(level, function(err, result) {
            if(err) {
                console.log("Error: ", err);
                res.redirect('/error');
            } else {
                res.render("map", {title: "MyMap - Királyságok", kingdomCounts: result, mapType: 'ruins'});
            }
        })
    }
);

app.get('/lands/:x/:y', checkAuth, function(req, res) {
    var x = req.params.x;
    var y = req.params.y;
    
    Land.findKingdom(x, y, function(err, kingdomMap) {
        if(err) {
            console.log("Error: ", err);
            res.redirect('/error');
        } else {
            fillImageUrls(kingdomMap, function(err) {
                if(err) {
                    console.log("Error generatimg image urls: " + err);
                    res.redirect('/error');
                }
                else
                    res.render("lands", {
                        title: "MyMap - " + x + "-" + y + " királyság területei",
                        x: x,
                        y: y,
                        lands: kingdomMap
                    });
            
            });
        }
    });
});

app.get('/ruins/:x/:y', checkAuth, function(req, res) {
    var x = req.params.x;
    var y = req.params.y;
    
    Ruin.findKingdom(x, y, function(err, kingdomMap) {
        if(err) {
            console.log("Error: ", err);
            res.redirect('/error');
        } else {
            res.render("ruins", {
                title: "MyMap - " + x + "-" + y + " királyság romjai",
                x: x,
                y: y,
                ruins: kingdomMap
            });
        }
    });
});

http.createServer(app).listen(5000, function(){
  console.log('Express server listening on port ' + 5000);
});