
/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug')('pancake:work-names');

/**
 * Module exports.
 */

module.exports = workNames;


/**
 * Populates `req.work_names` with an Array of Strings of the names of valid
 * blog works. An LRU cache is in place so that subsequent requests are cached.
 */

function workNames (req, res, next) {
  debug('populating `req.work_names`');

  // use fs
  var works_dir = path.join(req.app.settings.repo_path, 'works');
  fs.readdir(works_dir, function (err, files) {
    if (err) return next(err);
    debug('files: %j', files);
    works = [];
    files.forEach(function(e){
      pattern = /\.*\.markdown$/;

      if (!pattern.test(e)){
        debug('not a post %j', e);
        files.pop(e);
      } else {
        works.push(e);
      }
    });
    req.work_names = works.map(function (f) {
      debug('f: %s', f); 
      pattern = /\.markdown$/;
      if (pattern.test(f)) return f.replace(/\.markdown$/, '');
      else return '';
    });
    debug("req.work_names: %j", req.work_names);
    next();
  });
  return;
  next();
}

