var log4js = require('log4js'),
    fs = require('fs');

configure();

exports.getLogger = function() {
    return log4js.getLogger('mymap');
}

function configure() {
    if(!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
    }
        
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
}