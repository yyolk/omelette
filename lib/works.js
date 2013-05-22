
/**
 * Module dependencies.
 */

var render = require('./render');
var debug = require('debug')('pancake:works');
var sortedWorks = require('./sorted-works');

/**
 * Module exports.
 */

module.exports = works;

/**
 * Render and serve the "/works" page for the current commit.
 */

function works (req, res, next) {
  debug('rendering %j', req.path);

  // need to get the "sorted_works" first
  sortedWorks(req, res, function (err) {
    if (err) return next(err);
    var locals = {
      works: req.sorted_works
    };
    render('views/works.jade', locals)(req, res, next);
  });
}

