
/**
 * Module dependencies.
 */

// var workObj = require('./work-obj');
var debug = require('debug')('omelette:recently-updated');
var fs = require('fs');


    // file(filename)(req, res, onFile);

/**
 * Module exports.
 */

module.exports = recentlyUpdated;

/**
 * Populates `req.sorted_works` with the Array of sorted "work objects"
 * based on their "date" property.
 */

function recentlyUpdated (req, res, next) {
  debug('populating `req.recently-updated`');
  // var works = [];
  var files = [];
  // fs.readFileSync('recent.txt').toString().split('\n').forEach(function(line){ files.push(line) ; });
  files = fs.readFileSync('recent.txt').toString().split('\n');
  files.pop();
  req.recently_updated = files;

}


