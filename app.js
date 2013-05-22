
/**
 * Module dependencies.
 */

var path = require('path');
var express = require('express');
var params = require('express-params');
var debug = require('debug')('pancake');

/**
 * The app.
 */

var app = module.exports = express();
params.extend(app);

var prod = app.settings.prod;// = /^production$/i.test(app.settings.env);
console.log('running in %j mode (prod: %s)', app.settings.env, prod);


/**
 * Connect logger.
 */

if (prod) {
  app.use(express.logger());
} else {
  app.use(express.logger('dev'));
}


/**
 * Routes.
 */


// `req.article_names` is used by every request
app.get('*', require('./lib/article-names'));

app.get('*', require('./lib/work-names'));
// by now `req.root_tree` is a "git_tree" instance to the resolved SHA
app.get('/', require('./lib/homepage'));
app.get('/articles', require('./lib/articles'));

// redirect blog articles to have a trailing "/" (this is necessary because of
// the way the browser serves files from relative URLs)
//app.get('*', require('./lib/article-redirect'));

app.param('article', /^[0-9a-z-_]+$/);
// serve static article/ items (defined by post_name with corresponding stiatic dir)
app.get('/article/:article', require('./lib/article'));

// attempt to render an article if this a request for one
//app.get('*', require('./lib/article'));


app.get('/works', require('./lib/works'));
//app.get('*', require('./lib/work-redirect'));
app.param('work', /^[0-9a-z-_]+$/);
app.get('/work/:work', require('./lib/work'));

app.get('/work/:work/*', require('./lib/work-assets'));
                       
    // finally attempt to serve static files from the public/ dir
app.get('*', require('./lib/static'));


