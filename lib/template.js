
/**
 * Module dependencies.
 */

var jade = require('jade');
var file = require('./file');
var debug = require('debug')('omelette:template');

/**
 * Module exports.
 */

module.exports = template;


/**
 * Gets file "filepath" and compiles it into a Jade function.
 * Populates `req.templates[filepath]` with the result.
 */

function template (filepath) {
  return function (req, res, next) {
    debug('getting Jade template for filepath', filepath);
    var template, buf;
    if (!req.templates) req.templates = {};

    

    // attempt to populate `req.files[filepath]` first
    file(filepath)(req, res, function (err) {
      if (err) return next(err);

      // ensure file is present
      buf = req.files[filepath];
      if (!buf) {
        return next(new Error('no data available for: ' + filepath));
      }

      // compile!
      template = jade.compile(buf.toString(), {
        filename: filepath
      });
      debug('done compiling Jade template %j', filepath);

      req.templates[filepath] = template;
      next();
    });
  };
}
