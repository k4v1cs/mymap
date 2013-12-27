
/*
 * GET home page.
 */

exports.index = function(req, res){
  //res.render('index', { title: 'MyMap' });
  res.redirect('/lands')
};
exports.error = function(req, res){
  res.render('error', { title: 'MyMap - OOPS' });
};