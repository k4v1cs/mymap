var expressValidator = require('express-validator');

expressValidator.Validator.prototype.isValidFields = function() {
    var fields = parseInt(this.str);
    if ((fields < 22 && fields != 0) || fields > 43) {
        this.error(this.msg || 'A mezok száma nem érvényes érték');
    }
    return this; //Allow method chaining
}

module.exports.validate = function(req) {
    var OUTER_MAX_FIELDS = 32;
    
    //Sanitize values before validation
    req.sanitize('fields').ifNull(0);
    req.sanitize('cityLevel').ifNull(0);
    req.sanitize('obstacles').ifNull(0);
    req.sanitize(['grain.outer']).ifNull(0);
    req.sanitize(['iron.outer']).ifNull(0);
    req.sanitize(['stone.outer']).ifNull(0);
    req.sanitize(['stone.inner']).ifNull(0);
    
    //Validate values
    req.checkBody('x', 'X koordináta megadása kötelező!').notEmpty();
    req.checkBody('x', 'X koordináta 1-73 közti egész szám kell legyen!')
        .isNumeric().min(1).max(73);
        
    req.checkBody('y', 'Y koordináta megadása kötelező!').notEmpty();
    req.checkBody('y', 'Y koordináta 1-22 közti egész szám kell legyen!')
        .isNumeric().min(1).max(22);
        
    req.checkBody('z', 'Z koordináta megadása kötelező!').notEmpty();    
    req.checkBody('z', 'Z koordináta 1-63 közti egész szám kell legyen!')
        .isNumeric().min(1).max(63);
        
    req.checkBody('type', 'A típus megadása kötelező!').notEmpty();
    
    req.checkBody('picture', 'Kép megadása kötelező!').notEmpty();
    
    req.checkBody('fields', 'A mezők száma 0 vagy 22-43 közti egész szám kell legyen!')
        .isValidFields().isNumeric();
        
    req.checkBody('cityLevel', 'A város szintje 0-5 közti egész szám kell legyen!')
        .isNumeric().min(0).max(5);
        
    req.checkBody('obstacles', 'Az akadályok száma 0-nál nagyobb egész szám kell legyen!')
        .isNumeric().min(0);
    req.checkBody('obstacles', 'Az akadályok száma nem lehet nagyobb mint ' + req.body.fields)
        .isNumeric().min(0).max(req.body.fields);
    
    var maxGrain = OUTER_MAX_FIELDS - (parseInt(req.body['iron.outer']) + parseInt(req.body['stone.outer'])),
        outerResources = parseInt(req.body['iron.outer']) + parseInt(req.body['stone.outer']) + parseInt(req.body['grain.outer']);
    req.checkBody(['grain.outer'], 'A búza természetes szám kell legyen!')
        .isNumeric().min(0);
    req.checkBody(['grain.outer'], 'A külső erőforrások (búza, vas, külső kő) összege nem lehet nagyobb 32-nél: ' + outerResources).isNumeric().min(0).max(maxGrain);
    
    req.checkBody(['iron.outer'], 'A vas természetes szám kell legyen!')
        .isNumeric().min(0);
    
    req.checkBody(['stone.outer'], 'A külső kő természetes szám kell legyen!')
        .isNumeric().min(0);
    
    var maxInnerStone = req.body.fields - req.body.obstacles;
    req.checkBody(['stone.inner'], 'A belső kő természetes szám kell legyen!')
        .isNumeric().min(0);
    req.checkBody(['stone.inner'], 'A belső kő nem lehet nagyobb mint ' + maxInnerStone)
        .isNumeric().min(0).max(maxInnerStone);
    
    
    var mappedErrors = req.validationErrors(true);
    
    return mappedErrors;
}