
/**
 * Module exports.
 */

var url = require('url');
var debug = require('debug')('pancake:article-redirect');

/**
 * Module exports.
 */

module.exports = article;

/**
 * Check if the request was for a blog article by searching the "article_names".
 */

function article (req, res, next) {
  // is this an article request?
  var name = req.path.substring(1);
  if (!~req.article_names.indexOf(name)) {
    debug('skipping non-article request %j', name);
    return next();
  }

  debug('got article request without trailing "/" %j', name);

  var parsed = url.parse(req.url);
  parsed.pathname += '/';
  return res.redirect(url.format(parsed));
}
