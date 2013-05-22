
/**
 * Module dependencies.
 */

var workObj = require('./work-obj');
var debug = require('debug')('pancake:sorted-works');

/**
 * Module exports.
 */

module.exports = sortedWorks;

/**
 * Populates `req.sorted_works` with the Array of sorted "work objects"
 * based on their "date" property.
 */

function sortedWorks (req, res, next) {
  debug('populating `req.sorted_works`');
  var names = req.work_names;
  var pos = 0;
  var works = [];
  nextWork();

  function nextWork () {
    var name = names[pos++];
    if (!name) return sort();
    debug('getting "work object" for next work', name);
    workObj(name)(req, res, function (err) {
      if (err) return next(err);
      works.push(req.works[name]);
      nextWork();
    });
  }

  function sort () {
    debug('sorting array of %d "work objects" by their "date"', works.length);
    req.sorted_works = works.sort(by_date);
    next();
  }
}

/**
 * Sort 2 objects by their "date" properties.
 */

function by_date (a, b) {
  return b.date - a.date;
}

