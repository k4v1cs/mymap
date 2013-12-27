var fs = require('fs'),
    easyimg = require('easyimage');

var DEST_DIR = './public/images/',
    EXT = ".png",
    DEST_EXT = ".jpg";

module.exports.saveImage = function saveImage(buffer, filename, destDir) {
    var dir = DEST_DIR;
    if(destDir) {
        dir = destDir;
    }
    
    var srcPath = dir + filename + EXT;
    fs.writeFileSync(srcPath, buffer);
    var realPath = fs.realpathSync(srcPath);
    console.log('image written: ' + srcPath);
    
    easyimg.convert({src: realPath, dst: realPath.replace(EXT, DEST_EXT)}, function(err, image) {
         if (err) throw err;
         
         var convertedImgPath = dir + image.name.replace(DEST_EXT, EXT);
         console.log('Converted image: '+ convertedImgPath);
         fs.unlink(convertedImgPath, function (err) {
            if (err) throw err;
            console.log('successfully deleted' + convertedImgPath);
        });
    });
    
    return filename + DEST_EXT;
}
