var Dropbox = require("dropbox"),
    fs = require("fs");

var client = null,
    tlsOptions = {
        key: fs.readFileSync('./env/cert/ssl.key'),
        cert: fs.readFileSync('./env/cert/ssl.cert') 
    };
initialize();

function initialize() {
    if(isDropboxEnvSet()) {
    
        client = new Dropbox.Client({
            key: process.env.dropbox_key,
            secret: process.env.dropbox_secret,
            token: process.env.dropbox_token,
            sandbox: false
        });
        
        client.authDriver(new Dropbox.AuthDriver.NodeServer({port: 8191}));
        
        client.authenticate(function(error, client) {
            if (error) {
                showError(error);
            } else {
                console.log("Dropbox client authenticated.");
            }
        });
    } else {
        console.log("Dropbox env is not set!");
    }
}

function showError(error) {
  switch (error.status) {
  case Dropbox.ApiError.INVALID_TOKEN:
    // If you're using dropbox.js, the only cause behind this error is that
    // the user token expired.
    // Get the user through the authentication flow again.
    console.log('User token expired');
    break;

  case Dropbox.ApiError.NOT_FOUND:
    // The file or folder you tried to access is not in the user's Dropbox.
    // Handling this error is specific to your application.
    console.log("The file or folder you tried to access is not in the user's Dropbox");
    break;

  case Dropbox.ApiError.OVER_QUOTA:
    // The user is over their Dropbox quota.
    // Tell them their Dropbox is full. Refreshing the page won't help.
    console.log("The user is over their Dropbox quota");
    break;

  case Dropbox.ApiError.RATE_LIMITED:
    // Too many API requests. Tell the user to try again later.
    // Long-term, optimize your code to use fewer API calls.
    console.log("Too many API requests.");
    break;

  case Dropbox.ApiError.NETWORK_ERROR:
    // An error occurred at the XMLHttpRequest layer.
    // Most likely, the user's network connection is down.
    // API calls will not succeed until the user gets back online.
    console.log("An error occurred at the XMLHttpRequest layer.");
    break;

  case Dropbox.ApiError.INVALID_PARAM:
  case Dropbox.ApiError.OAUTH_ERROR:
  case Dropbox.ApiError.INVALID_METHOD:
  default:
    // Caused by a bug in dropbox.js, in your application, or in Dropbox.
    // Tell the user an error occurred, ask them to refresh the page.
    console.log("Unknown Dropbox error.");
  }
};

function isDropboxEnvSet() {
    return process.env.dropbox_key && process.env.dropbox_secret && process.env.dropbox_token;
}

module.exports.client = client;
module.exports.showError = showError;