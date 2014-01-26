var sites = {
  'nothingbetween.us': 'http://192.241.178.102:5984/nothingbetweenus/_design/nothingbetweenus/index.html',
  '0p3nr3p0': 'http://0p3nr3p0.net',
  'G_L_I_T_C_H': "https://www.facebook.com/groups/glitchglitch"
}

module.exports = function(req, res, next){
  var sitename = req.params.sitename;
  if(!sitename) next();
  res.redirect(sites[sitename]);
}