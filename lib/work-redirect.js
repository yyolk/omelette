
/**
 * Module exports.
 */

var url = require('url');
var debug = require('debug')('pancake:work-redirect');

/**
 * Module exports.
 */

module.exports = work;

/**
 * Check if the request was for a blog work by searching the "work_names".
 */

function work (req, res, next) {
  // is this an work request?
  var name = req.path.substring(1);
  console.log('name='+req);
  console.log('params='+req.params.work);
  if (!~req.work_names.indexOf(name)) {
    debug('skipping non-work request %j', name);
    return next();
  }

  debug('got work request without trailing "/" %j', name);

  var parsed = url.parse(req.url);
  parsed.pathname += '/';
  return res.redirect(url.format(parsed));
}

