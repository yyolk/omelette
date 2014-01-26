var sites = {
  'nothingbetween.us': 'http://yyolk.github.io/nothingbetween.us/',
  '0p3nr3p0': 'http://0p3nr3p0.net',
  'G_L_I_T_C_H': "https://www.facebook.com/groups/glitchglitch"
}

module.exports = function(req, res, next){
  var sitename = req.params.sitename;
  if(!sitename) next();
  res.redirect(sites[sitename]);
}