var fs = require('fs'),
    fileStore = require('./fileStorage.js'),
    dropboxStore = require('./dropboxStorage.js');

module.exports.uploadImage = uploadImage;
module.exports.getImageUrl = getImageUrl;

function uploadImage(imgPath, callback) {
    if(process.env.storage === 'FILE') {
        fileStore.moveImage(imgPath, function(err) {
            if (err) throw err;
            callback();
        });
    } else if(process.env.storage === 'DROPBOX'){
        dropboxStore.uploadImage(imgPath, function(err) {
            if (err) throw err;
            fs.unlinkSync(imgPath);
            callback();
        });
    } else {
        callback(new Error('Unsupported storage format: ' + process.env.storage));
    }
    
};
    
function getImageUrl(name, callback) {
    if(process.env.storage === 'FILE') {
        callback(fileStore.getUrl(name));
    } else if(process.env.storage === 'DROPBOX'){
            dropboxStore.getUrl(name, function(err, url) {
                if(err) throw err;
                callback(url);
            });
    }
}