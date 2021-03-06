var dropbox = require("../../config/dropbox.js"),
    cache = require("../../config/cache.js"),
    path = require('path'),
    fs = require('fs');

module.exports.uploadImage = uploadImage;
module.exports.getUrl = getUrlFromCache;

function uploadImage(imagePath, callback) {
    var data = fs.readFileSync(imagePath);
    var name = path.basename(imagePath);
    
    console.log("trying to write %s to dropbox with name %s", imagePath, name);
    
    dropbox.client.writeFile(name, data, function(error, stat) {
        if (error) {
            console.log(dropbox.showError(error));
            throw error;
        }

        console.log("File saved as revision " + stat.revisionTag);
    });
};

function getUrlFromCache(name, callback) {

    cache.memoryCache.wrap(name, function(cacheCallback) {
        getUrl(name, cacheCallback);
    }, callback);
};

function getUrl(name, callback) {
    dropbox.client.makeUrl(name, {download: true, downloadHack : true}, function(error, url) {
        if(error) {
            console.log(dropbox.showError(error));
            callback(error);
        } else {
            callback(null, url.url);
        }
    });
}
    