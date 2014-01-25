var async = require('async'),
    util = require('util'),
    Land = require('../models/Land'),
    imgUtil = require('../services/imageService'),
    storage = require('../services/storage/storageService'),
    validator = require('./validator/landValidator');

/**
    Render lands map
*/
exports.lands = function(req, res) {
    var level = req.query.level ? parseInt(req.query.level) : null,
        type = req.query.type ? req.query.type : null;
        console.log(req.url);
    Land.findKingdomCounts(level, type, function(err, result) {
        if(err) {
            console.log("Error: ", err);
            res.redirect('/error');
        } else {
            res.render("map", {title: "MyMap - Királyságok", kingdomCounts: result, mapType: 'lands'});
        }
    });
}

/**
    Renders the lands of the specified kingdom
*/
exports.showLand = function(req, res) {
    var x = req.params.x,
        y = req.params.y;
    
    Land.findKingdom(x, y, function(err, kingdomMap) {
        if(err) {
            console.log("Error: ", err);
            res.redirect('/error');
        } else {
            fillImageUrls(kingdomMap, function(err) {
                if(err) {
                    console.log("Error generatimg image urls: " + err);
                    res.redirect('/error');
                }
                else
                    res.render("lands", {
                        title: "MyMap - " + x + "-" + y + " királyság területei",
                        x: x,
                        y: y,
                        lands: kingdomMap
                    });
            
            });
        }
    });
}

/**
	Render add a new land
*/
exports.add = function(req, res){
  res.render(
    'add_land', 
    { 
        title: 'MyMap - Új terület', 
        message: req.flash('message'), 
        errors: {}
    }
  );
};

/**
    Save a new land
*/
exports.saveLand = function(req, res) {

    var mappedErrors = validator.validate(req);
    
    if(!mappedErrors) {
        saveNewLand(req, res);
    } else {
        renderAddLandWithErrors(req, res, mappedErrors);
    }
    
    
}

function saveNewLand(req, res) {
    var coordinate = req.body.x + "-" + req.body.y + "-" + req.body.z;
    var imageName = coordinate + ".jpg";
    console.log("Saving new land: " + coordinate);
    
    var newLand = {
        x: req.body.x,
        y: req.body.y,
        z: req.body.z,
        fields: req.body.fields,
        cityLevel: req.body.cityLevel,
        type: req.body.type,
        obstacles: req.body.obstacles,
        grain: {
            inner: 0,
            outer: req.body['grain.outer']
        },
        iron: {
            inner: 0,
            outer: req.body['iron.outer']
        },
        stone: {
            inner: req.body['stone.inner'],
            outer: req.body['stone.outer']
        },
        picture: imageName
    };
    
    Land.addLand(newLand, function(err, land) {
        if (err) {
            console.log("Error: ", err);
            if(isDuplicateKeyError(err)) {
                var mappedErrors = {
                    'coordinates': {
                        param: 'coordinates',
                        msg: util.format('Már létezik ilyen <a href="/lands/%s/%s?z=%s", target="_blank">terület</a>, ellenőrizd az adatok helyességét!', newLand.x, newLand.y, newLand.z),
                        value: ''
                    }
                };
                renderAddLandWithErrors(req, res, mappedErrors)
            } else {
                res.redirect('/error');
            }
        } else {
            var image = new Buffer(req.body.picture.substr(req.body.picture.indexOf('base64') + 7), 'base64');
            imgUtil.saveImage(image, coordinate);
            req.flash("message", "'" + coordinate + "' terület sikeresen elmentve!");
            res.redirect('/lands/add');
        }
    });
}

function renderAddLandWithErrors(req, res, mappedErrors) {
    console.log("There were validation errors: " + mappedErrors);
    res.render('add_land', { 
        title: 'MyMap - Új terület',
        message: '',
        errors: mappedErrors,
        model: req.body
    });
}

function fillImageUrls(kingdomMap, callback) {
    var calls = [];
    kingdomMap.forEach(function(value, key) {
        calls.push(function(callbackPush) {
            storage.getImageUrl(value.picture, function(url) {
                value.pictureUrl = url;
                callbackPush(null, url);
            });
        });
    });
    
    async.parallel(calls, function(err, result) {
        /* this code will run after all calls finished the job or
           when any of the calls passes an error */
        if (err)
            callback(err);
        else
            callback();
    });
}

function isDuplicateKeyError(err) {
    return err.name === 'MongoError' && err.code === 11000;
}