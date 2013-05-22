
/**
 * Module dependencies.
 */

var file = require('./file');
var markdown = require('./markdown');
var debug = require('debug')('pancake:work-obj');

/**
 * Module exports.
 */

module.exports = workObjs;


/**
 * Populates `req.works[work]` with an "work object".
 * Returns a cached work object in prod mode when possible.
 * An "work object" contains:
 *   - name  - String - Work filename (sans .markdown)
 *   - title - String - Artile full title
 *   - date  - Date   - The publish date of the work
 *   - html  - String - The HTML result of the compiled Markdown
 */

function workObjs (name) {
  return function (req, res, next) {

    //debug('getting "work object" (%s) %j', req.sha, name);

    if (!req.works) req.works = {};
    var work;


    // need to create and populate an "work object".
    // get the file contents of the .markdown work first.
    var filename = 'works/' + name + '.markdown';
    file(filename)(req, res, onFile);

    function onFile (err) {
      if (err) return next(err);
      var buf = req.files[filename];
      if (!buf) {
        return next(new Error('no data available for: ' + filepath));
      }

      // now that we have work .markdown contents, we can process it
      work = processWork(buf.toString('utf8'));
      work.filename = filename;
      work.name = name;
      debug('got "work object" %j', name);

      req.works[name] = work;
      next();
    }

  };
}

/**
 * Process a raw markdown String into an "work object".
 *
 * @api private
 */

var delimiter = '\n\n';

function processWork (contents) {
  var work = {};
  var split = contents.indexOf(delimiter);
  var headers = contents.substring(0, split).split('\n');

  // parse the headers
  work.headers = headers;
  headers.forEach(function (h) {
    var split = h.indexOf(':');
    var name = h.substring(0, split);
    if (h[split + 1] == ' ') split++;
    var val = h.substring(split + 1);
    work[name.toLowerCase()] = val;
  });

  // turn "date" into a Date instance
  work.date = new Date(work.date);

  // process the markdown into HTML
  work.html = markdown(contents.substring(split + delimiter.length));

  // the first paragraph
  work.desc = work.html.substring(0, work.html.indexOf('</p>'));

  return work;
}

