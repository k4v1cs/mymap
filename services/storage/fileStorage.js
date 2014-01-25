var fs = require('fs'),
    path = require('path');
    
var DEST_DIR = "./public/images/Dropbox/Apps/map";

module.exports.moveImage = function(imgPath, callback) {
        var srcDir = path.dirname(imgPath);
        
        fs.rename(imgPath, imgPath.replace(srcDir, DEST_DIR), function(err) {
            if(err)
                callback(err);
            else
                callback(null);
        });
    }
    
module.exports.getUrl = function(name) {
        return "/images/Dropbox/Apps/map/" + name;
    }