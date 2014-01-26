var log4js = require('log4js');

log4js.configure({
  appenders: [
    { 
        'type': 'file',
        'filename': 'logs/mymap.log',
        'category': ['mymap', 'console'],
        'maxLogSize': 5242880,
        'backups': 10
    },
    { 
        type: 'console'
    }
  ],
  replaceConsole: true
});

exports.getLogger = function() {
    return log4js.getLogger('mymap');
}