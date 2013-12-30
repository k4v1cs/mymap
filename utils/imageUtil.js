var fs = require('fs'),
    path = require('path'),
    easyimg = require('easyimage'),
    storage = require('./storage/storage.js');

var DEST_DIR = path.join(__dirname, 'temp'),
    EXT = ".png",
    DEST_EXT = ".jpg";

module.exports.saveImage = function saveImage(buffer, filename) {
    
    makeTempDir();
    
    var srcPath = path.join(DEST_DIR, filename + EXT);
    fs.writeFileSync(srcPath, buffer);
    
    var srcRealPath = fs.realpathSync(srcPath);
    var destRealPath = srcRealPath.replace(EXT, DEST_EXT);
    console.log('image written: ' + srcPath);
    
    easyimg.convert({src: srcRealPath, dst: destRealPath}, function(err, image) {
         if (err) throw err;
         
         console.log('Converted image: %s', srcRealPath);
         
         fs.unlink(srcRealPath, function (err) {
            if (err) throw err;
            console.log('Successfully deleted: %s', srcRealPath);
        });
        
        storage.uploadImage(destRealPath, function(err) {
                if(err) throw err;
        });
    });
    
    return filename + DEST_EXT;
}

function makeTempDir() {
    if(!fs.existsSync(DEST_DIR)) {
        fs.mkdirSync(DEST_DIR);
    }
}