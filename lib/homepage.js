
/**
 * Module dependencies.
 */

var render = require('./render');
var debug = require('debug')('pancake:homepage');
var sortedArticles = require('./sorted-articles');
var sortedWorks = require('./sorted-works');
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
  sortedWorks(req, res, function(err){
    if (err) return next(err);
    sortedArticles(req, res, function(err){
      if (err) return next(err);
      //locals = {
      //  works: req.sorted_works,
      //  articles: req.sorted_articles
      //};
      locals.works = req.sorted_works;
      locals.articles = req.sorted_articles;
      render('views/index.jade', locals)(req, res, next);
    });
  });
}
