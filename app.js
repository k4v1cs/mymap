
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , landRoutes = require('./routes/lands')
  , ruinRoutes = require('./routes/ruins')
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash')
  , expressValidator = require('express-validator')
  , jadeHelper = require('./jadeHelper')
  , auth = require('./auth/auth')
  , log = require('./config/log4js').getLogger();
  
var everyauth = auth.initialize();
  
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
app.use(jadeHelper.makeUrlWithQuery);
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

app.get('/', auth.checkAuth, routes.index);
app.get('/error', routes.error);

app.get('/lands/add', auth.checkAuth, auth.checkAdmin, landRoutes.add);
app.post('/lands/add', auth.checkAuth, auth.checkAdmin, landRoutes.saveLand);

app.post('/ruins/add', auth.checkAuth, auth.checkAdmin, ruinRoutes.add);
app.post('/ruins/remove', auth.checkAuth, auth.checkAdmin, ruinRoutes.remove);

app.get('/lands', auth.checkAuth, landRoutes.lands);
app.get('/ruins', auth.checkAuth, ruinRoutes.ruins);

app.get('/lands/:x/:y', auth.checkAuth, landRoutes.showLand);
app.get('/ruins/:x/:y', auth.checkAuth, ruinRoutes.showRuins);

var port = app.get('port');
http.createServer(app).listen(port, function(){
  log.info('Express server listening on port ' + port);
});
