
/**
 * Module dependencies.
 */

var fs = require('fs');

var path = require('path');

var debug = require('debug')('pancake:file');



module.exports = file;
function file (filepath) {
  return function (req, res, next) {
    debug('retrieving file %j', filepath);
    if (!req.files) req.files = {};

    if ('/' === filepath[filepath.length - 1]) {
      // we don't serve directories...
      debug('skipping directory path (ends with "/") %j', filepath);
      return next();
    }
    var full_path = path.join(req.app.settings.repo_path, filepath);
    debug('reading file using "fs" module for %j', full_path);
    fs.readFile(full_path, function (err, buf) {
      if (err && err.code != 'ENOENT') {
        return next(err);
      }
      if (buf) {
        req.files[filepath] = buf;
      }
      next();
    });
    return;

  };
}
