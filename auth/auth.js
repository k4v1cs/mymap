var everyauth = require('everyauth'),
    User = require('../models/User'),
    middleware = require('./middleware');

exports.initialize = function() {
    everyauth.everymodule.findUserById( function (userId, callback) {
        User.findById(userId, callback);
    });

    everyauth.everymodule.logoutPath('/logout');
    everyauth.everymodule.logoutRedirectPath('/login');

    everyauth.password
        .getLoginPath('/login')
        .postLoginPath('/login')
        .loginView('login')
        .loginLocals(function (req, res) {
            return {
                 title: 'MyMap - Bejelentkezés',
                 message: req.flash('message')}
        })
        .authenticate(authenticate)
        .loginSuccessRedirect('/')
        .getRegisterPath('/register')
        .postRegisterPath('/register')
        .registerView('')
        .validateRegistration( function (newUserAttributes) {})
        .registerUser( function (newUserAttributes) {})
        .registerSuccessRedirect('/login');
      
    return everyauth;
}

exports.checkAdmin = middleware.checkAdmin;
exports.checkAuth = middleware.checkAuth;

function authenticate(login, password) {
    console.log("authenticating %s", login);
    var promise,
        errors = [];

    if (!login) errors.push('Add meg a felhasználóneved!');
    if (!password) errors.push('Add meg a jelszavad!');
    if (errors.length) return errors;

    promise = this.Promise();

    // findUser passes an error or user to a callback after finding the
    // user by login
    User.findByUsername( login, function (err, user) {
        var errorMessage = login + ' nevű felhasználó nem létezik, vagy hibás a jelszó';
        if (err) {
            errors.push(err.message || err);
            return promise.fulfill(errors);
        }
        if (!user) {
            errors.push(errorMessage);
            return promise.fulfill(errors);
        }

        User.validateUser(user, password, function (err, didSucceed) {
            if (err) {
                return promise.fail(err);
                errors.push(errorMessage);
                return promise.fulfill(errors);
            }
            if (didSucceed) 
                return promise.fulfill(user);
                
            errors.push(errorMessage);
            return promise.fulfill(errors);
        });
    });

    return promise;
};