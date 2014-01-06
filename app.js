
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , landRoutes = require('./routes/lands')
  , ruinRoutes = require('./routes/ruins')
  , http = require('http')
  , path = require('path')
  , everyauth = require('everyauth')
  , flash = require('connect-flash')
  , expressValidator = require('express-validator')
  , User = require('./models/User')
  , jadeHelper = require('./utils/jadeHelper');

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
app.use(expressValidator());
app.use(jadeHelper.isEmptyMiddleware);
app.use(jadeHelper.setQueryMiddleware);
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

app.get('/', checkAuth, routes.index);
app.get('/error', routes.error);

app.get('/lands/add', checkAuth, checkAdmin, landRoutes.add);
app.post('/lands/add', checkAuth, checkAdmin, landRoutes.saveLand);

app.post('/ruins/add', checkAuth, checkAdmin, ruinRoutes.add);
app.post('/ruins/remove', checkAuth, checkAdmin, ruinRoutes.remove);

app.get('/lands', checkAuth, landRoutes.lands);
app.get('/ruins', checkAuth, ruinRoutes.ruins);

app.get('/lands/:x/:y', checkAuth, landRoutes.showLand);
app.get('/ruins/:x/:y', checkAuth, ruinRoutes.showRuins);

var port = app.get('port');
http.createServer(app).listen(port, function(){
  console.log('Express server listening on port ' + port);
});
