var Ruin = require('../models/Ruin');

/**
    Render ruins map
*/
exports.ruins = function(req, res) {
    var level = req.query.level ? parseInt(req.query.level) : null;
    Ruin.findKingdomCounts(level, function(err, result) {
        if(err) {
            console.log("Error: ", err);
            res.redirect('/error');
        } else {
            res.render("map", {title: "MyMap - Királyságok", kingdomCounts: result, mapType: 'ruins'});
        }
    })
}

/**
    Renders the ruins of the specified kingdom
*/
exports.showRuins = function(req, res) {
    var x = req.params.x;
    var y = req.params.y;
    
    Ruin.findKingdom(x, y, function(err, kingdomMap) {
        if(err) {
            console.log("Error: ", err);
            res.redirect('/error');
        } else {
            res.render("ruins", {
                title: "MyMap - " + x + "-" + y + " királyság romjai",
                x: x,
                y: y,
                ruins: kingdomMap
            });
        }
    });
}

/**
    Add new ruin
*/
exports.add = function(req, res) {

    var coordinate = req.body.x + "-" + req.body.y + "-" + req.body.z;
    console.log("Saving new ruin: " + coordinate);
    
    req.checkBody('level', 'A rom szintje 1-6 közti egész szám kell legyen!')
        .isNumeric().min(1).max(6);
    var mappedErrors = req.validationErrors(true);
    
    if(mappedErrors) {
        res.send(mappedErrors.level.msg, 500);
    } else {
        saveNewRuin(req, res);
    }
}

function saveNewRuin(req, res) {
    var newRuin = {
        x: req.body.x,
        y: req.body.y,
        z: req.body.z,
        level: req.body.level,
        agressive: req.body.agressive ? true : false
    };
    
    Ruin.addRuin(newRuin, function(err, ruin) {
        if (err) {
            console.log("Error: ", err);
            var errorMessage = "'" + coordinate + "' romot nem sikerült elmenteni!";
            res.send(errorMessage, 500);
        } else {
            res.json(ruin, 200);
        }
    });
}

/**
    Remove ruin
*/
exports.remove = function(req, res) {
    var coordinate = req.body.x + "-" + req.body.y + "-" + req.body.z;
    console.log("Removing ruin: " + coordinate);
    
    Ruin.removeRuin(req.body.x, req.body.y, req.body.z, function(err) {
        if(err) {
            console.log("Error: ", err);
            var errorMessage = "'" + coordinate + "' romot nem sikerült eltávolítani!";
            res.send(errorMessage, 500);
        } else {
            res.send(200);
        }
    });
}