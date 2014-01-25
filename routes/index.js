
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.redirect('/ruins')
};
exports.error = function(req, res){
  res.render('error', { title: 'MyMap - OOPS' });
};