/**
	Add a new land
*/

var flash = require('connect-flash')

exports.add = function(req, res){
  res.render('add_land', { title: 'MyMap - Új terület', message: req.flash('message') });
};