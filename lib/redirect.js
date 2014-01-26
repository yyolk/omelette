var sites = {
  'nothingbetween.us': 'http://192.241.178.102:5984/nothingbetweenus/_design/nothingbetweenus/index.html'
}

module.exports = function(req, res, next){
  var sitename = req.params.sitename;
  if(!sitename) next();
  res.redirect(sites[sitename]);
}