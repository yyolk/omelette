
/**
 * Module dependencies.
 */

var render = require('./render');
var debug = require('debug')('omelette:homepage');
// var sortedArticles = require('./sorted-articles');
var sortedWorks = require('./sorted-works');
var recentlyUpdated = require('./recently-updated');
/**
 * Module exports.
 */

module.exports = homepage;

/**
 * Render and serve the homepage for the current commit.
 */

function homepage (req, res, next) {
  debug('rendering homepage');

  var locals = {};
  recentlyUpdated(req, res, function(err){
    locals.recently_updated = req.recently_updated;
  });
  sortedWorks(req, res, function(err){
    if (err) return next(err);
    //// duct-tape code for rendering all media types (prolly roll into a function if adding more types)
    // sortedArticles(req, res, function(err){
      // if (err) return next(err);
      //locals = {
      //  works: req.sorted_works,
      //  articles: req.sorted_articles
      //};
      locals.works = req.sorted_works;
      locals.recently_updated = req.recently_updated;
      // locals.articles = req.sorted_articles;
      render('views/index.jade', locals, 'views/banner.jade')(req, res, next);
    // });
  });
}
