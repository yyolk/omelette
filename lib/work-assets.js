/**
 * Module dependencies.
 */

var path = require('path');
var mime = require('mime');
var file = require('./file');
var debug = require('debug')('pancake:work-assets');

module.exports = function(req, res, next) {
  var rqpath = req.path.split('/');
  debug('rqpath: %s', rqpath);
  var name = rqpath[rqpath.length-1];

  var wpath = 'works/'+req.params.work+'/'+name;
  debug('attempting to serve static file %j', wpath);
  
  file(wpath)(req, res, function(err){
    if (err) return next(err);
    var buf = req.files[wpath];
    if (buf) {
      var type = mime.lookup(path.extname(name));
      debug('serving static file %j', wpath);
      var charset = mime.charsets.lookup(type);
      if (charset) type+= '; charset="' + charset + '"';
      res.set('Content-Type', type);
      res.set('Content-Length', buf.length);
      res.end(buf);
    } else {
      debug('file does not exist %j', wpath);
      next();
    }
  });
};