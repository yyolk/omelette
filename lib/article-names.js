
/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug')('pancake:article-names');

/**
 * Module exports.
 */

module.exports = articleNames;

/**
 * Populates `req.article_names` with an Array of Strings of the names of valid
 * blog articles. An LRU cache is in place so that subsequent requests are cached.
 */

function articleNames (req, res, next) {
  debug('populating `req.article_names`');
  var articles_dir = path.join(req.app.settings.repo_path, 'articles');
  fs.readdir(articles_dir, function (err, files) {
    if (err) return next(err);
    req.article_names = files.map(function (f) {
      return f.replace(/\.markdown$/, '');
    });
    next();
  });
  return;
  next();
}
