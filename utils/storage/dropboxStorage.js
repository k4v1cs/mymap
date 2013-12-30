var dropbox = require("../../lib/dropbox.js"),
    path = require('path'),
    fs = require('fs');

module.exports.uploadImage = uploadImage;
module.exports.getUrl = getUrl;

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
        getUrl(name, function(err, url) {console.log("url: %s",url)});
    });
};

function getUrl(name, callback) {
    dropbox.client.makeUrl(name, {download: true, downloadHack : true}, function(error, url) {
        if(error) {
            console.log(dropbox.showError(error));
            callback(error);
        }
        callback(null, url.url);
    });
};
    