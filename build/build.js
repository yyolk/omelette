/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Meta info, accessible in the global scope unless you use AMD option.
 */

require.loader = 'component';

/**
 * Internal helper object, contains a sorting function for semantiv versioning
 */
require.helper = {};
require.helper.semVerSort = function(a, b) {
  var aArray = a.version.split('.');
  var bArray = b.version.split('.');
  for (var i=0; i<aArray.length; ++i) {
    var aInt = parseInt(aArray[i], 10);
    var bInt = parseInt(bArray[i], 10);
    if (aInt === bInt) {
      var aLex = aArray[i].substr((""+aInt).length);
      var bLex = bArray[i].substr((""+bInt).length);
      if (aLex === '' && bLex !== '') return 1;
      if (aLex !== '' && bLex === '') return -1;
      if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;
      continue;
    } else if (aInt > bInt) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

/**
 * Find and require a module which name starts with the provided name.
 * If multiple modules exists, the highest semver is used. 
 * This function can only be used for remote dependencies.

 * @param {String} name - module name: `user~repo`
 * @param {Boolean} returnPath - returns the canonical require path if true, 
 *                               otherwise it returns the epxorted module
 */
require.latest = function (name, returnPath) {
  function showError(name) {
    throw new Error('failed to find latest module of "' + name + '"');
  }
  // only remotes with semvers, ignore local files conataining a '/'
  var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;
  var remoteRegexp = /(.*)~(.*)/;
  if (!remoteRegexp.test(name)) showError(name);
  var moduleNames = Object.keys(require.modules);
  var semVerCandidates = [];
  var otherCandidates = []; // for instance: name of the git branch
  for (var i=0; i<moduleNames.length; i++) {
    var moduleName = moduleNames[i];
    if (new RegExp(name + '@').test(moduleName)) {
        var version = moduleName.substr(name.length+1);
        var semVerMatch = versionRegexp.exec(moduleName);
        if (semVerMatch != null) {
          semVerCandidates.push({version: version, name: moduleName});
        } else {
          otherCandidates.push({version: version, name: moduleName});
        } 
    }
  }
  if (semVerCandidates.concat(otherCandidates).length === 0) {
    showError(name);
  }
  if (semVerCandidates.length > 0) {
    var module = semVerCandidates.sort(require.helper.semVerSort).pop().name;
    if (returnPath === true) {
      return module;
    }
    return require(module);
  }
  // if the build contains more than one branch of the same module
  // you should not use this funciton
  var module = otherCandidates.pop().name;
  if (returnPath === true) {
    return module;
  }
  return require(module);
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("component~favicon@1.0.3", Function("exports, module",
"\n\
/**\n\
 * Original favicon.\n\
 */\n\
\n\
var orig;\n\
\n\
/**\n\
 * Expose `set()`.\n\
 */\n\
\n\
exports = module.exports = set;\n\
\n\
/**\n\
 * Expose `reset()`.\n\
 */\n\
\n\
exports.reset = reset;\n\
\n\
/**\n\
 * Set the favicon to the given data uri `str`.\n\
 *\n\
 * @param {String} str\n\
 * @api public\n\
 */\n\
\n\
function set(str) {\n\
  if ('string' != typeof str) throw new TypeError('data uri string expected');\n\
  \n\
  // orig\n\
  var el = link();\n\
  if (el) orig = orig || el.href;\n\
\n\
  // remove old tag\n\
  remove();\n\
\n\
  // new one\n\
  var el = create();\n\
  el.href = str;\n\
  head().appendChild(el);\n\
}\n\
\n\
/**\n\
 * Return the favicon link.\n\
 *\n\
 * @return {Element}\n\
 * @api private\n\
 */\n\
\n\
function link() {\n\
  return document.querySelector('link[rel=icon]');\n\
}\n\
\n\
/**\n\
 * Remove the favicon link.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function remove() {\n\
  var el = link();\n\
  if (el) el.parentNode.removeChild(el);\n\
}\n\
\n\
/**\n\
 * Create a new link.\n\
 *\n\
 * @return {Element}\n\
 * @api private\n\
 */\n\
\n\
function create() {\n\
  var el = document.createElement('link');\n\
  el.type = 'image/x-icon';\n\
  el.rel = 'icon';\n\
  return el;\n\
}\n\
\n\
/**\n\
 * Reset to the original favicon.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function reset() {\n\
  if (orig) {\n\
    set(orig);\n\
  } else {\n\
    remove();\n\
  }\n\
}\n\
\n\
/**\n\
 * Return the head element.\n\
 *\n\
 * @return {Element}\n\
 * @api private\n\
 */\n\
\n\
function head() {\n\
  return document.getElementsByTagName('head')[0];\n\
}\n\
\n\
//# sourceURL=components/component/favicon/1.0.3/index.js"
));

require.modules["component-favicon"] = require.modules["component~favicon@1.0.3"];
require.modules["component~favicon"] = require.modules["component~favicon@1.0.3"];
require.modules["favicon"] = require.modules["component~favicon@1.0.3"];


require.register("component~jquery@1.0.0", Function("exports, module",
"/*!\n\
 * jQuery JavaScript Library v1.11.1\n\
 * http://jquery.com/\n\
 *\n\
 * Includes Sizzle.js\n\
 * http://sizzlejs.com/\n\
 *\n\
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors\n\
 * Released under the MIT license\n\
 * http://jquery.org/license\n\
 *\n\
 * Date: 2014-05-01T17:42Z\n\
 */\n\
\n\
(function( global, factory ) {\n\
\n\
  if ( typeof module === \"object\" && typeof module.exports === \"object\" ) {\n\
    // For CommonJS and CommonJS-like environments where a proper window is present,\n\
    // execute the factory and get jQuery\n\
    // For environments that do not inherently posses a window with a document\n\
    // (such as Node.js), expose a jQuery-making factory as module.exports\n\
    // This accentuates the need for the creation of a real window\n\
    // e.g. var jQuery = require(\"jquery\")(window);\n\
    // See ticket #14549 for more info\n\
    module.exports = global.document ?\n\
      factory( global, true ) :\n\
      function( w ) {\n\
        if ( !w.document ) {\n\
          throw new Error( \"jQuery requires a window with a document\" );\n\
        }\n\
        return factory( w );\n\
      };\n\
  } else {\n\
    factory( global );\n\
  }\n\
\n\
// Pass this if window is not defined yet\n\
}(typeof window !== \"undefined\" ? window : this, function( window, noGlobal ) {\n\
\n\
// Can't do this because several apps including ASP.NET trace\n\
// the stack via arguments.caller.callee and Firefox dies if\n\
// you try to trace through \"use strict\" call chains. (#13335)\n\
// Support: Firefox 18+\n\
//\n\
\n\
var deletedIds = [];\n\
\n\
var slice = deletedIds.slice;\n\
\n\
var concat = deletedIds.concat;\n\
\n\
var push = deletedIds.push;\n\
\n\
var indexOf = deletedIds.indexOf;\n\
\n\
var class2type = {};\n\
\n\
var toString = class2type.toString;\n\
\n\
var hasOwn = class2type.hasOwnProperty;\n\
\n\
var support = {};\n\
\n\
\n\
\n\
var\n\
  version = \"1.11.1\",\n\
\n\
  // Define a local copy of jQuery\n\
  jQuery = function( selector, context ) {\n\
    // The jQuery object is actually just the init constructor 'enhanced'\n\
    // Need init if jQuery is called (just allow error to be thrown if not included)\n\
    return new jQuery.fn.init( selector, context );\n\
  },\n\
\n\
  // Support: Android<4.1, IE<9\n\
  // Make sure we trim BOM and NBSP\n\
  rtrim = /^[\\s\\uFEFF\\xA0]+|[\\s\\uFEFF\\xA0]+$/g,\n\
\n\
  // Matches dashed string for camelizing\n\
  rmsPrefix = /^-ms-/,\n\
  rdashAlpha = /-([\\da-z])/gi,\n\
\n\
  // Used by jQuery.camelCase as callback to replace()\n\
  fcamelCase = function( all, letter ) {\n\
    return letter.toUpperCase();\n\
  };\n\
\n\
jQuery.fn = jQuery.prototype = {\n\
  // The current version of jQuery being used\n\
  jquery: version,\n\
\n\
  constructor: jQuery,\n\
\n\
  // Start with an empty selector\n\
  selector: \"\",\n\
\n\
  // The default length of a jQuery object is 0\n\
  length: 0,\n\
\n\
  toArray: function() {\n\
    return slice.call( this );\n\
  },\n\
\n\
  // Get the Nth element in the matched element set OR\n\
  // Get the whole matched element set as a clean array\n\
  get: function( num ) {\n\
    return num != null ?\n\
\n\
      // Return just the one element from the set\n\
      ( num < 0 ? this[ num + this.length ] : this[ num ] ) :\n\
\n\
      // Return all the elements in a clean array\n\
      slice.call( this );\n\
  },\n\
\n\
  // Take an array of elements and push it onto the stack\n\
  // (returning the new matched element set)\n\
  pushStack: function( elems ) {\n\
\n\
    // Build a new jQuery matched element set\n\
    var ret = jQuery.merge( this.constructor(), elems );\n\
\n\
    // Add the old object onto the stack (as a reference)\n\
    ret.prevObject = this;\n\
    ret.context = this.context;\n\
\n\
    // Return the newly-formed element set\n\
    return ret;\n\
  },\n\
\n\
  // Execute a callback for every element in the matched set.\n\
  // (You can seed the arguments with an array of args, but this is\n\
  // only used internally.)\n\
  each: function( callback, args ) {\n\
    return jQuery.each( this, callback, args );\n\
  },\n\
\n\
  map: function( callback ) {\n\
    return this.pushStack( jQuery.map(this, function( elem, i ) {\n\
      return callback.call( elem, i, elem );\n\
    }));\n\
  },\n\
\n\
  slice: function() {\n\
    return this.pushStack( slice.apply( this, arguments ) );\n\
  },\n\
\n\
  first: function() {\n\
    return this.eq( 0 );\n\
  },\n\
\n\
  last: function() {\n\
    return this.eq( -1 );\n\
  },\n\
\n\
  eq: function( i ) {\n\
    var len = this.length,\n\
      j = +i + ( i < 0 ? len : 0 );\n\
    return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );\n\
  },\n\
\n\
  end: function() {\n\
    return this.prevObject || this.constructor(null);\n\
  },\n\
\n\
  // For internal use only.\n\
  // Behaves like an Array's method, not like a jQuery method.\n\
  push: push,\n\
  sort: deletedIds.sort,\n\
  splice: deletedIds.splice\n\
};\n\
\n\
jQuery.extend = jQuery.fn.extend = function() {\n\
  var src, copyIsArray, copy, name, options, clone,\n\
    target = arguments[0] || {},\n\
    i = 1,\n\
    length = arguments.length,\n\
    deep = false;\n\
\n\
  // Handle a deep copy situation\n\
  if ( typeof target === \"boolean\" ) {\n\
    deep = target;\n\
\n\
    // skip the boolean and the target\n\
    target = arguments[ i ] || {};\n\
    i++;\n\
  }\n\
\n\
  // Handle case when target is a string or something (possible in deep copy)\n\
  if ( typeof target !== \"object\" && !jQuery.isFunction(target) ) {\n\
    target = {};\n\
  }\n\
\n\
  // extend jQuery itself if only one argument is passed\n\
  if ( i === length ) {\n\
    target = this;\n\
    i--;\n\
  }\n\
\n\
  for ( ; i < length; i++ ) {\n\
    // Only deal with non-null/undefined values\n\
    if ( (options = arguments[ i ]) != null ) {\n\
      // Extend the base object\n\
      for ( name in options ) {\n\
        src = target[ name ];\n\
        copy = options[ name ];\n\
\n\
        // Prevent never-ending loop\n\
        if ( target === copy ) {\n\
          continue;\n\
        }\n\
\n\
        // Recurse if we're merging plain objects or arrays\n\
        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {\n\
          if ( copyIsArray ) {\n\
            copyIsArray = false;\n\
            clone = src && jQuery.isArray(src) ? src : [];\n\
\n\
          } else {\n\
            clone = src && jQuery.isPlainObject(src) ? src : {};\n\
          }\n\
\n\
          // Never move original objects, clone them\n\
          target[ name ] = jQuery.extend( deep, clone, copy );\n\
\n\
        // Don't bring in undefined values\n\
        } else if ( copy !== undefined ) {\n\
          target[ name ] = copy;\n\
        }\n\
      }\n\
    }\n\
  }\n\
\n\
  // Return the modified object\n\
  return target;\n\
};\n\
\n\
jQuery.extend({\n\
  // Unique for each copy of jQuery on the page\n\
  expando: \"jQuery\" + ( version + Math.random() ).replace( /\\D/g, \"\" ),\n\
\n\
  // Assume jQuery is ready without the ready module\n\
  isReady: true,\n\
\n\
  error: function( msg ) {\n\
    throw new Error( msg );\n\
  },\n\
\n\
  noop: function() {},\n\
\n\
  // See test/unit/core.js for details concerning isFunction.\n\
  // Since version 1.3, DOM methods and functions like alert\n\
  // aren't supported. They return false on IE (#2968).\n\
  isFunction: function( obj ) {\n\
    return jQuery.type(obj) === \"function\";\n\
  },\n\
\n\
  isArray: Array.isArray || function( obj ) {\n\
    return jQuery.type(obj) === \"array\";\n\
  },\n\
\n\
  isWindow: function( obj ) {\n\
    /* jshint eqeqeq: false */\n\
    return obj != null && obj == obj.window;\n\
  },\n\
\n\
  isNumeric: function( obj ) {\n\
    // parseFloat NaNs numeric-cast false positives (null|true|false|\"\")\n\
    // ...but misinterprets leading-number strings, particularly hex literals (\"0x...\")\n\
    // subtraction forces infinities to NaN\n\
    return !jQuery.isArray( obj ) && obj - parseFloat( obj ) >= 0;\n\
  },\n\
\n\
  isEmptyObject: function( obj ) {\n\
    var name;\n\
    for ( name in obj ) {\n\
      return false;\n\
    }\n\
    return true;\n\
  },\n\
\n\
  isPlainObject: function( obj ) {\n\
    var key;\n\
\n\
    // Must be an Object.\n\
    // Because of IE, we also have to check the presence of the constructor property.\n\
    // Make sure that DOM nodes and window objects don't pass through, as well\n\
    if ( !obj || jQuery.type(obj) !== \"object\" || obj.nodeType || jQuery.isWindow( obj ) ) {\n\
      return false;\n\
    }\n\
\n\
    try {\n\
      // Not own constructor property must be Object\n\
      if ( obj.constructor &&\n\
        !hasOwn.call(obj, \"constructor\") &&\n\
        !hasOwn.call(obj.constructor.prototype, \"isPrototypeOf\") ) {\n\
        return false;\n\
      }\n\
    } catch ( e ) {\n\
      // IE8,9 Will throw exceptions on certain host objects #9897\n\
      return false;\n\
    }\n\
\n\
    // Support: IE<9\n\
    // Handle iteration over inherited properties before own properties.\n\
    if ( support.ownLast ) {\n\
      for ( key in obj ) {\n\
        return hasOwn.call( obj, key );\n\
      }\n\
    }\n\
\n\
    // Own properties are enumerated firstly, so to speed up,\n\
    // if last one is own, then all properties are own.\n\
    for ( key in obj ) {}\n\
\n\
    return key === undefined || hasOwn.call( obj, key );\n\
  },\n\
\n\
  type: function( obj ) {\n\
    if ( obj == null ) {\n\
      return obj + \"\";\n\
    }\n\
    return typeof obj === \"object\" || typeof obj === \"function\" ?\n\
      class2type[ toString.call(obj) ] || \"object\" :\n\
      typeof obj;\n\
  },\n\
\n\
  // Evaluates a script in a global context\n\
  // Workarounds based on findings by Jim Driscoll\n\
  // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context\n\
  globalEval: function( data ) {\n\
    if ( data && jQuery.trim( data ) ) {\n\
      // We use execScript on Internet Explorer\n\
      // We use an anonymous function so that context is window\n\
      // rather than jQuery in Firefox\n\
      ( window.execScript || function( data ) {\n\
        window[ \"eval\" ].call( window, data );\n\
      } )( data );\n\
    }\n\
  },\n\
\n\
  // Convert dashed to camelCase; used by the css and data modules\n\
  // Microsoft forgot to hump their vendor prefix (#9572)\n\
  camelCase: function( string ) {\n\
    return string.replace( rmsPrefix, \"ms-\" ).replace( rdashAlpha, fcamelCase );\n\
  },\n\
\n\
  nodeName: function( elem, name ) {\n\
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();\n\
  },\n\
\n\
  // args is for internal usage only\n\
  each: function( obj, callback, args ) {\n\
    var value,\n\
      i = 0,\n\
      length = obj.length,\n\
      isArray = isArraylike( obj );\n\
\n\
    if ( args ) {\n\
      if ( isArray ) {\n\
        for ( ; i < length; i++ ) {\n\
          value = callback.apply( obj[ i ], args );\n\
\n\
          if ( value === false ) {\n\
            break;\n\
          }\n\
        }\n\
      } else {\n\
        for ( i in obj ) {\n\
          value = callback.apply( obj[ i ], args );\n\
\n\
          if ( value === false ) {\n\
            break;\n\
          }\n\
        }\n\
      }\n\
\n\
    // A special, fast, case for the most common use of each\n\
    } else {\n\
      if ( isArray ) {\n\
        for ( ; i < length; i++ ) {\n\
          value = callback.call( obj[ i ], i, obj[ i ] );\n\
\n\
          if ( value === false ) {\n\
            break;\n\
          }\n\
        }\n\
      } else {\n\
        for ( i in obj ) {\n\
          value = callback.call( obj[ i ], i, obj[ i ] );\n\
\n\
          if ( value === false ) {\n\
            break;\n\
          }\n\
        }\n\
      }\n\
    }\n\
\n\
    return obj;\n\
  },\n\
\n\
  // Support: Android<4.1, IE<9\n\
  trim: function( text ) {\n\
    return text == null ?\n\
      \"\" :\n\
      ( text + \"\" ).replace( rtrim, \"\" );\n\
  },\n\
\n\
  // results is for internal usage only\n\
  makeArray: function( arr, results ) {\n\
    var ret = results || [];\n\
\n\
    if ( arr != null ) {\n\
      if ( isArraylike( Object(arr) ) ) {\n\
        jQuery.merge( ret,\n\
          typeof arr === \"string\" ?\n\
          [ arr ] : arr\n\
        );\n\
      } else {\n\
        push.call( ret, arr );\n\
      }\n\
    }\n\
\n\
    return ret;\n\
  },\n\
\n\
  inArray: function( elem, arr, i ) {\n\
    var len;\n\
\n\
    if ( arr ) {\n\
      if ( indexOf ) {\n\
        return indexOf.call( arr, elem, i );\n\
      }\n\
\n\
      len = arr.length;\n\
      i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;\n\
\n\
      for ( ; i < len; i++ ) {\n\
        // Skip accessing in sparse arrays\n\
        if ( i in arr && arr[ i ] === elem ) {\n\
          return i;\n\
        }\n\
      }\n\
    }\n\
\n\
    return -1;\n\
  },\n\
\n\
  merge: function( first, second ) {\n\
    var len = +second.length,\n\
      j = 0,\n\
      i = first.length;\n\
\n\
    while ( j < len ) {\n\
      first[ i++ ] = second[ j++ ];\n\
    }\n\
\n\
    // Support: IE<9\n\
    // Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)\n\
    if ( len !== len ) {\n\
      while ( second[j] !== undefined ) {\n\
        first[ i++ ] = second[ j++ ];\n\
      }\n\
    }\n\
\n\
    first.length = i;\n\
\n\
    return first;\n\
  },\n\
\n\
  grep: function( elems, callback, invert ) {\n\
    var callbackInverse,\n\
      matches = [],\n\
      i = 0,\n\
      length = elems.length,\n\
      callbackExpect = !invert;\n\
\n\
    // Go through the array, only saving the items\n\
    // that pass the validator function\n\
    for ( ; i < length; i++ ) {\n\
      callbackInverse = !callback( elems[ i ], i );\n\
      if ( callbackInverse !== callbackExpect ) {\n\
        matches.push( elems[ i ] );\n\
      }\n\
    }\n\
\n\
    return matches;\n\
  },\n\
\n\
  // arg is for internal usage only\n\
  map: function( elems, callback, arg ) {\n\
    var value,\n\
      i = 0,\n\
      length = elems.length,\n\
      isArray = isArraylike( elems ),\n\
      ret = [];\n\
\n\
    // Go through the array, translating each of the items to their new values\n\
    if ( isArray ) {\n\
      for ( ; i < length; i++ ) {\n\
        value = callback( elems[ i ], i, arg );\n\
\n\
        if ( value != null ) {\n\
          ret.push( value );\n\
        }\n\
      }\n\
\n\
    // Go through every key on the object,\n\
    } else {\n\
      for ( i in elems ) {\n\
        value = callback( elems[ i ], i, arg );\n\
\n\
        if ( value != null ) {\n\
          ret.push( value );\n\
        }\n\
      }\n\
    }\n\
\n\
    // Flatten any nested arrays\n\
    return concat.apply( [], ret );\n\
  },\n\
\n\
  // A global GUID counter for objects\n\
  guid: 1,\n\
\n\
  // Bind a function to a context, optionally partially applying any\n\
  // arguments.\n\
  proxy: function( fn, context ) {\n\
    var args, proxy, tmp;\n\
\n\
    if ( typeof context === \"string\" ) {\n\
      tmp = fn[ context ];\n\
      context = fn;\n\
      fn = tmp;\n\
    }\n\
\n\
    // Quick check to determine if target is callable, in the spec\n\
    // this throws a TypeError, but we will just return undefined.\n\
    if ( !jQuery.isFunction( fn ) ) {\n\
      return undefined;\n\
    }\n\
\n\
    // Simulated bind\n\
    args = slice.call( arguments, 2 );\n\
    proxy = function() {\n\
      return fn.apply( context || this, args.concat( slice.call( arguments ) ) );\n\
    };\n\
\n\
    // Set the guid of unique handler to the same of original handler, so it can be removed\n\
    proxy.guid = fn.guid = fn.guid || jQuery.guid++;\n\
\n\
    return proxy;\n\
  },\n\
\n\
  now: function() {\n\
    return +( new Date() );\n\
  },\n\
\n\
  // jQuery.support is not used in Core but other projects attach their\n\
  // properties to it so it needs to exist.\n\
  support: support\n\
});\n\
\n\
// Populate the class2type map\n\
jQuery.each(\"Boolean Number String Function Array Date RegExp Object Error\".split(\" \"), function(i, name) {\n\
  class2type[ \"[object \" + name + \"]\" ] = name.toLowerCase();\n\
});\n\
\n\
function isArraylike( obj ) {\n\
  var length = obj.length,\n\
    type = jQuery.type( obj );\n\
\n\
  if ( type === \"function\" || jQuery.isWindow( obj ) ) {\n\
    return false;\n\
  }\n\
\n\
  if ( obj.nodeType === 1 && length ) {\n\
    return true;\n\
  }\n\
\n\
  return type === \"array\" || length === 0 ||\n\
    typeof length === \"number\" && length > 0 && ( length - 1 ) in obj;\n\
}\n\
var Sizzle =\n\
/*!\n\
 * Sizzle CSS Selector Engine v1.10.19\n\
 * http://sizzlejs.com/\n\
 *\n\
 * Copyright 2013 jQuery Foundation, Inc. and other contributors\n\
 * Released under the MIT license\n\
 * http://jquery.org/license\n\
 *\n\
 * Date: 2014-04-18\n\
 */\n\
(function( window ) {\n\
\n\
var i,\n\
  support,\n\
  Expr,\n\
  getText,\n\
  isXML,\n\
  tokenize,\n\
  compile,\n\
  select,\n\
  outermostContext,\n\
  sortInput,\n\
  hasDuplicate,\n\
\n\
  // Local document vars\n\
  setDocument,\n\
  document,\n\
  docElem,\n\
  documentIsHTML,\n\
  rbuggyQSA,\n\
  rbuggyMatches,\n\
  matches,\n\
  contains,\n\
\n\
  // Instance-specific data\n\
  expando = \"sizzle\" + -(new Date()),\n\
  preferredDoc = window.document,\n\
  dirruns = 0,\n\
  done = 0,\n\
  classCache = createCache(),\n\
  tokenCache = createCache(),\n\
  compilerCache = createCache(),\n\
  sortOrder = function( a, b ) {\n\
    if ( a === b ) {\n\
      hasDuplicate = true;\n\
    }\n\
    return 0;\n\
  },\n\
\n\
  // General-purpose constants\n\
  strundefined = typeof undefined,\n\
  MAX_NEGATIVE = 1 << 31,\n\
\n\
  // Instance methods\n\
  hasOwn = ({}).hasOwnProperty,\n\
  arr = [],\n\
  pop = arr.pop,\n\
  push_native = arr.push,\n\
  push = arr.push,\n\
  slice = arr.slice,\n\
  // Use a stripped-down indexOf if we can't use a native one\n\
  indexOf = arr.indexOf || function( elem ) {\n\
    var i = 0,\n\
      len = this.length;\n\
    for ( ; i < len; i++ ) {\n\
      if ( this[i] === elem ) {\n\
        return i;\n\
      }\n\
    }\n\
    return -1;\n\
  },\n\
\n\
  booleans = \"checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped\",\n\
\n\
  // Regular expressions\n\
\n\
  // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace\n\
  whitespace = \"[\\\\x20\\\\t\\\\r\\\\n\
\\\\f]\",\n\
  // http://www.w3.org/TR/css3-syntax/#characters\n\
  characterEncoding = \"(?:\\\\\\\\.|[\\\\w-]|[^\\\\x00-\\\\xa0])+\",\n\
\n\
  // Loosely modeled on CSS identifier characters\n\
  // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors\n\
  // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier\n\
  identifier = characterEncoding.replace( \"w\", \"w#\" ),\n\
\n\
  // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors\n\
  attributes = \"\\\\[\" + whitespace + \"*(\" + characterEncoding + \")(?:\" + whitespace +\n\
    // Operator (capture 2)\n\
    \"*([*^$|!~]?=)\" + whitespace +\n\
    // \"Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]\"\n\
    \"*(?:'((?:\\\\\\\\.|[^\\\\\\\\'])*)'|\\\"((?:\\\\\\\\.|[^\\\\\\\\\\\"])*)\\\"|(\" + identifier + \"))|)\" + whitespace +\n\
    \"*\\\\]\",\n\
\n\
  pseudos = \":(\" + characterEncoding + \")(?:\\\\((\" +\n\
    // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:\n\
    // 1. quoted (capture 3; capture 4 or capture 5)\n\
    \"('((?:\\\\\\\\.|[^\\\\\\\\'])*)'|\\\"((?:\\\\\\\\.|[^\\\\\\\\\\\"])*)\\\")|\" +\n\
    // 2. simple (capture 6)\n\
    \"((?:\\\\\\\\.|[^\\\\\\\\()[\\\\]]|\" + attributes + \")*)|\" +\n\
    // 3. anything else (capture 2)\n\
    \".*\" +\n\
    \")\\\\)|)\",\n\
\n\
  // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter\n\
  rtrim = new RegExp( \"^\" + whitespace + \"+|((?:^|[^\\\\\\\\])(?:\\\\\\\\.)*)\" + whitespace + \"+$\", \"g\" ),\n\
\n\
  rcomma = new RegExp( \"^\" + whitespace + \"*,\" + whitespace + \"*\" ),\n\
  rcombinators = new RegExp( \"^\" + whitespace + \"*([>+~]|\" + whitespace + \")\" + whitespace + \"*\" ),\n\
\n\
  rattributeQuotes = new RegExp( \"=\" + whitespace + \"*([^\\\\]'\\\"]*?)\" + whitespace + \"*\\\\]\", \"g\" ),\n\
\n\
  rpseudo = new RegExp( pseudos ),\n\
  ridentifier = new RegExp( \"^\" + identifier + \"$\" ),\n\
\n\
  matchExpr = {\n\
    \"ID\": new RegExp( \"^#(\" + characterEncoding + \")\" ),\n\
    \"CLASS\": new RegExp( \"^\\\\.(\" + characterEncoding + \")\" ),\n\
    \"TAG\": new RegExp( \"^(\" + characterEncoding.replace( \"w\", \"w*\" ) + \")\" ),\n\
    \"ATTR\": new RegExp( \"^\" + attributes ),\n\
    \"PSEUDO\": new RegExp( \"^\" + pseudos ),\n\
    \"CHILD\": new RegExp( \"^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\\\(\" + whitespace +\n\
      \"*(even|odd|(([+-]|)(\\\\d*)n|)\" + whitespace + \"*(?:([+-]|)\" + whitespace +\n\
      \"*(\\\\d+)|))\" + whitespace + \"*\\\\)|)\", \"i\" ),\n\
    \"bool\": new RegExp( \"^(?:\" + booleans + \")$\", \"i\" ),\n\
    // For use in libraries implementing .is()\n\
    // We use this for POS matching in `select`\n\
    \"needsContext\": new RegExp( \"^\" + whitespace + \"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\\\(\" +\n\
      whitespace + \"*((?:-\\\\d)?\\\\d*)\" + whitespace + \"*\\\\)|)(?=[^-]|$)\", \"i\" )\n\
  },\n\
\n\
  rinputs = /^(?:input|select|textarea|button)$/i,\n\
  rheader = /^h\\d$/i,\n\
\n\
  rnative = /^[^{]+\\{\\s*\\[native \\w/,\n\
\n\
  // Easily-parseable/retrievable ID or TAG or CLASS selectors\n\
  rquickExpr = /^(?:#([\\w-]+)|(\\w+)|\\.([\\w-]+))$/,\n\
\n\
  rsibling = /[+~]/,\n\
  rescape = /'|\\\\/g,\n\
\n\
  // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters\n\
  runescape = new RegExp( \"\\\\\\\\([\\\\da-f]{1,6}\" + whitespace + \"?|(\" + whitespace + \")|.)\", \"ig\" ),\n\
  funescape = function( _, escaped, escapedWhitespace ) {\n\
    var high = \"0x\" + escaped - 0x10000;\n\
    // NaN means non-codepoint\n\
    // Support: Firefox<24\n\
    // Workaround erroneous numeric interpretation of +\"0x\"\n\
    return high !== high || escapedWhitespace ?\n\
      escaped :\n\
      high < 0 ?\n\
        // BMP codepoint\n\
        String.fromCharCode( high + 0x10000 ) :\n\
        // Supplemental Plane codepoint (surrogate pair)\n\
        String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );\n\
  };\n\
\n\
// Optimize for push.apply( _, NodeList )\n\
try {\n\
  push.apply(\n\
    (arr = slice.call( preferredDoc.childNodes )),\n\
    preferredDoc.childNodes\n\
  );\n\
  // Support: Android<4.0\n\
  // Detect silently failing push.apply\n\
  arr[ preferredDoc.childNodes.length ].nodeType;\n\
} catch ( e ) {\n\
  push = { apply: arr.length ?\n\
\n\
    // Leverage slice if possible\n\
    function( target, els ) {\n\
      push_native.apply( target, slice.call(els) );\n\
    } :\n\
\n\
    // Support: IE<9\n\
    // Otherwise append directly\n\
    function( target, els ) {\n\
      var j = target.length,\n\
        i = 0;\n\
      // Can't trust NodeList.length\n\
      while ( (target[j++] = els[i++]) ) {}\n\
      target.length = j - 1;\n\
    }\n\
  };\n\
}\n\
\n\
function Sizzle( selector, context, results, seed ) {\n\
  var match, elem, m, nodeType,\n\
    // QSA vars\n\
    i, groups, old, nid, newContext, newSelector;\n\
\n\
  if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {\n\
    setDocument( context );\n\
  }\n\
\n\
  context = context || document;\n\
  results = results || [];\n\
\n\
  if ( !selector || typeof selector !== \"string\" ) {\n\
    return results;\n\
  }\n\
\n\
  if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {\n\
    return [];\n\
  }\n\
\n\
  if ( documentIsHTML && !seed ) {\n\
\n\
    // Shortcuts\n\
    if ( (match = rquickExpr.exec( selector )) ) {\n\
      // Speed-up: Sizzle(\"#ID\")\n\
      if ( (m = match[1]) ) {\n\
        if ( nodeType === 9 ) {\n\
          elem = context.getElementById( m );\n\
          // Check parentNode to catch when Blackberry 4.6 returns\n\
          // nodes that are no longer in the document (jQuery #6963)\n\
          if ( elem && elem.parentNode ) {\n\
            // Handle the case where IE, Opera, and Webkit return items\n\
            // by name instead of ID\n\
            if ( elem.id === m ) {\n\
              results.push( elem );\n\
              return results;\n\
            }\n\
          } else {\n\
            return results;\n\
          }\n\
        } else {\n\
          // Context is not a document\n\
          if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&\n\
            contains( context, elem ) && elem.id === m ) {\n\
            results.push( elem );\n\
            return results;\n\
          }\n\
        }\n\
\n\
      // Speed-up: Sizzle(\"TAG\")\n\
      } else if ( match[2] ) {\n\
        push.apply( results, context.getElementsByTagName( selector ) );\n\
        return results;\n\
\n\
      // Speed-up: Sizzle(\".CLASS\")\n\
      } else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {\n\
        push.apply( results, context.getElementsByClassName( m ) );\n\
        return results;\n\
      }\n\
    }\n\
\n\
    // QSA path\n\
    if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {\n\
      nid = old = expando;\n\
      newContext = context;\n\
      newSelector = nodeType === 9 && selector;\n\
\n\
      // qSA works strangely on Element-rooted queries\n\
      // We can work around this by specifying an extra ID on the root\n\
      // and working up from there (Thanks to Andrew Dupont for the technique)\n\
      // IE 8 doesn't work on object elements\n\
      if ( nodeType === 1 && context.nodeName.toLowerCase() !== \"object\" ) {\n\
        groups = tokenize( selector );\n\
\n\
        if ( (old = context.getAttribute(\"id\")) ) {\n\
          nid = old.replace( rescape, \"\\\\$&\" );\n\
        } else {\n\
          context.setAttribute( \"id\", nid );\n\
        }\n\
        nid = \"[id='\" + nid + \"'] \";\n\
\n\
        i = groups.length;\n\
        while ( i-- ) {\n\
          groups[i] = nid + toSelector( groups[i] );\n\
        }\n\
        newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;\n\
        newSelector = groups.join(\",\");\n\
      }\n\
\n\
      if ( newSelector ) {\n\
        try {\n\
          push.apply( results,\n\
            newContext.querySelectorAll( newSelector )\n\
          );\n\
          return results;\n\
        } catch(qsaError) {\n\
        } finally {\n\
          if ( !old ) {\n\
            context.removeAttribute(\"id\");\n\
          }\n\
        }\n\
      }\n\
    }\n\
  }\n\
\n\
  // All others\n\
  return select( selector.replace( rtrim, \"$1\" ), context, results, seed );\n\
}\n\
\n\
/**\n\
 * Create key-value caches of limited size\n\
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with\n\
 *  property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)\n\
 *  deleting the oldest entry\n\
 */\n\
function createCache() {\n\
  var keys = [];\n\
\n\
  function cache( key, value ) {\n\
    // Use (key + \" \") to avoid collision with native prototype properties (see Issue #157)\n\
    if ( keys.push( key + \" \" ) > Expr.cacheLength ) {\n\
      // Only keep the most recent entries\n\
      delete cache[ keys.shift() ];\n\
    }\n\
    return (cache[ key + \" \" ] = value);\n\
  }\n\
  return cache;\n\
}\n\
\n\
/**\n\
 * Mark a function for special use by Sizzle\n\
 * @param {Function} fn The function to mark\n\
 */\n\
function markFunction( fn ) {\n\
  fn[ expando ] = true;\n\
  return fn;\n\
}\n\
\n\
/**\n\
 * Support testing using an element\n\
 * @param {Function} fn Passed the created div and expects a boolean result\n\
 */\n\
function assert( fn ) {\n\
  var div = document.createElement(\"div\");\n\
\n\
  try {\n\
    return !!fn( div );\n\
  } catch (e) {\n\
    return false;\n\
  } finally {\n\
    // Remove from its parent by default\n\
    if ( div.parentNode ) {\n\
      div.parentNode.removeChild( div );\n\
    }\n\
    // release memory in IE\n\
    div = null;\n\
  }\n\
}\n\
\n\
/**\n\
 * Adds the same handler for all of the specified attrs\n\
 * @param {String} attrs Pipe-separated list of attributes\n\
 * @param {Function} handler The method that will be applied\n\
 */\n\
function addHandle( attrs, handler ) {\n\
  var arr = attrs.split(\"|\"),\n\
    i = attrs.length;\n\
\n\
  while ( i-- ) {\n\
    Expr.attrHandle[ arr[i] ] = handler;\n\
  }\n\
}\n\
\n\
/**\n\
 * Checks document order of two siblings\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b\n\
 */\n\
function siblingCheck( a, b ) {\n\
  var cur = b && a,\n\
    diff = cur && a.nodeType === 1 && b.nodeType === 1 &&\n\
      ( ~b.sourceIndex || MAX_NEGATIVE ) -\n\
      ( ~a.sourceIndex || MAX_NEGATIVE );\n\
\n\
  // Use IE sourceIndex if available on both nodes\n\
  if ( diff ) {\n\
    return diff;\n\
  }\n\
\n\
  // Check if b follows a\n\
  if ( cur ) {\n\
    while ( (cur = cur.nextSibling) ) {\n\
      if ( cur === b ) {\n\
        return -1;\n\
      }\n\
    }\n\
  }\n\
\n\
  return a ? 1 : -1;\n\
}\n\
\n\
/**\n\
 * Returns a function to use in pseudos for input types\n\
 * @param {String} type\n\
 */\n\
function createInputPseudo( type ) {\n\
  return function( elem ) {\n\
    var name = elem.nodeName.toLowerCase();\n\
    return name === \"input\" && elem.type === type;\n\
  };\n\
}\n\
\n\
/**\n\
 * Returns a function to use in pseudos for buttons\n\
 * @param {String} type\n\
 */\n\
function createButtonPseudo( type ) {\n\
  return function( elem ) {\n\
    var name = elem.nodeName.toLowerCase();\n\
    return (name === \"input\" || name === \"button\") && elem.type === type;\n\
  };\n\
}\n\
\n\
/**\n\
 * Returns a function to use in pseudos for positionals\n\
 * @param {Function} fn\n\
 */\n\
function createPositionalPseudo( fn ) {\n\
  return markFunction(function( argument ) {\n\
    argument = +argument;\n\
    return markFunction(function( seed, matches ) {\n\
      var j,\n\
        matchIndexes = fn( [], seed.length, argument ),\n\
        i = matchIndexes.length;\n\
\n\
      // Match elements found at the specified indexes\n\
      while ( i-- ) {\n\
        if ( seed[ (j = matchIndexes[i]) ] ) {\n\
          seed[j] = !(matches[j] = seed[j]);\n\
        }\n\
      }\n\
    });\n\
  });\n\
}\n\
\n\
/**\n\
 * Checks a node for validity as a Sizzle context\n\
 * @param {Element|Object=} context\n\
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value\n\
 */\n\
function testContext( context ) {\n\
  return context && typeof context.getElementsByTagName !== strundefined && context;\n\
}\n\
\n\
// Expose support vars for convenience\n\
support = Sizzle.support = {};\n\
\n\
/**\n\
 * Detects XML nodes\n\
 * @param {Element|Object} elem An element or a document\n\
 * @returns {Boolean} True iff elem is a non-HTML XML node\n\
 */\n\
isXML = Sizzle.isXML = function( elem ) {\n\
  // documentElement is verified for cases where it doesn't yet exist\n\
  // (such as loading iframes in IE - #4833)\n\
  var documentElement = elem && (elem.ownerDocument || elem).documentElement;\n\
  return documentElement ? documentElement.nodeName !== \"HTML\" : false;\n\
};\n\
\n\
/**\n\
 * Sets document-related variables once based on the current document\n\
 * @param {Element|Object} [doc] An element or document object to use to set the document\n\
 * @returns {Object} Returns the current document\n\
 */\n\
setDocument = Sizzle.setDocument = function( node ) {\n\
  var hasCompare,\n\
    doc = node ? node.ownerDocument || node : preferredDoc,\n\
    parent = doc.defaultView;\n\
\n\
  // If no document and documentElement is available, return\n\
  if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {\n\
    return document;\n\
  }\n\
\n\
  // Set our document\n\
  document = doc;\n\
  docElem = doc.documentElement;\n\
\n\
  // Support tests\n\
  documentIsHTML = !isXML( doc );\n\
\n\
  // Support: IE>8\n\
  // If iframe document is assigned to \"document\" variable and if iframe has been reloaded,\n\
  // IE will throw \"permission denied\" error when accessing \"document\" variable, see jQuery #13936\n\
  // IE6-8 do not support the defaultView property so parent will be undefined\n\
  if ( parent && parent !== parent.top ) {\n\
    // IE11 does not have attachEvent, so all must suffer\n\
    if ( parent.addEventListener ) {\n\
      parent.addEventListener( \"unload\", function() {\n\
        setDocument();\n\
      }, false );\n\
    } else if ( parent.attachEvent ) {\n\
      parent.attachEvent( \"onunload\", function() {\n\
        setDocument();\n\
      });\n\
    }\n\
  }\n\
\n\
  /* Attributes\n\
  ---------------------------------------------------------------------- */\n\
\n\
  // Support: IE<8\n\
  // Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)\n\
  support.attributes = assert(function( div ) {\n\
    div.className = \"i\";\n\
    return !div.getAttribute(\"className\");\n\
  });\n\
\n\
  /* getElement(s)By*\n\
  ---------------------------------------------------------------------- */\n\
\n\
  // Check if getElementsByTagName(\"*\") returns only elements\n\
  support.getElementsByTagName = assert(function( div ) {\n\
    div.appendChild( doc.createComment(\"\") );\n\
    return !div.getElementsByTagName(\"*\").length;\n\
  });\n\
\n\
  // Check if getElementsByClassName can be trusted\n\
  support.getElementsByClassName = rnative.test( doc.getElementsByClassName ) && assert(function( div ) {\n\
    div.innerHTML = \"<div class='a'></div><div class='a i'></div>\";\n\
\n\
    // Support: Safari<4\n\
    // Catch class over-caching\n\
    div.firstChild.className = \"i\";\n\
    // Support: Opera<10\n\
    // Catch gEBCN failure to find non-leading classes\n\
    return div.getElementsByClassName(\"i\").length === 2;\n\
  });\n\
\n\
  // Support: IE<10\n\
  // Check if getElementById returns elements by name\n\
  // The broken getElementById methods don't pick up programatically-set names,\n\
  // so use a roundabout getElementsByName test\n\
  support.getById = assert(function( div ) {\n\
    docElem.appendChild( div ).id = expando;\n\
    return !doc.getElementsByName || !doc.getElementsByName( expando ).length;\n\
  });\n\
\n\
  // ID find and filter\n\
  if ( support.getById ) {\n\
    Expr.find[\"ID\"] = function( id, context ) {\n\
      if ( typeof context.getElementById !== strundefined && documentIsHTML ) {\n\
        var m = context.getElementById( id );\n\
        // Check parentNode to catch when Blackberry 4.6 returns\n\
        // nodes that are no longer in the document #6963\n\
        return m && m.parentNode ? [ m ] : [];\n\
      }\n\
    };\n\
    Expr.filter[\"ID\"] = function( id ) {\n\
      var attrId = id.replace( runescape, funescape );\n\
      return function( elem ) {\n\
        return elem.getAttribute(\"id\") === attrId;\n\
      };\n\
    };\n\
  } else {\n\
    // Support: IE6/7\n\
    // getElementById is not reliable as a find shortcut\n\
    delete Expr.find[\"ID\"];\n\
\n\
    Expr.filter[\"ID\"] =  function( id ) {\n\
      var attrId = id.replace( runescape, funescape );\n\
      return function( elem ) {\n\
        var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode(\"id\");\n\
        return node && node.value === attrId;\n\
      };\n\
    };\n\
  }\n\
\n\
  // Tag\n\
  Expr.find[\"TAG\"] = support.getElementsByTagName ?\n\
    function( tag, context ) {\n\
      if ( typeof context.getElementsByTagName !== strundefined ) {\n\
        return context.getElementsByTagName( tag );\n\
      }\n\
    } :\n\
    function( tag, context ) {\n\
      var elem,\n\
        tmp = [],\n\
        i = 0,\n\
        results = context.getElementsByTagName( tag );\n\
\n\
      // Filter out possible comments\n\
      if ( tag === \"*\" ) {\n\
        while ( (elem = results[i++]) ) {\n\
          if ( elem.nodeType === 1 ) {\n\
            tmp.push( elem );\n\
          }\n\
        }\n\
\n\
        return tmp;\n\
      }\n\
      return results;\n\
    };\n\
\n\
  // Class\n\
  Expr.find[\"CLASS\"] = support.getElementsByClassName && function( className, context ) {\n\
    if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {\n\
      return context.getElementsByClassName( className );\n\
    }\n\
  };\n\
\n\
  /* QSA/matchesSelector\n\
  ---------------------------------------------------------------------- */\n\
\n\
  // QSA and matchesSelector support\n\
\n\
  // matchesSelector(:active) reports false when true (IE9/Opera 11.5)\n\
  rbuggyMatches = [];\n\
\n\
  // qSa(:focus) reports false when true (Chrome 21)\n\
  // We allow this because of a bug in IE8/9 that throws an error\n\
  // whenever `document.activeElement` is accessed on an iframe\n\
  // So, we allow :focus to pass through QSA all the time to avoid the IE error\n\
  // See http://bugs.jquery.com/ticket/13378\n\
  rbuggyQSA = [];\n\
\n\
  if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {\n\
    // Build QSA regex\n\
    // Regex strategy adopted from Diego Perini\n\
    assert(function( div ) {\n\
      // Select is set to empty string on purpose\n\
      // This is to test IE's treatment of not explicitly\n\
      // setting a boolean content attribute,\n\
      // since its presence should be enough\n\
      // http://bugs.jquery.com/ticket/12359\n\
      div.innerHTML = \"<select msallowclip=''><option selected=''></option></select>\";\n\
\n\
      // Support: IE8, Opera 11-12.16\n\
      // Nothing should be selected when empty strings follow ^= or $= or *=\n\
      // The test attribute must be unknown in Opera but \"safe\" for WinRT\n\
      // http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section\n\
      if ( div.querySelectorAll(\"[msallowclip^='']\").length ) {\n\
        rbuggyQSA.push( \"[*^$]=\" + whitespace + \"*(?:''|\\\"\\\")\" );\n\
      }\n\
\n\
      // Support: IE8\n\
      // Boolean attributes and \"value\" are not treated correctly\n\
      if ( !div.querySelectorAll(\"[selected]\").length ) {\n\
        rbuggyQSA.push( \"\\\\[\" + whitespace + \"*(?:value|\" + booleans + \")\" );\n\
      }\n\
\n\
      // Webkit/Opera - :checked should return selected option elements\n\
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked\n\
      // IE8 throws error here and will not see later tests\n\
      if ( !div.querySelectorAll(\":checked\").length ) {\n\
        rbuggyQSA.push(\":checked\");\n\
      }\n\
    });\n\
\n\
    assert(function( div ) {\n\
      // Support: Windows 8 Native Apps\n\
      // The type and name attributes are restricted during .innerHTML assignment\n\
      var input = doc.createElement(\"input\");\n\
      input.setAttribute( \"type\", \"hidden\" );\n\
      div.appendChild( input ).setAttribute( \"name\", \"D\" );\n\
\n\
      // Support: IE8\n\
      // Enforce case-sensitivity of name attribute\n\
      if ( div.querySelectorAll(\"[name=d]\").length ) {\n\
        rbuggyQSA.push( \"name\" + whitespace + \"*[*^$|!~]?=\" );\n\
      }\n\
\n\
      // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)\n\
      // IE8 throws error here and will not see later tests\n\
      if ( !div.querySelectorAll(\":enabled\").length ) {\n\
        rbuggyQSA.push( \":enabled\", \":disabled\" );\n\
      }\n\
\n\
      // Opera 10-11 does not throw on post-comma invalid pseudos\n\
      div.querySelectorAll(\"*,:x\");\n\
      rbuggyQSA.push(\",.*:\");\n\
    });\n\
  }\n\
\n\
  if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||\n\
    docElem.webkitMatchesSelector ||\n\
    docElem.mozMatchesSelector ||\n\
    docElem.oMatchesSelector ||\n\
    docElem.msMatchesSelector) )) ) {\n\
\n\
    assert(function( div ) {\n\
      // Check to see if it's possible to do matchesSelector\n\
      // on a disconnected node (IE 9)\n\
      support.disconnectedMatch = matches.call( div, \"div\" );\n\
\n\
      // This should fail with an exception\n\
      // Gecko does not error, returns false instead\n\
      matches.call( div, \"[s!='']:x\" );\n\
      rbuggyMatches.push( \"!=\", pseudos );\n\
    });\n\
  }\n\
\n\
  rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join(\"|\") );\n\
  rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join(\"|\") );\n\
\n\
  /* Contains\n\
  ---------------------------------------------------------------------- */\n\
  hasCompare = rnative.test( docElem.compareDocumentPosition );\n\
\n\
  // Element contains another\n\
  // Purposefully does not implement inclusive descendent\n\
  // As in, an element does not contain itself\n\
  contains = hasCompare || rnative.test( docElem.contains ) ?\n\
    function( a, b ) {\n\
      var adown = a.nodeType === 9 ? a.documentElement : a,\n\
        bup = b && b.parentNode;\n\
      return a === bup || !!( bup && bup.nodeType === 1 && (\n\
        adown.contains ?\n\
          adown.contains( bup ) :\n\
          a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16\n\
      ));\n\
    } :\n\
    function( a, b ) {\n\
      if ( b ) {\n\
        while ( (b = b.parentNode) ) {\n\
          if ( b === a ) {\n\
            return true;\n\
          }\n\
        }\n\
      }\n\
      return false;\n\
    };\n\
\n\
  /* Sorting\n\
  ---------------------------------------------------------------------- */\n\
\n\
  // Document order sorting\n\
  sortOrder = hasCompare ?\n\
  function( a, b ) {\n\
\n\
    // Flag for duplicate removal\n\
    if ( a === b ) {\n\
      hasDuplicate = true;\n\
      return 0;\n\
    }\n\
\n\
    // Sort on method existence if only one input has compareDocumentPosition\n\
    var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;\n\
    if ( compare ) {\n\
      return compare;\n\
    }\n\
\n\
    // Calculate position if both inputs belong to the same document\n\
    compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?\n\
      a.compareDocumentPosition( b ) :\n\
\n\
      // Otherwise we know they are disconnected\n\
      1;\n\
\n\
    // Disconnected nodes\n\
    if ( compare & 1 ||\n\
      (!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {\n\
\n\
      // Choose the first element that is related to our preferred document\n\
      if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {\n\
        return -1;\n\
      }\n\
      if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {\n\
        return 1;\n\
      }\n\
\n\
      // Maintain original order\n\
      return sortInput ?\n\
        ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :\n\
        0;\n\
    }\n\
\n\
    return compare & 4 ? -1 : 1;\n\
  } :\n\
  function( a, b ) {\n\
    // Exit early if the nodes are identical\n\
    if ( a === b ) {\n\
      hasDuplicate = true;\n\
      return 0;\n\
    }\n\
\n\
    var cur,\n\
      i = 0,\n\
      aup = a.parentNode,\n\
      bup = b.parentNode,\n\
      ap = [ a ],\n\
      bp = [ b ];\n\
\n\
    // Parentless nodes are either documents or disconnected\n\
    if ( !aup || !bup ) {\n\
      return a === doc ? -1 :\n\
        b === doc ? 1 :\n\
        aup ? -1 :\n\
        bup ? 1 :\n\
        sortInput ?\n\
        ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :\n\
        0;\n\
\n\
    // If the nodes are siblings, we can do a quick check\n\
    } else if ( aup === bup ) {\n\
      return siblingCheck( a, b );\n\
    }\n\
\n\
    // Otherwise we need full lists of their ancestors for comparison\n\
    cur = a;\n\
    while ( (cur = cur.parentNode) ) {\n\
      ap.unshift( cur );\n\
    }\n\
    cur = b;\n\
    while ( (cur = cur.parentNode) ) {\n\
      bp.unshift( cur );\n\
    }\n\
\n\
    // Walk down the tree looking for a discrepancy\n\
    while ( ap[i] === bp[i] ) {\n\
      i++;\n\
    }\n\
\n\
    return i ?\n\
      // Do a sibling check if the nodes have a common ancestor\n\
      siblingCheck( ap[i], bp[i] ) :\n\
\n\
      // Otherwise nodes in our document sort first\n\
      ap[i] === preferredDoc ? -1 :\n\
      bp[i] === preferredDoc ? 1 :\n\
      0;\n\
  };\n\
\n\
  return doc;\n\
};\n\
\n\
Sizzle.matches = function( expr, elements ) {\n\
  return Sizzle( expr, null, null, elements );\n\
};\n\
\n\
Sizzle.matchesSelector = function( elem, expr ) {\n\
  // Set document vars if needed\n\
  if ( ( elem.ownerDocument || elem ) !== document ) {\n\
    setDocument( elem );\n\
  }\n\
\n\
  // Make sure that attribute selectors are quoted\n\
  expr = expr.replace( rattributeQuotes, \"='$1']\" );\n\
\n\
  if ( support.matchesSelector && documentIsHTML &&\n\
    ( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&\n\
    ( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {\n\
\n\
    try {\n\
      var ret = matches.call( elem, expr );\n\
\n\
      // IE 9's matchesSelector returns false on disconnected nodes\n\
      if ( ret || support.disconnectedMatch ||\n\
          // As well, disconnected nodes are said to be in a document\n\
          // fragment in IE 9\n\
          elem.document && elem.document.nodeType !== 11 ) {\n\
        return ret;\n\
      }\n\
    } catch(e) {}\n\
  }\n\
\n\
  return Sizzle( expr, document, null, [ elem ] ).length > 0;\n\
};\n\
\n\
Sizzle.contains = function( context, elem ) {\n\
  // Set document vars if needed\n\
  if ( ( context.ownerDocument || context ) !== document ) {\n\
    setDocument( context );\n\
  }\n\
  return contains( context, elem );\n\
};\n\
\n\
Sizzle.attr = function( elem, name ) {\n\
  // Set document vars if needed\n\
  if ( ( elem.ownerDocument || elem ) !== document ) {\n\
    setDocument( elem );\n\
  }\n\
\n\
  var fn = Expr.attrHandle[ name.toLowerCase() ],\n\
    // Don't get fooled by Object.prototype properties (jQuery #13807)\n\
    val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?\n\
      fn( elem, name, !documentIsHTML ) :\n\
      undefined;\n\
\n\
  return val !== undefined ?\n\
    val :\n\
    support.attributes || !documentIsHTML ?\n\
      elem.getAttribute( name ) :\n\
      (val = elem.getAttributeNode(name)) && val.specified ?\n\
        val.value :\n\
        null;\n\
};\n\
\n\
Sizzle.error = function( msg ) {\n\
  throw new Error( \"Syntax error, unrecognized expression: \" + msg );\n\
};\n\
\n\
/**\n\
 * Document sorting and removing duplicates\n\
 * @param {ArrayLike} results\n\
 */\n\
Sizzle.uniqueSort = function( results ) {\n\
  var elem,\n\
    duplicates = [],\n\
    j = 0,\n\
    i = 0;\n\
\n\
  // Unless we *know* we can detect duplicates, assume their presence\n\
  hasDuplicate = !support.detectDuplicates;\n\
  sortInput = !support.sortStable && results.slice( 0 );\n\
  results.sort( sortOrder );\n\
\n\
  if ( hasDuplicate ) {\n\
    while ( (elem = results[i++]) ) {\n\
      if ( elem === results[ i ] ) {\n\
        j = duplicates.push( i );\n\
      }\n\
    }\n\
    while ( j-- ) {\n\
      results.splice( duplicates[ j ], 1 );\n\
    }\n\
  }\n\
\n\
  // Clear input after sorting to release objects\n\
  // See https://github.com/jquery/sizzle/pull/225\n\
  sortInput = null;\n\
\n\
  return results;\n\
};\n\
\n\
/**\n\
 * Utility function for retrieving the text value of an array of DOM nodes\n\
 * @param {Array|Element} elem\n\
 */\n\
getText = Sizzle.getText = function( elem ) {\n\
  var node,\n\
    ret = \"\",\n\
    i = 0,\n\
    nodeType = elem.nodeType;\n\
\n\
  if ( !nodeType ) {\n\
    // If no nodeType, this is expected to be an array\n\
    while ( (node = elem[i++]) ) {\n\
      // Do not traverse comment nodes\n\
      ret += getText( node );\n\
    }\n\
  } else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {\n\
    // Use textContent for elements\n\
    // innerText usage removed for consistency of new lines (jQuery #11153)\n\
    if ( typeof elem.textContent === \"string\" ) {\n\
      return elem.textContent;\n\
    } else {\n\
      // Traverse its children\n\
      for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {\n\
        ret += getText( elem );\n\
      }\n\
    }\n\
  } else if ( nodeType === 3 || nodeType === 4 ) {\n\
    return elem.nodeValue;\n\
  }\n\
  // Do not include comment or processing instruction nodes\n\
\n\
  return ret;\n\
};\n\
\n\
Expr = Sizzle.selectors = {\n\
\n\
  // Can be adjusted by the user\n\
  cacheLength: 50,\n\
\n\
  createPseudo: markFunction,\n\
\n\
  match: matchExpr,\n\
\n\
  attrHandle: {},\n\
\n\
  find: {},\n\
\n\
  relative: {\n\
    \">\": { dir: \"parentNode\", first: true },\n\
    \" \": { dir: \"parentNode\" },\n\
    \"+\": { dir: \"previousSibling\", first: true },\n\
    \"~\": { dir: \"previousSibling\" }\n\
  },\n\
\n\
  preFilter: {\n\
    \"ATTR\": function( match ) {\n\
      match[1] = match[1].replace( runescape, funescape );\n\
\n\
      // Move the given value to match[3] whether quoted or unquoted\n\
      match[3] = ( match[3] || match[4] || match[5] || \"\" ).replace( runescape, funescape );\n\
\n\
      if ( match[2] === \"~=\" ) {\n\
        match[3] = \" \" + match[3] + \" \";\n\
      }\n\
\n\
      return match.slice( 0, 4 );\n\
    },\n\
\n\
    \"CHILD\": function( match ) {\n\
      /* matches from matchExpr[\"CHILD\"]\n\
        1 type (only|nth|...)\n\
        2 what (child|of-type)\n\
        3 argument (even|odd|\\d*|\\d*n([+-]\\d+)?|...)\n\
        4 xn-component of xn+y argument ([+-]?\\d*n|)\n\
        5 sign of xn-component\n\
        6 x of xn-component\n\
        7 sign of y-component\n\
        8 y of y-component\n\
      */\n\
      match[1] = match[1].toLowerCase();\n\
\n\
      if ( match[1].slice( 0, 3 ) === \"nth\" ) {\n\
        // nth-* requires argument\n\
        if ( !match[3] ) {\n\
          Sizzle.error( match[0] );\n\
        }\n\
\n\
        // numeric x and y parameters for Expr.filter.CHILD\n\
        // remember that false/true cast respectively to 0/1\n\
        match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === \"even\" || match[3] === \"odd\" ) );\n\
        match[5] = +( ( match[7] + match[8] ) || match[3] === \"odd\" );\n\
\n\
      // other types prohibit arguments\n\
      } else if ( match[3] ) {\n\
        Sizzle.error( match[0] );\n\
      }\n\
\n\
      return match;\n\
    },\n\
\n\
    \"PSEUDO\": function( match ) {\n\
      var excess,\n\
        unquoted = !match[6] && match[2];\n\
\n\
      if ( matchExpr[\"CHILD\"].test( match[0] ) ) {\n\
        return null;\n\
      }\n\
\n\
      // Accept quoted arguments as-is\n\
      if ( match[3] ) {\n\
        match[2] = match[4] || match[5] || \"\";\n\
\n\
      // Strip excess characters from unquoted arguments\n\
      } else if ( unquoted && rpseudo.test( unquoted ) &&\n\
        // Get excess from tokenize (recursively)\n\
        (excess = tokenize( unquoted, true )) &&\n\
        // advance to the next closing parenthesis\n\
        (excess = unquoted.indexOf( \")\", unquoted.length - excess ) - unquoted.length) ) {\n\
\n\
        // excess is a negative index\n\
        match[0] = match[0].slice( 0, excess );\n\
        match[2] = unquoted.slice( 0, excess );\n\
      }\n\
\n\
      // Return only captures needed by the pseudo filter method (type and argument)\n\
      return match.slice( 0, 3 );\n\
    }\n\
  },\n\
\n\
  filter: {\n\
\n\
    \"TAG\": function( nodeNameSelector ) {\n\
      var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();\n\
      return nodeNameSelector === \"*\" ?\n\
        function() { return true; } :\n\
        function( elem ) {\n\
          return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;\n\
        };\n\
    },\n\
\n\
    \"CLASS\": function( className ) {\n\
      var pattern = classCache[ className + \" \" ];\n\
\n\
      return pattern ||\n\
        (pattern = new RegExp( \"(^|\" + whitespace + \")\" + className + \"(\" + whitespace + \"|$)\" )) &&\n\
        classCache( className, function( elem ) {\n\
          return pattern.test( typeof elem.className === \"string\" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute(\"class\") || \"\" );\n\
        });\n\
    },\n\
\n\
    \"ATTR\": function( name, operator, check ) {\n\
      return function( elem ) {\n\
        var result = Sizzle.attr( elem, name );\n\
\n\
        if ( result == null ) {\n\
          return operator === \"!=\";\n\
        }\n\
        if ( !operator ) {\n\
          return true;\n\
        }\n\
\n\
        result += \"\";\n\
\n\
        return operator === \"=\" ? result === check :\n\
          operator === \"!=\" ? result !== check :\n\
          operator === \"^=\" ? check && result.indexOf( check ) === 0 :\n\
          operator === \"*=\" ? check && result.indexOf( check ) > -1 :\n\
          operator === \"$=\" ? check && result.slice( -check.length ) === check :\n\
          operator === \"~=\" ? ( \" \" + result + \" \" ).indexOf( check ) > -1 :\n\
          operator === \"|=\" ? result === check || result.slice( 0, check.length + 1 ) === check + \"-\" :\n\
          false;\n\
      };\n\
    },\n\
\n\
    \"CHILD\": function( type, what, argument, first, last ) {\n\
      var simple = type.slice( 0, 3 ) !== \"nth\",\n\
        forward = type.slice( -4 ) !== \"last\",\n\
        ofType = what === \"of-type\";\n\
\n\
      return first === 1 && last === 0 ?\n\
\n\
        // Shortcut for :nth-*(n)\n\
        function( elem ) {\n\
          return !!elem.parentNode;\n\
        } :\n\
\n\
        function( elem, context, xml ) {\n\
          var cache, outerCache, node, diff, nodeIndex, start,\n\
            dir = simple !== forward ? \"nextSibling\" : \"previousSibling\",\n\
            parent = elem.parentNode,\n\
            name = ofType && elem.nodeName.toLowerCase(),\n\
            useCache = !xml && !ofType;\n\
\n\
          if ( parent ) {\n\
\n\
            // :(first|last|only)-(child|of-type)\n\
            if ( simple ) {\n\
              while ( dir ) {\n\
                node = elem;\n\
                while ( (node = node[ dir ]) ) {\n\
                  if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {\n\
                    return false;\n\
                  }\n\
                }\n\
                // Reverse direction for :only-* (if we haven't yet done so)\n\
                start = dir = type === \"only\" && !start && \"nextSibling\";\n\
              }\n\
              return true;\n\
            }\n\
\n\
            start = [ forward ? parent.firstChild : parent.lastChild ];\n\
\n\
            // non-xml :nth-child(...) stores cache data on `parent`\n\
            if ( forward && useCache ) {\n\
              // Seek `elem` from a previously-cached index\n\
              outerCache = parent[ expando ] || (parent[ expando ] = {});\n\
              cache = outerCache[ type ] || [];\n\
              nodeIndex = cache[0] === dirruns && cache[1];\n\
              diff = cache[0] === dirruns && cache[2];\n\
              node = nodeIndex && parent.childNodes[ nodeIndex ];\n\
\n\
              while ( (node = ++nodeIndex && node && node[ dir ] ||\n\
\n\
                // Fallback to seeking `elem` from the start\n\
                (diff = nodeIndex = 0) || start.pop()) ) {\n\
\n\
                // When found, cache indexes on `parent` and break\n\
                if ( node.nodeType === 1 && ++diff && node === elem ) {\n\
                  outerCache[ type ] = [ dirruns, nodeIndex, diff ];\n\
                  break;\n\
                }\n\
              }\n\
\n\
            // Use previously-cached element index if available\n\
            } else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {\n\
              diff = cache[1];\n\
\n\
            // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)\n\
            } else {\n\
              // Use the same loop as above to seek `elem` from the start\n\
              while ( (node = ++nodeIndex && node && node[ dir ] ||\n\
                (diff = nodeIndex = 0) || start.pop()) ) {\n\
\n\
                if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {\n\
                  // Cache the index of each encountered element\n\
                  if ( useCache ) {\n\
                    (node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];\n\
                  }\n\
\n\
                  if ( node === elem ) {\n\
                    break;\n\
                  }\n\
                }\n\
              }\n\
            }\n\
\n\
            // Incorporate the offset, then check against cycle size\n\
            diff -= last;\n\
            return diff === first || ( diff % first === 0 && diff / first >= 0 );\n\
          }\n\
        };\n\
    },\n\
\n\
    \"PSEUDO\": function( pseudo, argument ) {\n\
      // pseudo-class names are case-insensitive\n\
      // http://www.w3.org/TR/selectors/#pseudo-classes\n\
      // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters\n\
      // Remember that setFilters inherits from pseudos\n\
      var args,\n\
        fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||\n\
          Sizzle.error( \"unsupported pseudo: \" + pseudo );\n\
\n\
      // The user may use createPseudo to indicate that\n\
      // arguments are needed to create the filter function\n\
      // just as Sizzle does\n\
      if ( fn[ expando ] ) {\n\
        return fn( argument );\n\
      }\n\
\n\
      // But maintain support for old signatures\n\
      if ( fn.length > 1 ) {\n\
        args = [ pseudo, pseudo, \"\", argument ];\n\
        return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?\n\
          markFunction(function( seed, matches ) {\n\
            var idx,\n\
              matched = fn( seed, argument ),\n\
              i = matched.length;\n\
            while ( i-- ) {\n\
              idx = indexOf.call( seed, matched[i] );\n\
              seed[ idx ] = !( matches[ idx ] = matched[i] );\n\
            }\n\
          }) :\n\
          function( elem ) {\n\
            return fn( elem, 0, args );\n\
          };\n\
      }\n\
\n\
      return fn;\n\
    }\n\
  },\n\
\n\
  pseudos: {\n\
    // Potentially complex pseudos\n\
    \"not\": markFunction(function( selector ) {\n\
      // Trim the selector passed to compile\n\
      // to avoid treating leading and trailing\n\
      // spaces as combinators\n\
      var input = [],\n\
        results = [],\n\
        matcher = compile( selector.replace( rtrim, \"$1\" ) );\n\
\n\
      return matcher[ expando ] ?\n\
        markFunction(function( seed, matches, context, xml ) {\n\
          var elem,\n\
            unmatched = matcher( seed, null, xml, [] ),\n\
            i = seed.length;\n\
\n\
          // Match elements unmatched by `matcher`\n\
          while ( i-- ) {\n\
            if ( (elem = unmatched[i]) ) {\n\
              seed[i] = !(matches[i] = elem);\n\
            }\n\
          }\n\
        }) :\n\
        function( elem, context, xml ) {\n\
          input[0] = elem;\n\
          matcher( input, null, xml, results );\n\
          return !results.pop();\n\
        };\n\
    }),\n\
\n\
    \"has\": markFunction(function( selector ) {\n\
      return function( elem ) {\n\
        return Sizzle( selector, elem ).length > 0;\n\
      };\n\
    }),\n\
\n\
    \"contains\": markFunction(function( text ) {\n\
      return function( elem ) {\n\
        return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;\n\
      };\n\
    }),\n\
\n\
    // \"Whether an element is represented by a :lang() selector\n\
    // is based solely on the element's language value\n\
    // being equal to the identifier C,\n\
    // or beginning with the identifier C immediately followed by \"-\".\n\
    // The matching of C against the element's language value is performed case-insensitively.\n\
    // The identifier C does not have to be a valid language name.\"\n\
    // http://www.w3.org/TR/selectors/#lang-pseudo\n\
    \"lang\": markFunction( function( lang ) {\n\
      // lang value must be a valid identifier\n\
      if ( !ridentifier.test(lang || \"\") ) {\n\
        Sizzle.error( \"unsupported lang: \" + lang );\n\
      }\n\
      lang = lang.replace( runescape, funescape ).toLowerCase();\n\
      return function( elem ) {\n\
        var elemLang;\n\
        do {\n\
          if ( (elemLang = documentIsHTML ?\n\
            elem.lang :\n\
            elem.getAttribute(\"xml:lang\") || elem.getAttribute(\"lang\")) ) {\n\
\n\
            elemLang = elemLang.toLowerCase();\n\
            return elemLang === lang || elemLang.indexOf( lang + \"-\" ) === 0;\n\
          }\n\
        } while ( (elem = elem.parentNode) && elem.nodeType === 1 );\n\
        return false;\n\
      };\n\
    }),\n\
\n\
    // Miscellaneous\n\
    \"target\": function( elem ) {\n\
      var hash = window.location && window.location.hash;\n\
      return hash && hash.slice( 1 ) === elem.id;\n\
    },\n\
\n\
    \"root\": function( elem ) {\n\
      return elem === docElem;\n\
    },\n\
\n\
    \"focus\": function( elem ) {\n\
      return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);\n\
    },\n\
\n\
    // Boolean properties\n\
    \"enabled\": function( elem ) {\n\
      return elem.disabled === false;\n\
    },\n\
\n\
    \"disabled\": function( elem ) {\n\
      return elem.disabled === true;\n\
    },\n\
\n\
    \"checked\": function( elem ) {\n\
      // In CSS3, :checked should return both checked and selected elements\n\
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked\n\
      var nodeName = elem.nodeName.toLowerCase();\n\
      return (nodeName === \"input\" && !!elem.checked) || (nodeName === \"option\" && !!elem.selected);\n\
    },\n\
\n\
    \"selected\": function( elem ) {\n\
      // Accessing this property makes selected-by-default\n\
      // options in Safari work properly\n\
      if ( elem.parentNode ) {\n\
        elem.parentNode.selectedIndex;\n\
      }\n\
\n\
      return elem.selected === true;\n\
    },\n\
\n\
    // Contents\n\
    \"empty\": function( elem ) {\n\
      // http://www.w3.org/TR/selectors/#empty-pseudo\n\
      // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),\n\
      //   but not by others (comment: 8; processing instruction: 7; etc.)\n\
      // nodeType < 6 works because attributes (2) do not appear as children\n\
      for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {\n\
        if ( elem.nodeType < 6 ) {\n\
          return false;\n\
        }\n\
      }\n\
      return true;\n\
    },\n\
\n\
    \"parent\": function( elem ) {\n\
      return !Expr.pseudos[\"empty\"]( elem );\n\
    },\n\
\n\
    // Element/input types\n\
    \"header\": function( elem ) {\n\
      return rheader.test( elem.nodeName );\n\
    },\n\
\n\
    \"input\": function( elem ) {\n\
      return rinputs.test( elem.nodeName );\n\
    },\n\
\n\
    \"button\": function( elem ) {\n\
      var name = elem.nodeName.toLowerCase();\n\
      return name === \"input\" && elem.type === \"button\" || name === \"button\";\n\
    },\n\
\n\
    \"text\": function( elem ) {\n\
      var attr;\n\
      return elem.nodeName.toLowerCase() === \"input\" &&\n\
        elem.type === \"text\" &&\n\
\n\
        // Support: IE<8\n\
        // New HTML5 attribute values (e.g., \"search\") appear with elem.type === \"text\"\n\
        ( (attr = elem.getAttribute(\"type\")) == null || attr.toLowerCase() === \"text\" );\n\
    },\n\
\n\
    // Position-in-collection\n\
    \"first\": createPositionalPseudo(function() {\n\
      return [ 0 ];\n\
    }),\n\
\n\
    \"last\": createPositionalPseudo(function( matchIndexes, length ) {\n\
      return [ length - 1 ];\n\
    }),\n\
\n\
    \"eq\": createPositionalPseudo(function( matchIndexes, length, argument ) {\n\
      return [ argument < 0 ? argument + length : argument ];\n\
    }),\n\
\n\
    \"even\": createPositionalPseudo(function( matchIndexes, length ) {\n\
      var i = 0;\n\
      for ( ; i < length; i += 2 ) {\n\
        matchIndexes.push( i );\n\
      }\n\
      return matchIndexes;\n\
    }),\n\
\n\
    \"odd\": createPositionalPseudo(function( matchIndexes, length ) {\n\
      var i = 1;\n\
      for ( ; i < length; i += 2 ) {\n\
        matchIndexes.push( i );\n\
      }\n\
      return matchIndexes;\n\
    }),\n\
\n\
    \"lt\": createPositionalPseudo(function( matchIndexes, length, argument ) {\n\
      var i = argument < 0 ? argument + length : argument;\n\
      for ( ; --i >= 0; ) {\n\
        matchIndexes.push( i );\n\
      }\n\
      return matchIndexes;\n\
    }),\n\
\n\
    \"gt\": createPositionalPseudo(function( matchIndexes, length, argument ) {\n\
      var i = argument < 0 ? argument + length : argument;\n\
      for ( ; ++i < length; ) {\n\
        matchIndexes.push( i );\n\
      }\n\
      return matchIndexes;\n\
    })\n\
  }\n\
};\n\
\n\
Expr.pseudos[\"nth\"] = Expr.pseudos[\"eq\"];\n\
\n\
// Add button/input type pseudos\n\
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {\n\
  Expr.pseudos[ i ] = createInputPseudo( i );\n\
}\n\
for ( i in { submit: true, reset: true } ) {\n\
  Expr.pseudos[ i ] = createButtonPseudo( i );\n\
}\n\
\n\
// Easy API for creating new setFilters\n\
function setFilters() {}\n\
setFilters.prototype = Expr.filters = Expr.pseudos;\n\
Expr.setFilters = new setFilters();\n\
\n\
tokenize = Sizzle.tokenize = function( selector, parseOnly ) {\n\
  var matched, match, tokens, type,\n\
    soFar, groups, preFilters,\n\
    cached = tokenCache[ selector + \" \" ];\n\
\n\
  if ( cached ) {\n\
    return parseOnly ? 0 : cached.slice( 0 );\n\
  }\n\
\n\
  soFar = selector;\n\
  groups = [];\n\
  preFilters = Expr.preFilter;\n\
\n\
  while ( soFar ) {\n\
\n\
    // Comma and first run\n\
    if ( !matched || (match = rcomma.exec( soFar )) ) {\n\
      if ( match ) {\n\
        // Don't consume trailing commas as valid\n\
        soFar = soFar.slice( match[0].length ) || soFar;\n\
      }\n\
      groups.push( (tokens = []) );\n\
    }\n\
\n\
    matched = false;\n\
\n\
    // Combinators\n\
    if ( (match = rcombinators.exec( soFar )) ) {\n\
      matched = match.shift();\n\
      tokens.push({\n\
        value: matched,\n\
        // Cast descendant combinators to space\n\
        type: match[0].replace( rtrim, \" \" )\n\
      });\n\
      soFar = soFar.slice( matched.length );\n\
    }\n\
\n\
    // Filters\n\
    for ( type in Expr.filter ) {\n\
      if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||\n\
        (match = preFilters[ type ]( match ))) ) {\n\
        matched = match.shift();\n\
        tokens.push({\n\
          value: matched,\n\
          type: type,\n\
          matches: match\n\
        });\n\
        soFar = soFar.slice( matched.length );\n\
      }\n\
    }\n\
\n\
    if ( !matched ) {\n\
      break;\n\
    }\n\
  }\n\
\n\
  // Return the length of the invalid excess\n\
  // if we're just parsing\n\
  // Otherwise, throw an error or return tokens\n\
  return parseOnly ?\n\
    soFar.length :\n\
    soFar ?\n\
      Sizzle.error( selector ) :\n\
      // Cache the tokens\n\
      tokenCache( selector, groups ).slice( 0 );\n\
};\n\
\n\
function toSelector( tokens ) {\n\
  var i = 0,\n\
    len = tokens.length,\n\
    selector = \"\";\n\
  for ( ; i < len; i++ ) {\n\
    selector += tokens[i].value;\n\
  }\n\
  return selector;\n\
}\n\
\n\
function addCombinator( matcher, combinator, base ) {\n\
  var dir = combinator.dir,\n\
    checkNonElements = base && dir === \"parentNode\",\n\
    doneName = done++;\n\
\n\
  return combinator.first ?\n\
    // Check against closest ancestor/preceding element\n\
    function( elem, context, xml ) {\n\
      while ( (elem = elem[ dir ]) ) {\n\
        if ( elem.nodeType === 1 || checkNonElements ) {\n\
          return matcher( elem, context, xml );\n\
        }\n\
      }\n\
    } :\n\
\n\
    // Check against all ancestor/preceding elements\n\
    function( elem, context, xml ) {\n\
      var oldCache, outerCache,\n\
        newCache = [ dirruns, doneName ];\n\
\n\
      // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching\n\
      if ( xml ) {\n\
        while ( (elem = elem[ dir ]) ) {\n\
          if ( elem.nodeType === 1 || checkNonElements ) {\n\
            if ( matcher( elem, context, xml ) ) {\n\
              return true;\n\
            }\n\
          }\n\
        }\n\
      } else {\n\
        while ( (elem = elem[ dir ]) ) {\n\
          if ( elem.nodeType === 1 || checkNonElements ) {\n\
            outerCache = elem[ expando ] || (elem[ expando ] = {});\n\
            if ( (oldCache = outerCache[ dir ]) &&\n\
              oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {\n\
\n\
              // Assign to newCache so results back-propagate to previous elements\n\
              return (newCache[ 2 ] = oldCache[ 2 ]);\n\
            } else {\n\
              // Reuse newcache so results back-propagate to previous elements\n\
              outerCache[ dir ] = newCache;\n\
\n\
              // A match means we're done; a fail means we have to keep checking\n\
              if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {\n\
                return true;\n\
              }\n\
            }\n\
          }\n\
        }\n\
      }\n\
    };\n\
}\n\
\n\
function elementMatcher( matchers ) {\n\
  return matchers.length > 1 ?\n\
    function( elem, context, xml ) {\n\
      var i = matchers.length;\n\
      while ( i-- ) {\n\
        if ( !matchers[i]( elem, context, xml ) ) {\n\
          return false;\n\
        }\n\
      }\n\
      return true;\n\
    } :\n\
    matchers[0];\n\
}\n\
\n\
function multipleContexts( selector, contexts, results ) {\n\
  var i = 0,\n\
    len = contexts.length;\n\
  for ( ; i < len; i++ ) {\n\
    Sizzle( selector, contexts[i], results );\n\
  }\n\
  return results;\n\
}\n\
\n\
function condense( unmatched, map, filter, context, xml ) {\n\
  var elem,\n\
    newUnmatched = [],\n\
    i = 0,\n\
    len = unmatched.length,\n\
    mapped = map != null;\n\
\n\
  for ( ; i < len; i++ ) {\n\
    if ( (elem = unmatched[i]) ) {\n\
      if ( !filter || filter( elem, context, xml ) ) {\n\
        newUnmatched.push( elem );\n\
        if ( mapped ) {\n\
          map.push( i );\n\
        }\n\
      }\n\
    }\n\
  }\n\
\n\
  return newUnmatched;\n\
}\n\
\n\
function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {\n\
  if ( postFilter && !postFilter[ expando ] ) {\n\
    postFilter = setMatcher( postFilter );\n\
  }\n\
  if ( postFinder && !postFinder[ expando ] ) {\n\
    postFinder = setMatcher( postFinder, postSelector );\n\
  }\n\
  return markFunction(function( seed, results, context, xml ) {\n\
    var temp, i, elem,\n\
      preMap = [],\n\
      postMap = [],\n\
      preexisting = results.length,\n\
\n\
      // Get initial elements from seed or context\n\
      elems = seed || multipleContexts( selector || \"*\", context.nodeType ? [ context ] : context, [] ),\n\
\n\
      // Prefilter to get matcher input, preserving a map for seed-results synchronization\n\
      matcherIn = preFilter && ( seed || !selector ) ?\n\
        condense( elems, preMap, preFilter, context, xml ) :\n\
        elems,\n\
\n\
      matcherOut = matcher ?\n\
        // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,\n\
        postFinder || ( seed ? preFilter : preexisting || postFilter ) ?\n\
\n\
          // ...intermediate processing is necessary\n\
          [] :\n\
\n\
          // ...otherwise use results directly\n\
          results :\n\
        matcherIn;\n\
\n\
    // Find primary matches\n\
    if ( matcher ) {\n\
      matcher( matcherIn, matcherOut, context, xml );\n\
    }\n\
\n\
    // Apply postFilter\n\
    if ( postFilter ) {\n\
      temp = condense( matcherOut, postMap );\n\
      postFilter( temp, [], context, xml );\n\
\n\
      // Un-match failing elements by moving them back to matcherIn\n\
      i = temp.length;\n\
      while ( i-- ) {\n\
        if ( (elem = temp[i]) ) {\n\
          matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);\n\
        }\n\
      }\n\
    }\n\
\n\
    if ( seed ) {\n\
      if ( postFinder || preFilter ) {\n\
        if ( postFinder ) {\n\
          // Get the final matcherOut by condensing this intermediate into postFinder contexts\n\
          temp = [];\n\
          i = matcherOut.length;\n\
          while ( i-- ) {\n\
            if ( (elem = matcherOut[i]) ) {\n\
              // Restore matcherIn since elem is not yet a final match\n\
              temp.push( (matcherIn[i] = elem) );\n\
            }\n\
          }\n\
          postFinder( null, (matcherOut = []), temp, xml );\n\
        }\n\
\n\
        // Move matched elements from seed to results to keep them synchronized\n\
        i = matcherOut.length;\n\
        while ( i-- ) {\n\
          if ( (elem = matcherOut[i]) &&\n\
            (temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {\n\
\n\
            seed[temp] = !(results[temp] = elem);\n\
          }\n\
        }\n\
      }\n\
\n\
    // Add elements to results, through postFinder if defined\n\
    } else {\n\
      matcherOut = condense(\n\
        matcherOut === results ?\n\
          matcherOut.splice( preexisting, matcherOut.length ) :\n\
          matcherOut\n\
      );\n\
      if ( postFinder ) {\n\
        postFinder( null, results, matcherOut, xml );\n\
      } else {\n\
        push.apply( results, matcherOut );\n\
      }\n\
    }\n\
  });\n\
}\n\
\n\
function matcherFromTokens( tokens ) {\n\
  var checkContext, matcher, j,\n\
    len = tokens.length,\n\
    leadingRelative = Expr.relative[ tokens[0].type ],\n\
    implicitRelative = leadingRelative || Expr.relative[\" \"],\n\
    i = leadingRelative ? 1 : 0,\n\
\n\
    // The foundational matcher ensures that elements are reachable from top-level context(s)\n\
    matchContext = addCombinator( function( elem ) {\n\
      return elem === checkContext;\n\
    }, implicitRelative, true ),\n\
    matchAnyContext = addCombinator( function( elem ) {\n\
      return indexOf.call( checkContext, elem ) > -1;\n\
    }, implicitRelative, true ),\n\
    matchers = [ function( elem, context, xml ) {\n\
      return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (\n\
        (checkContext = context).nodeType ?\n\
          matchContext( elem, context, xml ) :\n\
          matchAnyContext( elem, context, xml ) );\n\
    } ];\n\
\n\
  for ( ; i < len; i++ ) {\n\
    if ( (matcher = Expr.relative[ tokens[i].type ]) ) {\n\
      matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];\n\
    } else {\n\
      matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );\n\
\n\
      // Return special upon seeing a positional matcher\n\
      if ( matcher[ expando ] ) {\n\
        // Find the next relative operator (if any) for proper handling\n\
        j = ++i;\n\
        for ( ; j < len; j++ ) {\n\
          if ( Expr.relative[ tokens[j].type ] ) {\n\
            break;\n\
          }\n\
        }\n\
        return setMatcher(\n\
          i > 1 && elementMatcher( matchers ),\n\
          i > 1 && toSelector(\n\
            // If the preceding token was a descendant combinator, insert an implicit any-element `*`\n\
            tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === \" \" ? \"*\" : \"\" })\n\
          ).replace( rtrim, \"$1\" ),\n\
          matcher,\n\
          i < j && matcherFromTokens( tokens.slice( i, j ) ),\n\
          j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),\n\
          j < len && toSelector( tokens )\n\
        );\n\
      }\n\
      matchers.push( matcher );\n\
    }\n\
  }\n\
\n\
  return elementMatcher( matchers );\n\
}\n\
\n\
function matcherFromGroupMatchers( elementMatchers, setMatchers ) {\n\
  var bySet = setMatchers.length > 0,\n\
    byElement = elementMatchers.length > 0,\n\
    superMatcher = function( seed, context, xml, results, outermost ) {\n\
      var elem, j, matcher,\n\
        matchedCount = 0,\n\
        i = \"0\",\n\
        unmatched = seed && [],\n\
        setMatched = [],\n\
        contextBackup = outermostContext,\n\
        // We must always have either seed elements or outermost context\n\
        elems = seed || byElement && Expr.find[\"TAG\"]( \"*\", outermost ),\n\
        // Use integer dirruns iff this is the outermost matcher\n\
        dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),\n\
        len = elems.length;\n\
\n\
      if ( outermost ) {\n\
        outermostContext = context !== document && context;\n\
      }\n\
\n\
      // Add elements passing elementMatchers directly to results\n\
      // Keep `i` a string if there are no elements so `matchedCount` will be \"00\" below\n\
      // Support: IE<9, Safari\n\
      // Tolerate NodeList properties (IE: \"length\"; Safari: <number>) matching elements by id\n\
      for ( ; i !== len && (elem = elems[i]) != null; i++ ) {\n\
        if ( byElement && elem ) {\n\
          j = 0;\n\
          while ( (matcher = elementMatchers[j++]) ) {\n\
            if ( matcher( elem, context, xml ) ) {\n\
              results.push( elem );\n\
              break;\n\
            }\n\
          }\n\
          if ( outermost ) {\n\
            dirruns = dirrunsUnique;\n\
          }\n\
        }\n\
\n\
        // Track unmatched elements for set filters\n\
        if ( bySet ) {\n\
          // They will have gone through all possible matchers\n\
          if ( (elem = !matcher && elem) ) {\n\
            matchedCount--;\n\
          }\n\
\n\
          // Lengthen the array for every element, matched or not\n\
          if ( seed ) {\n\
            unmatched.push( elem );\n\
          }\n\
        }\n\
      }\n\
\n\
      // Apply set filters to unmatched elements\n\
      matchedCount += i;\n\
      if ( bySet && i !== matchedCount ) {\n\
        j = 0;\n\
        while ( (matcher = setMatchers[j++]) ) {\n\
          matcher( unmatched, setMatched, context, xml );\n\
        }\n\
\n\
        if ( seed ) {\n\
          // Reintegrate element matches to eliminate the need for sorting\n\
          if ( matchedCount > 0 ) {\n\
            while ( i-- ) {\n\
              if ( !(unmatched[i] || setMatched[i]) ) {\n\
                setMatched[i] = pop.call( results );\n\
              }\n\
            }\n\
          }\n\
\n\
          // Discard index placeholder values to get only actual matches\n\
          setMatched = condense( setMatched );\n\
        }\n\
\n\
        // Add matches to results\n\
        push.apply( results, setMatched );\n\
\n\
        // Seedless set matches succeeding multiple successful matchers stipulate sorting\n\
        if ( outermost && !seed && setMatched.length > 0 &&\n\
          ( matchedCount + setMatchers.length ) > 1 ) {\n\
\n\
          Sizzle.uniqueSort( results );\n\
        }\n\
      }\n\
\n\
      // Override manipulation of globals by nested matchers\n\
      if ( outermost ) {\n\
        dirruns = dirrunsUnique;\n\
        outermostContext = contextBackup;\n\
      }\n\
\n\
      return unmatched;\n\
    };\n\
\n\
  return bySet ?\n\
    markFunction( superMatcher ) :\n\
    superMatcher;\n\
}\n\
\n\
compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {\n\
  var i,\n\
    setMatchers = [],\n\
    elementMatchers = [],\n\
    cached = compilerCache[ selector + \" \" ];\n\
\n\
  if ( !cached ) {\n\
    // Generate a function of recursive functions that can be used to check each element\n\
    if ( !match ) {\n\
      match = tokenize( selector );\n\
    }\n\
    i = match.length;\n\
    while ( i-- ) {\n\
      cached = matcherFromTokens( match[i] );\n\
      if ( cached[ expando ] ) {\n\
        setMatchers.push( cached );\n\
      } else {\n\
        elementMatchers.push( cached );\n\
      }\n\
    }\n\
\n\
    // Cache the compiled function\n\
    cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );\n\
\n\
    // Save selector and tokenization\n\
    cached.selector = selector;\n\
  }\n\
  return cached;\n\
};\n\
\n\
/**\n\
 * A low-level selection function that works with Sizzle's compiled\n\
 *  selector functions\n\
 * @param {String|Function} selector A selector or a pre-compiled\n\
 *  selector function built with Sizzle.compile\n\
 * @param {Element} context\n\
 * @param {Array} [results]\n\
 * @param {Array} [seed] A set of elements to match against\n\
 */\n\
select = Sizzle.select = function( selector, context, results, seed ) {\n\
  var i, tokens, token, type, find,\n\
    compiled = typeof selector === \"function\" && selector,\n\
    match = !seed && tokenize( (selector = compiled.selector || selector) );\n\
\n\
  results = results || [];\n\
\n\
  // Try to minimize operations if there is no seed and only one group\n\
  if ( match.length === 1 ) {\n\
\n\
    // Take a shortcut and set the context if the root selector is an ID\n\
    tokens = match[0] = match[0].slice( 0 );\n\
    if ( tokens.length > 2 && (token = tokens[0]).type === \"ID\" &&\n\
        support.getById && context.nodeType === 9 && documentIsHTML &&\n\
        Expr.relative[ tokens[1].type ] ) {\n\
\n\
      context = ( Expr.find[\"ID\"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];\n\
      if ( !context ) {\n\
        return results;\n\
\n\
      // Precompiled matchers will still verify ancestry, so step up a level\n\
      } else if ( compiled ) {\n\
        context = context.parentNode;\n\
      }\n\
\n\
      selector = selector.slice( tokens.shift().value.length );\n\
    }\n\
\n\
    // Fetch a seed set for right-to-left matching\n\
    i = matchExpr[\"needsContext\"].test( selector ) ? 0 : tokens.length;\n\
    while ( i-- ) {\n\
      token = tokens[i];\n\
\n\
      // Abort if we hit a combinator\n\
      if ( Expr.relative[ (type = token.type) ] ) {\n\
        break;\n\
      }\n\
      if ( (find = Expr.find[ type ]) ) {\n\
        // Search, expanding context for leading sibling combinators\n\
        if ( (seed = find(\n\
          token.matches[0].replace( runescape, funescape ),\n\
          rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context\n\
        )) ) {\n\
\n\
          // If seed is empty or no tokens remain, we can return early\n\
          tokens.splice( i, 1 );\n\
          selector = seed.length && toSelector( tokens );\n\
          if ( !selector ) {\n\
            push.apply( results, seed );\n\
            return results;\n\
          }\n\
\n\
          break;\n\
        }\n\
      }\n\
    }\n\
  }\n\
\n\
  // Compile and execute a filtering function if one is not provided\n\
  // Provide `match` to avoid retokenization if we modified the selector above\n\
  ( compiled || compile( selector, match ) )(\n\
    seed,\n\
    context,\n\
    !documentIsHTML,\n\
    results,\n\
    rsibling.test( selector ) && testContext( context.parentNode ) || context\n\
  );\n\
  return results;\n\
};\n\
\n\
// One-time assignments\n\
\n\
// Sort stability\n\
support.sortStable = expando.split(\"\").sort( sortOrder ).join(\"\") === expando;\n\
\n\
// Support: Chrome<14\n\
// Always assume duplicates if they aren't passed to the comparison function\n\
support.detectDuplicates = !!hasDuplicate;\n\
\n\
// Initialize against the default document\n\
setDocument();\n\
\n\
// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)\n\
// Detached nodes confoundingly follow *each other*\n\
support.sortDetached = assert(function( div1 ) {\n\
  // Should return 1, but returns 4 (following)\n\
  return div1.compareDocumentPosition( document.createElement(\"div\") ) & 1;\n\
});\n\
\n\
// Support: IE<8\n\
// Prevent attribute/property \"interpolation\"\n\
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx\n\
if ( !assert(function( div ) {\n\
  div.innerHTML = \"<a href='#'></a>\";\n\
  return div.firstChild.getAttribute(\"href\") === \"#\" ;\n\
}) ) {\n\
  addHandle( \"type|href|height|width\", function( elem, name, isXML ) {\n\
    if ( !isXML ) {\n\
      return elem.getAttribute( name, name.toLowerCase() === \"type\" ? 1 : 2 );\n\
    }\n\
  });\n\
}\n\
\n\
// Support: IE<9\n\
// Use defaultValue in place of getAttribute(\"value\")\n\
if ( !support.attributes || !assert(function( div ) {\n\
  div.innerHTML = \"<input/>\";\n\
  div.firstChild.setAttribute( \"value\", \"\" );\n\
  return div.firstChild.getAttribute( \"value\" ) === \"\";\n\
}) ) {\n\
  addHandle( \"value\", function( elem, name, isXML ) {\n\
    if ( !isXML && elem.nodeName.toLowerCase() === \"input\" ) {\n\
      return elem.defaultValue;\n\
    }\n\
  });\n\
}\n\
\n\
// Support: IE<9\n\
// Use getAttributeNode to fetch booleans when getAttribute lies\n\
if ( !assert(function( div ) {\n\
  return div.getAttribute(\"disabled\") == null;\n\
}) ) {\n\
  addHandle( booleans, function( elem, name, isXML ) {\n\
    var val;\n\
    if ( !isXML ) {\n\
      return elem[ name ] === true ? name.toLowerCase() :\n\
          (val = elem.getAttributeNode( name )) && val.specified ?\n\
          val.value :\n\
        null;\n\
    }\n\
  });\n\
}\n\
\n\
return Sizzle;\n\
\n\
})( window );\n\
\n\
\n\
\n\
jQuery.find = Sizzle;\n\
jQuery.expr = Sizzle.selectors;\n\
jQuery.expr[\":\"] = jQuery.expr.pseudos;\n\
jQuery.unique = Sizzle.uniqueSort;\n\
jQuery.text = Sizzle.getText;\n\
jQuery.isXMLDoc = Sizzle.isXML;\n\
jQuery.contains = Sizzle.contains;\n\
\n\
\n\
\n\
var rneedsContext = jQuery.expr.match.needsContext;\n\
\n\
var rsingleTag = (/^<(\\w+)\\s*\\/?>(?:<\\/\\1>|)$/);\n\
\n\
\n\
\n\
var risSimple = /^.[^:#\\[\\.,]*$/;\n\
\n\
// Implement the identical functionality for filter and not\n\
function winnow( elements, qualifier, not ) {\n\
  if ( jQuery.isFunction( qualifier ) ) {\n\
    return jQuery.grep( elements, function( elem, i ) {\n\
      /* jshint -W018 */\n\
      return !!qualifier.call( elem, i, elem ) !== not;\n\
    });\n\
\n\
  }\n\
\n\
  if ( qualifier.nodeType ) {\n\
    return jQuery.grep( elements, function( elem ) {\n\
      return ( elem === qualifier ) !== not;\n\
    });\n\
\n\
  }\n\
\n\
  if ( typeof qualifier === \"string\" ) {\n\
    if ( risSimple.test( qualifier ) ) {\n\
      return jQuery.filter( qualifier, elements, not );\n\
    }\n\
\n\
    qualifier = jQuery.filter( qualifier, elements );\n\
  }\n\
\n\
  return jQuery.grep( elements, function( elem ) {\n\
    return ( jQuery.inArray( elem, qualifier ) >= 0 ) !== not;\n\
  });\n\
}\n\
\n\
jQuery.filter = function( expr, elems, not ) {\n\
  var elem = elems[ 0 ];\n\
\n\
  if ( not ) {\n\
    expr = \":not(\" + expr + \")\";\n\
  }\n\
\n\
  return elems.length === 1 && elem.nodeType === 1 ?\n\
    jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :\n\
    jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {\n\
      return elem.nodeType === 1;\n\
    }));\n\
};\n\
\n\
jQuery.fn.extend({\n\
  find: function( selector ) {\n\
    var i,\n\
      ret = [],\n\
      self = this,\n\
      len = self.length;\n\
\n\
    if ( typeof selector !== \"string\" ) {\n\
      return this.pushStack( jQuery( selector ).filter(function() {\n\
        for ( i = 0; i < len; i++ ) {\n\
          if ( jQuery.contains( self[ i ], this ) ) {\n\
            return true;\n\
          }\n\
        }\n\
      }) );\n\
    }\n\
\n\
    for ( i = 0; i < len; i++ ) {\n\
      jQuery.find( selector, self[ i ], ret );\n\
    }\n\
\n\
    // Needed because $( selector, context ) becomes $( context ).find( selector )\n\
    ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );\n\
    ret.selector = this.selector ? this.selector + \" \" + selector : selector;\n\
    return ret;\n\
  },\n\
  filter: function( selector ) {\n\
    return this.pushStack( winnow(this, selector || [], false) );\n\
  },\n\
  not: function( selector ) {\n\
    return this.pushStack( winnow(this, selector || [], true) );\n\
  },\n\
  is: function( selector ) {\n\
    return !!winnow(\n\
      this,\n\
\n\
      // If this is a positional/relative selector, check membership in the returned set\n\
      // so $(\"p:first\").is(\"p:last\") won't return true for a doc with two \"p\".\n\
      typeof selector === \"string\" && rneedsContext.test( selector ) ?\n\
        jQuery( selector ) :\n\
        selector || [],\n\
      false\n\
    ).length;\n\
  }\n\
});\n\
\n\
\n\
// Initialize a jQuery object\n\
\n\
\n\
// A central reference to the root jQuery(document)\n\
var rootjQuery,\n\
\n\
  // Use the correct document accordingly with window argument (sandbox)\n\
  document = window.document,\n\
\n\
  // A simple way to check for HTML strings\n\
  // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)\n\
  // Strict HTML recognition (#11290: must start with <)\n\
  rquickExpr = /^(?:\\s*(<[\\w\\W]+>)[^>]*|#([\\w-]*))$/,\n\
\n\
  init = jQuery.fn.init = function( selector, context ) {\n\
    var match, elem;\n\
\n\
    // HANDLE: $(\"\"), $(null), $(undefined), $(false)\n\
    if ( !selector ) {\n\
      return this;\n\
    }\n\
\n\
    // Handle HTML strings\n\
    if ( typeof selector === \"string\" ) {\n\
      if ( selector.charAt(0) === \"<\" && selector.charAt( selector.length - 1 ) === \">\" && selector.length >= 3 ) {\n\
        // Assume that strings that start and end with <> are HTML and skip the regex check\n\
        match = [ null, selector, null ];\n\
\n\
      } else {\n\
        match = rquickExpr.exec( selector );\n\
      }\n\
\n\
      // Match html or make sure no context is specified for #id\n\
      if ( match && (match[1] || !context) ) {\n\
\n\
        // HANDLE: $(html) -> $(array)\n\
        if ( match[1] ) {\n\
          context = context instanceof jQuery ? context[0] : context;\n\
\n\
          // scripts is true for back-compat\n\
          // Intentionally let the error be thrown if parseHTML is not present\n\
          jQuery.merge( this, jQuery.parseHTML(\n\
            match[1],\n\
            context && context.nodeType ? context.ownerDocument || context : document,\n\
            true\n\
          ) );\n\
\n\
          // HANDLE: $(html, props)\n\
          if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {\n\
            for ( match in context ) {\n\
              // Properties of context are called as methods if possible\n\
              if ( jQuery.isFunction( this[ match ] ) ) {\n\
                this[ match ]( context[ match ] );\n\
\n\
              // ...and otherwise set as attributes\n\
              } else {\n\
                this.attr( match, context[ match ] );\n\
              }\n\
            }\n\
          }\n\
\n\
          return this;\n\
\n\
        // HANDLE: $(#id)\n\
        } else {\n\
          elem = document.getElementById( match[2] );\n\
\n\
          // Check parentNode to catch when Blackberry 4.6 returns\n\
          // nodes that are no longer in the document #6963\n\
          if ( elem && elem.parentNode ) {\n\
            // Handle the case where IE and Opera return items\n\
            // by name instead of ID\n\
            if ( elem.id !== match[2] ) {\n\
              return rootjQuery.find( selector );\n\
            }\n\
\n\
            // Otherwise, we inject the element directly into the jQuery object\n\
            this.length = 1;\n\
            this[0] = elem;\n\
          }\n\
\n\
          this.context = document;\n\
          this.selector = selector;\n\
          return this;\n\
        }\n\
\n\
      // HANDLE: $(expr, $(...))\n\
      } else if ( !context || context.jquery ) {\n\
        return ( context || rootjQuery ).find( selector );\n\
\n\
      // HANDLE: $(expr, context)\n\
      // (which is just equivalent to: $(context).find(expr)\n\
      } else {\n\
        return this.constructor( context ).find( selector );\n\
      }\n\
\n\
    // HANDLE: $(DOMElement)\n\
    } else if ( selector.nodeType ) {\n\
      this.context = this[0] = selector;\n\
      this.length = 1;\n\
      return this;\n\
\n\
    // HANDLE: $(function)\n\
    // Shortcut for document ready\n\
    } else if ( jQuery.isFunction( selector ) ) {\n\
      return typeof rootjQuery.ready !== \"undefined\" ?\n\
        rootjQuery.ready( selector ) :\n\
        // Execute immediately if ready is not present\n\
        selector( jQuery );\n\
    }\n\
\n\
    if ( selector.selector !== undefined ) {\n\
      this.selector = selector.selector;\n\
      this.context = selector.context;\n\
    }\n\
\n\
    return jQuery.makeArray( selector, this );\n\
  };\n\
\n\
// Give the init function the jQuery prototype for later instantiation\n\
init.prototype = jQuery.fn;\n\
\n\
// Initialize central reference\n\
rootjQuery = jQuery( document );\n\
\n\
\n\
var rparentsprev = /^(?:parents|prev(?:Until|All))/,\n\
  // methods guaranteed to produce a unique set when starting from a unique set\n\
  guaranteedUnique = {\n\
    children: true,\n\
    contents: true,\n\
    next: true,\n\
    prev: true\n\
  };\n\
\n\
jQuery.extend({\n\
  dir: function( elem, dir, until ) {\n\
    var matched = [],\n\
      cur = elem[ dir ];\n\
\n\
    while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {\n\
      if ( cur.nodeType === 1 ) {\n\
        matched.push( cur );\n\
      }\n\
      cur = cur[dir];\n\
    }\n\
    return matched;\n\
  },\n\
\n\
  sibling: function( n, elem ) {\n\
    var r = [];\n\
\n\
    for ( ; n; n = n.nextSibling ) {\n\
      if ( n.nodeType === 1 && n !== elem ) {\n\
        r.push( n );\n\
      }\n\
    }\n\
\n\
    return r;\n\
  }\n\
});\n\
\n\
jQuery.fn.extend({\n\
  has: function( target ) {\n\
    var i,\n\
      targets = jQuery( target, this ),\n\
      len = targets.length;\n\
\n\
    return this.filter(function() {\n\
      for ( i = 0; i < len; i++ ) {\n\
        if ( jQuery.contains( this, targets[i] ) ) {\n\
          return true;\n\
        }\n\
      }\n\
    });\n\
  },\n\
\n\
  closest: function( selectors, context ) {\n\
    var cur,\n\
      i = 0,\n\
      l = this.length,\n\
      matched = [],\n\
      pos = rneedsContext.test( selectors ) || typeof selectors !== \"string\" ?\n\
        jQuery( selectors, context || this.context ) :\n\
        0;\n\
\n\
    for ( ; i < l; i++ ) {\n\
      for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {\n\
        // Always skip document fragments\n\
        if ( cur.nodeType < 11 && (pos ?\n\
          pos.index(cur) > -1 :\n\
\n\
          // Don't pass non-elements to Sizzle\n\
          cur.nodeType === 1 &&\n\
            jQuery.find.matchesSelector(cur, selectors)) ) {\n\
\n\
          matched.push( cur );\n\
          break;\n\
        }\n\
      }\n\
    }\n\
\n\
    return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );\n\
  },\n\
\n\
  // Determine the position of an element within\n\
  // the matched set of elements\n\
  index: function( elem ) {\n\
\n\
    // No argument, return index in parent\n\
    if ( !elem ) {\n\
      return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;\n\
    }\n\
\n\
    // index in selector\n\
    if ( typeof elem === \"string\" ) {\n\
      return jQuery.inArray( this[0], jQuery( elem ) );\n\
    }\n\
\n\
    // Locate the position of the desired element\n\
    return jQuery.inArray(\n\
      // If it receives a jQuery object, the first element is used\n\
      elem.jquery ? elem[0] : elem, this );\n\
  },\n\
\n\
  add: function( selector, context ) {\n\
    return this.pushStack(\n\
      jQuery.unique(\n\
        jQuery.merge( this.get(), jQuery( selector, context ) )\n\
      )\n\
    );\n\
  },\n\
\n\
  addBack: function( selector ) {\n\
    return this.add( selector == null ?\n\
      this.prevObject : this.prevObject.filter(selector)\n\
    );\n\
  }\n\
});\n\
\n\
function sibling( cur, dir ) {\n\
  do {\n\
    cur = cur[ dir ];\n\
  } while ( cur && cur.nodeType !== 1 );\n\
\n\
  return cur;\n\
}\n\
\n\
jQuery.each({\n\
  parent: function( elem ) {\n\
    var parent = elem.parentNode;\n\
    return parent && parent.nodeType !== 11 ? parent : null;\n\
  },\n\
  parents: function( elem ) {\n\
    return jQuery.dir( elem, \"parentNode\" );\n\
  },\n\
  parentsUntil: function( elem, i, until ) {\n\
    return jQuery.dir( elem, \"parentNode\", until );\n\
  },\n\
  next: function( elem ) {\n\
    return sibling( elem, \"nextSibling\" );\n\
  },\n\
  prev: function( elem ) {\n\
    return sibling( elem, \"previousSibling\" );\n\
  },\n\
  nextAll: function( elem ) {\n\
    return jQuery.dir( elem, \"nextSibling\" );\n\
  },\n\
  prevAll: function( elem ) {\n\
    return jQuery.dir( elem, \"previousSibling\" );\n\
  },\n\
  nextUntil: function( elem, i, until ) {\n\
    return jQuery.dir( elem, \"nextSibling\", until );\n\
  },\n\
  prevUntil: function( elem, i, until ) {\n\
    return jQuery.dir( elem, \"previousSibling\", until );\n\
  },\n\
  siblings: function( elem ) {\n\
    return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );\n\
  },\n\
  children: function( elem ) {\n\
    return jQuery.sibling( elem.firstChild );\n\
  },\n\
  contents: function( elem ) {\n\
    return jQuery.nodeName( elem, \"iframe\" ) ?\n\
      elem.contentDocument || elem.contentWindow.document :\n\
      jQuery.merge( [], elem.childNodes );\n\
  }\n\
}, function( name, fn ) {\n\
  jQuery.fn[ name ] = function( until, selector ) {\n\
    var ret = jQuery.map( this, fn, until );\n\
\n\
    if ( name.slice( -5 ) !== \"Until\" ) {\n\
      selector = until;\n\
    }\n\
\n\
    if ( selector && typeof selector === \"string\" ) {\n\
      ret = jQuery.filter( selector, ret );\n\
    }\n\
\n\
    if ( this.length > 1 ) {\n\
      // Remove duplicates\n\
      if ( !guaranteedUnique[ name ] ) {\n\
        ret = jQuery.unique( ret );\n\
      }\n\
\n\
      // Reverse order for parents* and prev-derivatives\n\
      if ( rparentsprev.test( name ) ) {\n\
        ret = ret.reverse();\n\
      }\n\
    }\n\
\n\
    return this.pushStack( ret );\n\
  };\n\
});\n\
var rnotwhite = (/\\S+/g);\n\
\n\
\n\
\n\
// String to Object options format cache\n\
var optionsCache = {};\n\
\n\
// Convert String-formatted options into Object-formatted ones and store in cache\n\
function createOptions( options ) {\n\
  var object = optionsCache[ options ] = {};\n\
  jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {\n\
    object[ flag ] = true;\n\
  });\n\
  return object;\n\
}\n\
\n\
/*\n\
 * Create a callback list using the following parameters:\n\
 *\n\
 *  options: an optional list of space-separated options that will change how\n\
 *      the callback list behaves or a more traditional option object\n\
 *\n\
 * By default a callback list will act like an event callback list and can be\n\
 * \"fired\" multiple times.\n\
 *\n\
 * Possible options:\n\
 *\n\
 *  once:     will ensure the callback list can only be fired once (like a Deferred)\n\
 *\n\
 *  memory:     will keep track of previous values and will call any callback added\n\
 *          after the list has been fired right away with the latest \"memorized\"\n\
 *          values (like a Deferred)\n\
 *\n\
 *  unique:     will ensure a callback can only be added once (no duplicate in the list)\n\
 *\n\
 *  stopOnFalse:  interrupt callings when a callback returns false\n\
 *\n\
 */\n\
jQuery.Callbacks = function( options ) {\n\
\n\
  // Convert options from String-formatted to Object-formatted if needed\n\
  // (we check in cache first)\n\
  options = typeof options === \"string\" ?\n\
    ( optionsCache[ options ] || createOptions( options ) ) :\n\
    jQuery.extend( {}, options );\n\
\n\
  var // Flag to know if list is currently firing\n\
    firing,\n\
    // Last fire value (for non-forgettable lists)\n\
    memory,\n\
    // Flag to know if list was already fired\n\
    fired,\n\
    // End of the loop when firing\n\
    firingLength,\n\
    // Index of currently firing callback (modified by remove if needed)\n\
    firingIndex,\n\
    // First callback to fire (used internally by add and fireWith)\n\
    firingStart,\n\
    // Actual callback list\n\
    list = [],\n\
    // Stack of fire calls for repeatable lists\n\
    stack = !options.once && [],\n\
    // Fire callbacks\n\
    fire = function( data ) {\n\
      memory = options.memory && data;\n\
      fired = true;\n\
      firingIndex = firingStart || 0;\n\
      firingStart = 0;\n\
      firingLength = list.length;\n\
      firing = true;\n\
      for ( ; list && firingIndex < firingLength; firingIndex++ ) {\n\
        if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {\n\
          memory = false; // To prevent further calls using add\n\
          break;\n\
        }\n\
      }\n\
      firing = false;\n\
      if ( list ) {\n\
        if ( stack ) {\n\
          if ( stack.length ) {\n\
            fire( stack.shift() );\n\
          }\n\
        } else if ( memory ) {\n\
          list = [];\n\
        } else {\n\
          self.disable();\n\
        }\n\
      }\n\
    },\n\
    // Actual Callbacks object\n\
    self = {\n\
      // Add a callback or a collection of callbacks to the list\n\
      add: function() {\n\
        if ( list ) {\n\
          // First, we save the current length\n\
          var start = list.length;\n\
          (function add( args ) {\n\
            jQuery.each( args, function( _, arg ) {\n\
              var type = jQuery.type( arg );\n\
              if ( type === \"function\" ) {\n\
                if ( !options.unique || !self.has( arg ) ) {\n\
                  list.push( arg );\n\
                }\n\
              } else if ( arg && arg.length && type !== \"string\" ) {\n\
                // Inspect recursively\n\
                add( arg );\n\
              }\n\
            });\n\
          })( arguments );\n\
          // Do we need to add the callbacks to the\n\
          // current firing batch?\n\
          if ( firing ) {\n\
            firingLength = list.length;\n\
          // With memory, if we're not firing then\n\
          // we should call right away\n\
          } else if ( memory ) {\n\
            firingStart = start;\n\
            fire( memory );\n\
          }\n\
        }\n\
        return this;\n\
      },\n\
      // Remove a callback from the list\n\
      remove: function() {\n\
        if ( list ) {\n\
          jQuery.each( arguments, function( _, arg ) {\n\
            var index;\n\
            while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {\n\
              list.splice( index, 1 );\n\
              // Handle firing indexes\n\
              if ( firing ) {\n\
                if ( index <= firingLength ) {\n\
                  firingLength--;\n\
                }\n\
                if ( index <= firingIndex ) {\n\
                  firingIndex--;\n\
                }\n\
              }\n\
            }\n\
          });\n\
        }\n\
        return this;\n\
      },\n\
      // Check if a given callback is in the list.\n\
      // If no argument is given, return whether or not list has callbacks attached.\n\
      has: function( fn ) {\n\
        return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );\n\
      },\n\
      // Remove all callbacks from the list\n\
      empty: function() {\n\
        list = [];\n\
        firingLength = 0;\n\
        return this;\n\
      },\n\
      // Have the list do nothing anymore\n\
      disable: function() {\n\
        list = stack = memory = undefined;\n\
        return this;\n\
      },\n\
      // Is it disabled?\n\
      disabled: function() {\n\
        return !list;\n\
      },\n\
      // Lock the list in its current state\n\
      lock: function() {\n\
        stack = undefined;\n\
        if ( !memory ) {\n\
          self.disable();\n\
        }\n\
        return this;\n\
      },\n\
      // Is it locked?\n\
      locked: function() {\n\
        return !stack;\n\
      },\n\
      // Call all callbacks with the given context and arguments\n\
      fireWith: function( context, args ) {\n\
        if ( list && ( !fired || stack ) ) {\n\
          args = args || [];\n\
          args = [ context, args.slice ? args.slice() : args ];\n\
          if ( firing ) {\n\
            stack.push( args );\n\
          } else {\n\
            fire( args );\n\
          }\n\
        }\n\
        return this;\n\
      },\n\
      // Call all the callbacks with the given arguments\n\
      fire: function() {\n\
        self.fireWith( this, arguments );\n\
        return this;\n\
      },\n\
      // To know if the callbacks have already been called at least once\n\
      fired: function() {\n\
        return !!fired;\n\
      }\n\
    };\n\
\n\
  return self;\n\
};\n\
\n\
\n\
jQuery.extend({\n\
\n\
  Deferred: function( func ) {\n\
    var tuples = [\n\
        // action, add listener, listener list, final state\n\
        [ \"resolve\", \"done\", jQuery.Callbacks(\"once memory\"), \"resolved\" ],\n\
        [ \"reject\", \"fail\", jQuery.Callbacks(\"once memory\"), \"rejected\" ],\n\
        [ \"notify\", \"progress\", jQuery.Callbacks(\"memory\") ]\n\
      ],\n\
      state = \"pending\",\n\
      promise = {\n\
        state: function() {\n\
          return state;\n\
        },\n\
        always: function() {\n\
          deferred.done( arguments ).fail( arguments );\n\
          return this;\n\
        },\n\
        then: function( /* fnDone, fnFail, fnProgress */ ) {\n\
          var fns = arguments;\n\
          return jQuery.Deferred(function( newDefer ) {\n\
            jQuery.each( tuples, function( i, tuple ) {\n\
              var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];\n\
              // deferred[ done | fail | progress ] for forwarding actions to newDefer\n\
              deferred[ tuple[1] ](function() {\n\
                var returned = fn && fn.apply( this, arguments );\n\
                if ( returned && jQuery.isFunction( returned.promise ) ) {\n\
                  returned.promise()\n\
                    .done( newDefer.resolve )\n\
                    .fail( newDefer.reject )\n\
                    .progress( newDefer.notify );\n\
                } else {\n\
                  newDefer[ tuple[ 0 ] + \"With\" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );\n\
                }\n\
              });\n\
            });\n\
            fns = null;\n\
          }).promise();\n\
        },\n\
        // Get a promise for this deferred\n\
        // If obj is provided, the promise aspect is added to the object\n\
        promise: function( obj ) {\n\
          return obj != null ? jQuery.extend( obj, promise ) : promise;\n\
        }\n\
      },\n\
      deferred = {};\n\
\n\
    // Keep pipe for back-compat\n\
    promise.pipe = promise.then;\n\
\n\
    // Add list-specific methods\n\
    jQuery.each( tuples, function( i, tuple ) {\n\
      var list = tuple[ 2 ],\n\
        stateString = tuple[ 3 ];\n\
\n\
      // promise[ done | fail | progress ] = list.add\n\
      promise[ tuple[1] ] = list.add;\n\
\n\
      // Handle state\n\
      if ( stateString ) {\n\
        list.add(function() {\n\
          // state = [ resolved | rejected ]\n\
          state = stateString;\n\
\n\
        // [ reject_list | resolve_list ].disable; progress_list.lock\n\
        }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );\n\
      }\n\
\n\
      // deferred[ resolve | reject | notify ]\n\
      deferred[ tuple[0] ] = function() {\n\
        deferred[ tuple[0] + \"With\" ]( this === deferred ? promise : this, arguments );\n\
        return this;\n\
      };\n\
      deferred[ tuple[0] + \"With\" ] = list.fireWith;\n\
    });\n\
\n\
    // Make the deferred a promise\n\
    promise.promise( deferred );\n\
\n\
    // Call given func if any\n\
    if ( func ) {\n\
      func.call( deferred, deferred );\n\
    }\n\
\n\
    // All done!\n\
    return deferred;\n\
  },\n\
\n\
  // Deferred helper\n\
  when: function( subordinate /* , ..., subordinateN */ ) {\n\
    var i = 0,\n\
      resolveValues = slice.call( arguments ),\n\
      length = resolveValues.length,\n\
\n\
      // the count of uncompleted subordinates\n\
      remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,\n\
\n\
      // the master Deferred. If resolveValues consist of only a single Deferred, just use that.\n\
      deferred = remaining === 1 ? subordinate : jQuery.Deferred(),\n\
\n\
      // Update function for both resolve and progress values\n\
      updateFunc = function( i, contexts, values ) {\n\
        return function( value ) {\n\
          contexts[ i ] = this;\n\
          values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;\n\
          if ( values === progressValues ) {\n\
            deferred.notifyWith( contexts, values );\n\
\n\
          } else if ( !(--remaining) ) {\n\
            deferred.resolveWith( contexts, values );\n\
          }\n\
        };\n\
      },\n\
\n\
      progressValues, progressContexts, resolveContexts;\n\
\n\
    // add listeners to Deferred subordinates; treat others as resolved\n\
    if ( length > 1 ) {\n\
      progressValues = new Array( length );\n\
      progressContexts = new Array( length );\n\
      resolveContexts = new Array( length );\n\
      for ( ; i < length; i++ ) {\n\
        if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {\n\
          resolveValues[ i ].promise()\n\
            .done( updateFunc( i, resolveContexts, resolveValues ) )\n\
            .fail( deferred.reject )\n\
            .progress( updateFunc( i, progressContexts, progressValues ) );\n\
        } else {\n\
          --remaining;\n\
        }\n\
      }\n\
    }\n\
\n\
    // if we're not waiting on anything, resolve the master\n\
    if ( !remaining ) {\n\
      deferred.resolveWith( resolveContexts, resolveValues );\n\
    }\n\
\n\
    return deferred.promise();\n\
  }\n\
});\n\
\n\
\n\
// The deferred used on DOM ready\n\
var readyList;\n\
\n\
jQuery.fn.ready = function( fn ) {\n\
  // Add the callback\n\
  jQuery.ready.promise().done( fn );\n\
\n\
  return this;\n\
};\n\
\n\
jQuery.extend({\n\
  // Is the DOM ready to be used? Set to true once it occurs.\n\
  isReady: false,\n\
\n\
  // A counter to track how many items to wait for before\n\
  // the ready event fires. See #6781\n\
  readyWait: 1,\n\
\n\
  // Hold (or release) the ready event\n\
  holdReady: function( hold ) {\n\
    if ( hold ) {\n\
      jQuery.readyWait++;\n\
    } else {\n\
      jQuery.ready( true );\n\
    }\n\
  },\n\
\n\
  // Handle when the DOM is ready\n\
  ready: function( wait ) {\n\
\n\
    // Abort if there are pending holds or we're already ready\n\
    if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {\n\
      return;\n\
    }\n\
\n\
    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).\n\
    if ( !document.body ) {\n\
      return setTimeout( jQuery.ready );\n\
    }\n\
\n\
    // Remember that the DOM is ready\n\
    jQuery.isReady = true;\n\
\n\
    // If a normal DOM Ready event fired, decrement, and wait if need be\n\
    if ( wait !== true && --jQuery.readyWait > 0 ) {\n\
      return;\n\
    }\n\
\n\
    // If there are functions bound, to execute\n\
    readyList.resolveWith( document, [ jQuery ] );\n\
\n\
    // Trigger any bound ready events\n\
    if ( jQuery.fn.triggerHandler ) {\n\
      jQuery( document ).triggerHandler( \"ready\" );\n\
      jQuery( document ).off( \"ready\" );\n\
    }\n\
  }\n\
});\n\
\n\
/**\n\
 * Clean-up method for dom ready events\n\
 */\n\
function detach() {\n\
  if ( document.addEventListener ) {\n\
    document.removeEventListener( \"DOMContentLoaded\", completed, false );\n\
    window.removeEventListener( \"load\", completed, false );\n\
\n\
  } else {\n\
    document.detachEvent( \"onreadystatechange\", completed );\n\
    window.detachEvent( \"onload\", completed );\n\
  }\n\
}\n\
\n\
/**\n\
 * The ready event handler and self cleanup method\n\
 */\n\
function completed() {\n\
  // readyState === \"complete\" is good enough for us to call the dom ready in oldIE\n\
  if ( document.addEventListener || event.type === \"load\" || document.readyState === \"complete\" ) {\n\
    detach();\n\
    jQuery.ready();\n\
  }\n\
}\n\
\n\
jQuery.ready.promise = function( obj ) {\n\
  if ( !readyList ) {\n\
\n\
    readyList = jQuery.Deferred();\n\
\n\
    // Catch cases where $(document).ready() is called after the browser event has already occurred.\n\
    // we once tried to use readyState \"interactive\" here, but it caused issues like the one\n\
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15\n\
    if ( document.readyState === \"complete\" ) {\n\
      // Handle it asynchronously to allow scripts the opportunity to delay ready\n\
      setTimeout( jQuery.ready );\n\
\n\
    // Standards-based browsers support DOMContentLoaded\n\
    } else if ( document.addEventListener ) {\n\
      // Use the handy event callback\n\
      document.addEventListener( \"DOMContentLoaded\", completed, false );\n\
\n\
      // A fallback to window.onload, that will always work\n\
      window.addEventListener( \"load\", completed, false );\n\
\n\
    // If IE event model is used\n\
    } else {\n\
      // Ensure firing before onload, maybe late but safe also for iframes\n\
      document.attachEvent( \"onreadystatechange\", completed );\n\
\n\
      // A fallback to window.onload, that will always work\n\
      window.attachEvent( \"onload\", completed );\n\
\n\
      // If IE and not a frame\n\
      // continually check to see if the document is ready\n\
      var top = false;\n\
\n\
      try {\n\
        top = window.frameElement == null && document.documentElement;\n\
      } catch(e) {}\n\
\n\
      if ( top && top.doScroll ) {\n\
        (function doScrollCheck() {\n\
          if ( !jQuery.isReady ) {\n\
\n\
            try {\n\
              // Use the trick by Diego Perini\n\
              // http://javascript.nwbox.com/IEContentLoaded/\n\
              top.doScroll(\"left\");\n\
            } catch(e) {\n\
              return setTimeout( doScrollCheck, 50 );\n\
            }\n\
\n\
            // detach all dom ready events\n\
            detach();\n\
\n\
            // and execute any waiting functions\n\
            jQuery.ready();\n\
          }\n\
        })();\n\
      }\n\
    }\n\
  }\n\
  return readyList.promise( obj );\n\
};\n\
\n\
\n\
var strundefined = typeof undefined;\n\
\n\
\n\
\n\
// Support: IE<9\n\
// Iteration over object's inherited properties before its own\n\
var i;\n\
for ( i in jQuery( support ) ) {\n\
  break;\n\
}\n\
support.ownLast = i !== \"0\";\n\
\n\
// Note: most support tests are defined in their respective modules.\n\
// false until the test is run\n\
support.inlineBlockNeedsLayout = false;\n\
\n\
// Execute ASAP in case we need to set body.style.zoom\n\
jQuery(function() {\n\
  // Minified: var a,b,c,d\n\
  var val, div, body, container;\n\
\n\
  body = document.getElementsByTagName( \"body\" )[ 0 ];\n\
  if ( !body || !body.style ) {\n\
    // Return for frameset docs that don't have a body\n\
    return;\n\
  }\n\
\n\
  // Setup\n\
  div = document.createElement( \"div\" );\n\
  container = document.createElement( \"div\" );\n\
  container.style.cssText = \"position:absolute;border:0;width:0;height:0;top:0;left:-9999px\";\n\
  body.appendChild( container ).appendChild( div );\n\
\n\
  if ( typeof div.style.zoom !== strundefined ) {\n\
    // Support: IE<8\n\
    // Check if natively block-level elements act like inline-block\n\
    // elements when setting their display to 'inline' and giving\n\
    // them layout\n\
    div.style.cssText = \"display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1\";\n\
\n\
    support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;\n\
    if ( val ) {\n\
      // Prevent IE 6 from affecting layout for positioned elements #11048\n\
      // Prevent IE from shrinking the body in IE 7 mode #12869\n\
      // Support: IE<8\n\
      body.style.zoom = 1;\n\
    }\n\
  }\n\
\n\
  body.removeChild( container );\n\
});\n\
\n\
\n\
\n\
\n\
(function() {\n\
  var div = document.createElement( \"div\" );\n\
\n\
  // Execute the test only if not already executed in another module.\n\
  if (support.deleteExpando == null) {\n\
    // Support: IE<9\n\
    support.deleteExpando = true;\n\
    try {\n\
      delete div.test;\n\
    } catch( e ) {\n\
      support.deleteExpando = false;\n\
    }\n\
  }\n\
\n\
  // Null elements to avoid leaks in IE.\n\
  div = null;\n\
})();\n\
\n\
\n\
/**\n\
 * Determines whether an object can have data\n\
 */\n\
jQuery.acceptData = function( elem ) {\n\
  var noData = jQuery.noData[ (elem.nodeName + \" \").toLowerCase() ],\n\
    nodeType = +elem.nodeType || 1;\n\
\n\
  // Do not set data on non-element DOM nodes because it will not be cleared (#8335).\n\
  return nodeType !== 1 && nodeType !== 9 ?\n\
    false :\n\
\n\
    // Nodes accept data unless otherwise specified; rejection can be conditional\n\
    !noData || noData !== true && elem.getAttribute(\"classid\") === noData;\n\
};\n\
\n\
\n\
var rbrace = /^(?:\\{[\\w\\W]*\\}|\\[[\\w\\W]*\\])$/,\n\
  rmultiDash = /([A-Z])/g;\n\
\n\
function dataAttr( elem, key, data ) {\n\
  // If nothing was found internally, try to fetch any\n\
  // data from the HTML5 data-* attribute\n\
  if ( data === undefined && elem.nodeType === 1 ) {\n\
\n\
    var name = \"data-\" + key.replace( rmultiDash, \"-$1\" ).toLowerCase();\n\
\n\
    data = elem.getAttribute( name );\n\
\n\
    if ( typeof data === \"string\" ) {\n\
      try {\n\
        data = data === \"true\" ? true :\n\
          data === \"false\" ? false :\n\
          data === \"null\" ? null :\n\
          // Only convert to a number if it doesn't change the string\n\
          +data + \"\" === data ? +data :\n\
          rbrace.test( data ) ? jQuery.parseJSON( data ) :\n\
          data;\n\
      } catch( e ) {}\n\
\n\
      // Make sure we set the data so it isn't changed later\n\
      jQuery.data( elem, key, data );\n\
\n\
    } else {\n\
      data = undefined;\n\
    }\n\
  }\n\
\n\
  return data;\n\
}\n\
\n\
// checks a cache object for emptiness\n\
function isEmptyDataObject( obj ) {\n\
  var name;\n\
  for ( name in obj ) {\n\
\n\
    // if the public data object is empty, the private is still empty\n\
    if ( name === \"data\" && jQuery.isEmptyObject( obj[name] ) ) {\n\
      continue;\n\
    }\n\
    if ( name !== \"toJSON\" ) {\n\
      return false;\n\
    }\n\
  }\n\
\n\
  return true;\n\
}\n\
\n\
function internalData( elem, name, data, pvt /* Internal Use Only */ ) {\n\
  if ( !jQuery.acceptData( elem ) ) {\n\
    return;\n\
  }\n\
\n\
  var ret, thisCache,\n\
    internalKey = jQuery.expando,\n\
\n\
    // We have to handle DOM nodes and JS objects differently because IE6-7\n\
    // can't GC object references properly across the DOM-JS boundary\n\
    isNode = elem.nodeType,\n\
\n\
    // Only DOM nodes need the global jQuery cache; JS object data is\n\
    // attached directly to the object so GC can occur automatically\n\
    cache = isNode ? jQuery.cache : elem,\n\
\n\
    // Only defining an ID for JS objects if its cache already exists allows\n\
    // the code to shortcut on the same path as a DOM node with no cache\n\
    id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;\n\
\n\
  // Avoid doing any more work than we need to when trying to get data on an\n\
  // object that has no data at all\n\
  if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === \"string\" ) {\n\
    return;\n\
  }\n\
\n\
  if ( !id ) {\n\
    // Only DOM nodes need a new unique ID for each element since their data\n\
    // ends up in the global cache\n\
    if ( isNode ) {\n\
      id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;\n\
    } else {\n\
      id = internalKey;\n\
    }\n\
  }\n\
\n\
  if ( !cache[ id ] ) {\n\
    // Avoid exposing jQuery metadata on plain JS objects when the object\n\
    // is serialized using JSON.stringify\n\
    cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };\n\
  }\n\
\n\
  // An object can be passed to jQuery.data instead of a key/value pair; this gets\n\
  // shallow copied over onto the existing cache\n\
  if ( typeof name === \"object\" || typeof name === \"function\" ) {\n\
    if ( pvt ) {\n\
      cache[ id ] = jQuery.extend( cache[ id ], name );\n\
    } else {\n\
      cache[ id ].data = jQuery.extend( cache[ id ].data, name );\n\
    }\n\
  }\n\
\n\
  thisCache = cache[ id ];\n\
\n\
  // jQuery data() is stored in a separate object inside the object's internal data\n\
  // cache in order to avoid key collisions between internal data and user-defined\n\
  // data.\n\
  if ( !pvt ) {\n\
    if ( !thisCache.data ) {\n\
      thisCache.data = {};\n\
    }\n\
\n\
    thisCache = thisCache.data;\n\
  }\n\
\n\
  if ( data !== undefined ) {\n\
    thisCache[ jQuery.camelCase( name ) ] = data;\n\
  }\n\
\n\
  // Check for both converted-to-camel and non-converted data property names\n\
  // If a data property was specified\n\
  if ( typeof name === \"string\" ) {\n\
\n\
    // First Try to find as-is property data\n\
    ret = thisCache[ name ];\n\
\n\
    // Test for null|undefined property data\n\
    if ( ret == null ) {\n\
\n\
      // Try to find the camelCased property\n\
      ret = thisCache[ jQuery.camelCase( name ) ];\n\
    }\n\
  } else {\n\
    ret = thisCache;\n\
  }\n\
\n\
  return ret;\n\
}\n\
\n\
function internalRemoveData( elem, name, pvt ) {\n\
  if ( !jQuery.acceptData( elem ) ) {\n\
    return;\n\
  }\n\
\n\
  var thisCache, i,\n\
    isNode = elem.nodeType,\n\
\n\
    // See jQuery.data for more information\n\
    cache = isNode ? jQuery.cache : elem,\n\
    id = isNode ? elem[ jQuery.expando ] : jQuery.expando;\n\
\n\
  // If there is already no cache entry for this object, there is no\n\
  // purpose in continuing\n\
  if ( !cache[ id ] ) {\n\
    return;\n\
  }\n\
\n\
  if ( name ) {\n\
\n\
    thisCache = pvt ? cache[ id ] : cache[ id ].data;\n\
\n\
    if ( thisCache ) {\n\
\n\
      // Support array or space separated string names for data keys\n\
      if ( !jQuery.isArray( name ) ) {\n\
\n\
        // try the string as a key before any manipulation\n\
        if ( name in thisCache ) {\n\
          name = [ name ];\n\
        } else {\n\
\n\
          // split the camel cased version by spaces unless a key with the spaces exists\n\
          name = jQuery.camelCase( name );\n\
          if ( name in thisCache ) {\n\
            name = [ name ];\n\
          } else {\n\
            name = name.split(\" \");\n\
          }\n\
        }\n\
      } else {\n\
        // If \"name\" is an array of keys...\n\
        // When data is initially created, via (\"key\", \"val\") signature,\n\
        // keys will be converted to camelCase.\n\
        // Since there is no way to tell _how_ a key was added, remove\n\
        // both plain key and camelCase key. #12786\n\
        // This will only penalize the array argument path.\n\
        name = name.concat( jQuery.map( name, jQuery.camelCase ) );\n\
      }\n\
\n\
      i = name.length;\n\
      while ( i-- ) {\n\
        delete thisCache[ name[i] ];\n\
      }\n\
\n\
      // If there is no data left in the cache, we want to continue\n\
      // and let the cache object itself get destroyed\n\
      if ( pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache) ) {\n\
        return;\n\
      }\n\
    }\n\
  }\n\
\n\
  // See jQuery.data for more information\n\
  if ( !pvt ) {\n\
    delete cache[ id ].data;\n\
\n\
    // Don't destroy the parent cache unless the internal data object\n\
    // had been the only thing left in it\n\
    if ( !isEmptyDataObject( cache[ id ] ) ) {\n\
      return;\n\
    }\n\
  }\n\
\n\
  // Destroy the cache\n\
  if ( isNode ) {\n\
    jQuery.cleanData( [ elem ], true );\n\
\n\
  // Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)\n\
  /* jshint eqeqeq: false */\n\
  } else if ( support.deleteExpando || cache != cache.window ) {\n\
    /* jshint eqeqeq: true */\n\
    delete cache[ id ];\n\
\n\
  // When all else fails, null\n\
  } else {\n\
    cache[ id ] = null;\n\
  }\n\
}\n\
\n\
jQuery.extend({\n\
  cache: {},\n\
\n\
  // The following elements (space-suffixed to avoid Object.prototype collisions)\n\
  // throw uncatchable exceptions if you attempt to set expando properties\n\
  noData: {\n\
    \"applet \": true,\n\
    \"embed \": true,\n\
    // ...but Flash objects (which have this classid) *can* handle expandos\n\
    \"object \": \"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\"\n\
  },\n\
\n\
  hasData: function( elem ) {\n\
    elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];\n\
    return !!elem && !isEmptyDataObject( elem );\n\
  },\n\
\n\
  data: function( elem, name, data ) {\n\
    return internalData( elem, name, data );\n\
  },\n\
\n\
  removeData: function( elem, name ) {\n\
    return internalRemoveData( elem, name );\n\
  },\n\
\n\
  // For internal use only.\n\
  _data: function( elem, name, data ) {\n\
    return internalData( elem, name, data, true );\n\
  },\n\
\n\
  _removeData: function( elem, name ) {\n\
    return internalRemoveData( elem, name, true );\n\
  }\n\
});\n\
\n\
jQuery.fn.extend({\n\
  data: function( key, value ) {\n\
    var i, name, data,\n\
      elem = this[0],\n\
      attrs = elem && elem.attributes;\n\
\n\
    // Special expections of .data basically thwart jQuery.access,\n\
    // so implement the relevant behavior ourselves\n\
\n\
    // Gets all values\n\
    if ( key === undefined ) {\n\
      if ( this.length ) {\n\
        data = jQuery.data( elem );\n\
\n\
        if ( elem.nodeType === 1 && !jQuery._data( elem, \"parsedAttrs\" ) ) {\n\
          i = attrs.length;\n\
          while ( i-- ) {\n\
\n\
            // Support: IE11+\n\
            // The attrs elements can be null (#14894)\n\
            if ( attrs[ i ] ) {\n\
              name = attrs[ i ].name;\n\
              if ( name.indexOf( \"data-\" ) === 0 ) {\n\
                name = jQuery.camelCase( name.slice(5) );\n\
                dataAttr( elem, name, data[ name ] );\n\
              }\n\
            }\n\
          }\n\
          jQuery._data( elem, \"parsedAttrs\", true );\n\
        }\n\
      }\n\
\n\
      return data;\n\
    }\n\
\n\
    // Sets multiple values\n\
    if ( typeof key === \"object\" ) {\n\
      return this.each(function() {\n\
        jQuery.data( this, key );\n\
      });\n\
    }\n\
\n\
    return arguments.length > 1 ?\n\
\n\
      // Sets one value\n\
      this.each(function() {\n\
        jQuery.data( this, key, value );\n\
      }) :\n\
\n\
      // Gets one value\n\
      // Try to fetch any internally stored data first\n\
      elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;\n\
  },\n\
\n\
  removeData: function( key ) {\n\
    return this.each(function() {\n\
      jQuery.removeData( this, key );\n\
    });\n\
  }\n\
});\n\
\n\
\n\
jQuery.extend({\n\
  queue: function( elem, type, data ) {\n\
    var queue;\n\
\n\
    if ( elem ) {\n\
      type = ( type || \"fx\" ) + \"queue\";\n\
      queue = jQuery._data( elem, type );\n\
\n\
      // Speed up dequeue by getting out quickly if this is just a lookup\n\
      if ( data ) {\n\
        if ( !queue || jQuery.isArray(data) ) {\n\
          queue = jQuery._data( elem, type, jQuery.makeArray(data) );\n\
        } else {\n\
          queue.push( data );\n\
        }\n\
      }\n\
      return queue || [];\n\
    }\n\
  },\n\
\n\
  dequeue: function( elem, type ) {\n\
    type = type || \"fx\";\n\
\n\
    var queue = jQuery.queue( elem, type ),\n\
      startLength = queue.length,\n\
      fn = queue.shift(),\n\
      hooks = jQuery._queueHooks( elem, type ),\n\
      next = function() {\n\
        jQuery.dequeue( elem, type );\n\
      };\n\
\n\
    // If the fx queue is dequeued, always remove the progress sentinel\n\
    if ( fn === \"inprogress\" ) {\n\
      fn = queue.shift();\n\
      startLength--;\n\
    }\n\
\n\
    if ( fn ) {\n\
\n\
      // Add a progress sentinel to prevent the fx queue from being\n\
      // automatically dequeued\n\
      if ( type === \"fx\" ) {\n\
        queue.unshift( \"inprogress\" );\n\
      }\n\
\n\
      // clear up the last queue stop function\n\
      delete hooks.stop;\n\
      fn.call( elem, next, hooks );\n\
    }\n\
\n\
    if ( !startLength && hooks ) {\n\
      hooks.empty.fire();\n\
    }\n\
  },\n\
\n\
  // not intended for public consumption - generates a queueHooks object, or returns the current one\n\
  _queueHooks: function( elem, type ) {\n\
    var key = type + \"queueHooks\";\n\
    return jQuery._data( elem, key ) || jQuery._data( elem, key, {\n\
      empty: jQuery.Callbacks(\"once memory\").add(function() {\n\
        jQuery._removeData( elem, type + \"queue\" );\n\
        jQuery._removeData( elem, key );\n\
      })\n\
    });\n\
  }\n\
});\n\
\n\
jQuery.fn.extend({\n\
  queue: function( type, data ) {\n\
    var setter = 2;\n\
\n\
    if ( typeof type !== \"string\" ) {\n\
      data = type;\n\
      type = \"fx\";\n\
      setter--;\n\
    }\n\
\n\
    if ( arguments.length < setter ) {\n\
      return jQuery.queue( this[0], type );\n\
    }\n\
\n\
    return data === undefined ?\n\
      this :\n\
      this.each(function() {\n\
        var queue = jQuery.queue( this, type, data );\n\
\n\
        // ensure a hooks for this queue\n\
        jQuery._queueHooks( this, type );\n\
\n\
        if ( type === \"fx\" && queue[0] !== \"inprogress\" ) {\n\
          jQuery.dequeue( this, type );\n\
        }\n\
      });\n\
  },\n\
  dequeue: function( type ) {\n\
    return this.each(function() {\n\
      jQuery.dequeue( this, type );\n\
    });\n\
  },\n\
  clearQueue: function( type ) {\n\
    return this.queue( type || \"fx\", [] );\n\
  },\n\
  // Get a promise resolved when queues of a certain type\n\
  // are emptied (fx is the type by default)\n\
  promise: function( type, obj ) {\n\
    var tmp,\n\
      count = 1,\n\
      defer = jQuery.Deferred(),\n\
      elements = this,\n\
      i = this.length,\n\
      resolve = function() {\n\
        if ( !( --count ) ) {\n\
          defer.resolveWith( elements, [ elements ] );\n\
        }\n\
      };\n\
\n\
    if ( typeof type !== \"string\" ) {\n\
      obj = type;\n\
      type = undefined;\n\
    }\n\
    type = type || \"fx\";\n\
\n\
    while ( i-- ) {\n\
      tmp = jQuery._data( elements[ i ], type + \"queueHooks\" );\n\
      if ( tmp && tmp.empty ) {\n\
        count++;\n\
        tmp.empty.add( resolve );\n\
      }\n\
    }\n\
    resolve();\n\
    return defer.promise( obj );\n\
  }\n\
});\n\
var pnum = (/[+-]?(?:\\d*\\.|)\\d+(?:[eE][+-]?\\d+|)/).source;\n\
\n\
var cssExpand = [ \"Top\", \"Right\", \"Bottom\", \"Left\" ];\n\
\n\
var isHidden = function( elem, el ) {\n\
    // isHidden might be called from jQuery#filter function;\n\
    // in that case, element will be second argument\n\
    elem = el || elem;\n\
    return jQuery.css( elem, \"display\" ) === \"none\" || !jQuery.contains( elem.ownerDocument, elem );\n\
  };\n\
\n\
\n\
\n\
// Multifunctional method to get and set values of a collection\n\
// The value/s can optionally be executed if it's a function\n\
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {\n\
  var i = 0,\n\
    length = elems.length,\n\
    bulk = key == null;\n\
\n\
  // Sets many values\n\
  if ( jQuery.type( key ) === \"object\" ) {\n\
    chainable = true;\n\
    for ( i in key ) {\n\
      jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );\n\
    }\n\
\n\
  // Sets one value\n\
  } else if ( value !== undefined ) {\n\
    chainable = true;\n\
\n\
    if ( !jQuery.isFunction( value ) ) {\n\
      raw = true;\n\
    }\n\
\n\
    if ( bulk ) {\n\
      // Bulk operations run against the entire set\n\
      if ( raw ) {\n\
        fn.call( elems, value );\n\
        fn = null;\n\
\n\
      // ...except when executing function values\n\
      } else {\n\
        bulk = fn;\n\
        fn = function( elem, key, value ) {\n\
          return bulk.call( jQuery( elem ), value );\n\
        };\n\
      }\n\
    }\n\
\n\
    if ( fn ) {\n\
      for ( ; i < length; i++ ) {\n\
        fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );\n\
      }\n\
    }\n\
  }\n\
\n\
  return chainable ?\n\
    elems :\n\
\n\
    // Gets\n\
    bulk ?\n\
      fn.call( elems ) :\n\
      length ? fn( elems[0], key ) : emptyGet;\n\
};\n\
var rcheckableType = (/^(?:checkbox|radio)$/i);\n\
\n\
\n\
\n\
(function() {\n\
  // Minified: var a,b,c\n\
  var input = document.createElement( \"input\" ),\n\
    div = document.createElement( \"div\" ),\n\
    fragment = document.createDocumentFragment();\n\
\n\
  // Setup\n\
  div.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\
\n\
  // IE strips leading whitespace when .innerHTML is used\n\
  support.leadingWhitespace = div.firstChild.nodeType === 3;\n\
\n\
  // Make sure that tbody elements aren't automatically inserted\n\
  // IE will insert them into empty tables\n\
  support.tbody = !div.getElementsByTagName( \"tbody\" ).length;\n\
\n\
  // Make sure that link elements get serialized correctly by innerHTML\n\
  // This requires a wrapper element in IE\n\
  support.htmlSerialize = !!div.getElementsByTagName( \"link\" ).length;\n\
\n\
  // Makes sure cloning an html5 element does not cause problems\n\
  // Where outerHTML is undefined, this still works\n\
  support.html5Clone =\n\
    document.createElement( \"nav\" ).cloneNode( true ).outerHTML !== \"<:nav></:nav>\";\n\
\n\
  // Check if a disconnected checkbox will retain its checked\n\
  // value of true after appended to the DOM (IE6/7)\n\
  input.type = \"checkbox\";\n\
  input.checked = true;\n\
  fragment.appendChild( input );\n\
  support.appendChecked = input.checked;\n\
\n\
  // Make sure textarea (and checkbox) defaultValue is properly cloned\n\
  // Support: IE6-IE11+\n\
  div.innerHTML = \"<textarea>x</textarea>\";\n\
  support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;\n\
\n\
  // #11217 - WebKit loses check when the name is after the checked attribute\n\
  fragment.appendChild( div );\n\
  div.innerHTML = \"<input type='radio' checked='checked' name='t'/>\";\n\
\n\
  // Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3\n\
  // old WebKit doesn't clone checked state correctly in fragments\n\
  support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;\n\
\n\
  // Support: IE<9\n\
  // Opera does not clone events (and typeof div.attachEvent === undefined).\n\
  // IE9-10 clones events bound via attachEvent, but they don't trigger with .click()\n\
  support.noCloneEvent = true;\n\
  if ( div.attachEvent ) {\n\
    div.attachEvent( \"onclick\", function() {\n\
      support.noCloneEvent = false;\n\
    });\n\
\n\
    div.cloneNode( true ).click();\n\
  }\n\
\n\
  // Execute the test only if not already executed in another module.\n\
  if (support.deleteExpando == null) {\n\
    // Support: IE<9\n\
    support.deleteExpando = true;\n\
    try {\n\
      delete div.test;\n\
    } catch( e ) {\n\
      support.deleteExpando = false;\n\
    }\n\
  }\n\
})();\n\
\n\
\n\
(function() {\n\
  var i, eventName,\n\
    div = document.createElement( \"div\" );\n\
\n\
  // Support: IE<9 (lack submit/change bubble), Firefox 23+ (lack focusin event)\n\
  for ( i in { submit: true, change: true, focusin: true }) {\n\
    eventName = \"on\" + i;\n\
\n\
    if ( !(support[ i + \"Bubbles\" ] = eventName in window) ) {\n\
      // Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)\n\
      div.setAttribute( eventName, \"t\" );\n\
      support[ i + \"Bubbles\" ] = div.attributes[ eventName ].expando === false;\n\
    }\n\
  }\n\
\n\
  // Null elements to avoid leaks in IE.\n\
  div = null;\n\
})();\n\
\n\
\n\
var rformElems = /^(?:input|select|textarea)$/i,\n\
  rkeyEvent = /^key/,\n\
  rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,\n\
  rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,\n\
  rtypenamespace = /^([^.]*)(?:\\.(.+)|)$/;\n\
\n\
function returnTrue() {\n\
  return true;\n\
}\n\
\n\
function returnFalse() {\n\
  return false;\n\
}\n\
\n\
function safeActiveElement() {\n\
  try {\n\
    return document.activeElement;\n\
  } catch ( err ) { }\n\
}\n\
\n\
/*\n\
 * Helper functions for managing events -- not part of the public interface.\n\
 * Props to Dean Edwards' addEvent library for many of the ideas.\n\
 */\n\
jQuery.event = {\n\
\n\
  global: {},\n\
\n\
  add: function( elem, types, handler, data, selector ) {\n\
    var tmp, events, t, handleObjIn,\n\
      special, eventHandle, handleObj,\n\
      handlers, type, namespaces, origType,\n\
      elemData = jQuery._data( elem );\n\
\n\
    // Don't attach events to noData or text/comment nodes (but allow plain objects)\n\
    if ( !elemData ) {\n\
      return;\n\
    }\n\
\n\
    // Caller can pass in an object of custom data in lieu of the handler\n\
    if ( handler.handler ) {\n\
      handleObjIn = handler;\n\
      handler = handleObjIn.handler;\n\
      selector = handleObjIn.selector;\n\
    }\n\
\n\
    // Make sure that the handler has a unique ID, used to find/remove it later\n\
    if ( !handler.guid ) {\n\
      handler.guid = jQuery.guid++;\n\
    }\n\
\n\
    // Init the element's event structure and main handler, if this is the first\n\
    if ( !(events = elemData.events) ) {\n\
      events = elemData.events = {};\n\
    }\n\
    if ( !(eventHandle = elemData.handle) ) {\n\
      eventHandle = elemData.handle = function( e ) {\n\
        // Discard the second event of a jQuery.event.trigger() and\n\
        // when an event is called after a page has unloaded\n\
        return typeof jQuery !== strundefined && (!e || jQuery.event.triggered !== e.type) ?\n\
          jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :\n\
          undefined;\n\
      };\n\
      // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events\n\
      eventHandle.elem = elem;\n\
    }\n\
\n\
    // Handle multiple events separated by a space\n\
    types = ( types || \"\" ).match( rnotwhite ) || [ \"\" ];\n\
    t = types.length;\n\
    while ( t-- ) {\n\
      tmp = rtypenamespace.exec( types[t] ) || [];\n\
      type = origType = tmp[1];\n\
      namespaces = ( tmp[2] || \"\" ).split( \".\" ).sort();\n\
\n\
      // There *must* be a type, no attaching namespace-only handlers\n\
      if ( !type ) {\n\
        continue;\n\
      }\n\
\n\
      // If event changes its type, use the special event handlers for the changed type\n\
      special = jQuery.event.special[ type ] || {};\n\
\n\
      // If selector defined, determine special event api type, otherwise given type\n\
      type = ( selector ? special.delegateType : special.bindType ) || type;\n\
\n\
      // Update special based on newly reset type\n\
      special = jQuery.event.special[ type ] || {};\n\
\n\
      // handleObj is passed to all event handlers\n\
      handleObj = jQuery.extend({\n\
        type: type,\n\
        origType: origType,\n\
        data: data,\n\
        handler: handler,\n\
        guid: handler.guid,\n\
        selector: selector,\n\
        needsContext: selector && jQuery.expr.match.needsContext.test( selector ),\n\
        namespace: namespaces.join(\".\")\n\
      }, handleObjIn );\n\
\n\
      // Init the event handler queue if we're the first\n\
      if ( !(handlers = events[ type ]) ) {\n\
        handlers = events[ type ] = [];\n\
        handlers.delegateCount = 0;\n\
\n\
        // Only use addEventListener/attachEvent if the special events handler returns false\n\
        if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {\n\
          // Bind the global event handler to the element\n\
          if ( elem.addEventListener ) {\n\
            elem.addEventListener( type, eventHandle, false );\n\
\n\
          } else if ( elem.attachEvent ) {\n\
            elem.attachEvent( \"on\" + type, eventHandle );\n\
          }\n\
        }\n\
      }\n\
\n\
      if ( special.add ) {\n\
        special.add.call( elem, handleObj );\n\
\n\
        if ( !handleObj.handler.guid ) {\n\
          handleObj.handler.guid = handler.guid;\n\
        }\n\
      }\n\
\n\
      // Add to the element's handler list, delegates in front\n\
      if ( selector ) {\n\
        handlers.splice( handlers.delegateCount++, 0, handleObj );\n\
      } else {\n\
        handlers.push( handleObj );\n\
      }\n\
\n\
      // Keep track of which events have ever been used, for event optimization\n\
      jQuery.event.global[ type ] = true;\n\
    }\n\
\n\
    // Nullify elem to prevent memory leaks in IE\n\
    elem = null;\n\
  },\n\
\n\
  // Detach an event or set of events from an element\n\
  remove: function( elem, types, handler, selector, mappedTypes ) {\n\
    var j, handleObj, tmp,\n\
      origCount, t, events,\n\
      special, handlers, type,\n\
      namespaces, origType,\n\
      elemData = jQuery.hasData( elem ) && jQuery._data( elem );\n\
\n\
    if ( !elemData || !(events = elemData.events) ) {\n\
      return;\n\
    }\n\
\n\
    // Once for each type.namespace in types; type may be omitted\n\
    types = ( types || \"\" ).match( rnotwhite ) || [ \"\" ];\n\
    t = types.length;\n\
    while ( t-- ) {\n\
      tmp = rtypenamespace.exec( types[t] ) || [];\n\
      type = origType = tmp[1];\n\
      namespaces = ( tmp[2] || \"\" ).split( \".\" ).sort();\n\
\n\
      // Unbind all events (on this namespace, if provided) for the element\n\
      if ( !type ) {\n\
        for ( type in events ) {\n\
          jQuery.event.remove( elem, type + types[ t ], handler, selector, true );\n\
        }\n\
        continue;\n\
      }\n\
\n\
      special = jQuery.event.special[ type ] || {};\n\
      type = ( selector ? special.delegateType : special.bindType ) || type;\n\
      handlers = events[ type ] || [];\n\
      tmp = tmp[2] && new RegExp( \"(^|\\\\.)\" + namespaces.join(\"\\\\.(?:.*\\\\.|)\") + \"(\\\\.|$)\" );\n\
\n\
      // Remove matching events\n\
      origCount = j = handlers.length;\n\
      while ( j-- ) {\n\
        handleObj = handlers[ j ];\n\
\n\
        if ( ( mappedTypes || origType === handleObj.origType ) &&\n\
          ( !handler || handler.guid === handleObj.guid ) &&\n\
          ( !tmp || tmp.test( handleObj.namespace ) ) &&\n\
          ( !selector || selector === handleObj.selector || selector === \"**\" && handleObj.selector ) ) {\n\
          handlers.splice( j, 1 );\n\
\n\
          if ( handleObj.selector ) {\n\
            handlers.delegateCount--;\n\
          }\n\
          if ( special.remove ) {\n\
            special.remove.call( elem, handleObj );\n\
          }\n\
        }\n\
      }\n\
\n\
      // Remove generic event handler if we removed something and no more handlers exist\n\
      // (avoids potential for endless recursion during removal of special event handlers)\n\
      if ( origCount && !handlers.length ) {\n\
        if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {\n\
          jQuery.removeEvent( elem, type, elemData.handle );\n\
        }\n\
\n\
        delete events[ type ];\n\
      }\n\
    }\n\
\n\
    // Remove the expando if it's no longer used\n\
    if ( jQuery.isEmptyObject( events ) ) {\n\
      delete elemData.handle;\n\
\n\
      // removeData also checks for emptiness and clears the expando if empty\n\
      // so use it instead of delete\n\
      jQuery._removeData( elem, \"events\" );\n\
    }\n\
  },\n\
\n\
  trigger: function( event, data, elem, onlyHandlers ) {\n\
    var handle, ontype, cur,\n\
      bubbleType, special, tmp, i,\n\
      eventPath = [ elem || document ],\n\
      type = hasOwn.call( event, \"type\" ) ? event.type : event,\n\
      namespaces = hasOwn.call( event, \"namespace\" ) ? event.namespace.split(\".\") : [];\n\
\n\
    cur = tmp = elem = elem || document;\n\
\n\
    // Don't do events on text and comment nodes\n\
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {\n\
      return;\n\
    }\n\
\n\
    // focus/blur morphs to focusin/out; ensure we're not firing them right now\n\
    if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {\n\
      return;\n\
    }\n\
\n\
    if ( type.indexOf(\".\") >= 0 ) {\n\
      // Namespaced trigger; create a regexp to match event type in handle()\n\
      namespaces = type.split(\".\");\n\
      type = namespaces.shift();\n\
      namespaces.sort();\n\
    }\n\
    ontype = type.indexOf(\":\") < 0 && \"on\" + type;\n\
\n\
    // Caller can pass in a jQuery.Event object, Object, or just an event type string\n\
    event = event[ jQuery.expando ] ?\n\
      event :\n\
      new jQuery.Event( type, typeof event === \"object\" && event );\n\
\n\
    // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)\n\
    event.isTrigger = onlyHandlers ? 2 : 3;\n\
    event.namespace = namespaces.join(\".\");\n\
    event.namespace_re = event.namespace ?\n\
      new RegExp( \"(^|\\\\.)\" + namespaces.join(\"\\\\.(?:.*\\\\.|)\") + \"(\\\\.|$)\" ) :\n\
      null;\n\
\n\
    // Clean up the event in case it is being reused\n\
    event.result = undefined;\n\
    if ( !event.target ) {\n\
      event.target = elem;\n\
    }\n\
\n\
    // Clone any incoming data and prepend the event, creating the handler arg list\n\
    data = data == null ?\n\
      [ event ] :\n\
      jQuery.makeArray( data, [ event ] );\n\
\n\
    // Allow special events to draw outside the lines\n\
    special = jQuery.event.special[ type ] || {};\n\
    if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {\n\
      return;\n\
    }\n\
\n\
    // Determine event propagation path in advance, per W3C events spec (#9951)\n\
    // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)\n\
    if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {\n\
\n\
      bubbleType = special.delegateType || type;\n\
      if ( !rfocusMorph.test( bubbleType + type ) ) {\n\
        cur = cur.parentNode;\n\
      }\n\
      for ( ; cur; cur = cur.parentNode ) {\n\
        eventPath.push( cur );\n\
        tmp = cur;\n\
      }\n\
\n\
      // Only add window if we got to document (e.g., not plain obj or detached DOM)\n\
      if ( tmp === (elem.ownerDocument || document) ) {\n\
        eventPath.push( tmp.defaultView || tmp.parentWindow || window );\n\
      }\n\
    }\n\
\n\
    // Fire handlers on the event path\n\
    i = 0;\n\
    while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {\n\
\n\
      event.type = i > 1 ?\n\
        bubbleType :\n\
        special.bindType || type;\n\
\n\
      // jQuery handler\n\
      handle = ( jQuery._data( cur, \"events\" ) || {} )[ event.type ] && jQuery._data( cur, \"handle\" );\n\
      if ( handle ) {\n\
        handle.apply( cur, data );\n\
      }\n\
\n\
      // Native handler\n\
      handle = ontype && cur[ ontype ];\n\
      if ( handle && handle.apply && jQuery.acceptData( cur ) ) {\n\
        event.result = handle.apply( cur, data );\n\
        if ( event.result === false ) {\n\
          event.preventDefault();\n\
        }\n\
      }\n\
    }\n\
    event.type = type;\n\
\n\
    // If nobody prevented the default action, do it now\n\
    if ( !onlyHandlers && !event.isDefaultPrevented() ) {\n\
\n\
      if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&\n\
        jQuery.acceptData( elem ) ) {\n\
\n\
        // Call a native DOM method on the target with the same name name as the event.\n\
        // Can't use an .isFunction() check here because IE6/7 fails that test.\n\
        // Don't do default actions on window, that's where global variables be (#6170)\n\
        if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {\n\
\n\
          // Don't re-trigger an onFOO event when we call its FOO() method\n\
          tmp = elem[ ontype ];\n\
\n\
          if ( tmp ) {\n\
            elem[ ontype ] = null;\n\
          }\n\
\n\
          // Prevent re-triggering of the same event, since we already bubbled it above\n\
          jQuery.event.triggered = type;\n\
          try {\n\
            elem[ type ]();\n\
          } catch ( e ) {\n\
            // IE<9 dies on focus/blur to hidden element (#1486,#12518)\n\
            // only reproducible on winXP IE8 native, not IE9 in IE8 mode\n\
          }\n\
          jQuery.event.triggered = undefined;\n\
\n\
          if ( tmp ) {\n\
            elem[ ontype ] = tmp;\n\
          }\n\
        }\n\
      }\n\
    }\n\
\n\
    return event.result;\n\
  },\n\
\n\
  dispatch: function( event ) {\n\
\n\
    // Make a writable jQuery.Event from the native event object\n\
    event = jQuery.event.fix( event );\n\
\n\
    var i, ret, handleObj, matched, j,\n\
      handlerQueue = [],\n\
      args = slice.call( arguments ),\n\
      handlers = ( jQuery._data( this, \"events\" ) || {} )[ event.type ] || [],\n\
      special = jQuery.event.special[ event.type ] || {};\n\
\n\
    // Use the fix-ed jQuery.Event rather than the (read-only) native event\n\
    args[0] = event;\n\
    event.delegateTarget = this;\n\
\n\
    // Call the preDispatch hook for the mapped type, and let it bail if desired\n\
    if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {\n\
      return;\n\
    }\n\
\n\
    // Determine handlers\n\
    handlerQueue = jQuery.event.handlers.call( this, event, handlers );\n\
\n\
    // Run delegates first; they may want to stop propagation beneath us\n\
    i = 0;\n\
    while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {\n\
      event.currentTarget = matched.elem;\n\
\n\
      j = 0;\n\
      while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {\n\
\n\
        // Triggered event must either 1) have no namespace, or\n\
        // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).\n\
        if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {\n\
\n\
          event.handleObj = handleObj;\n\
          event.data = handleObj.data;\n\
\n\
          ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )\n\
              .apply( matched.elem, args );\n\
\n\
          if ( ret !== undefined ) {\n\
            if ( (event.result = ret) === false ) {\n\
              event.preventDefault();\n\
              event.stopPropagation();\n\
            }\n\
          }\n\
        }\n\
      }\n\
    }\n\
\n\
    // Call the postDispatch hook for the mapped type\n\
    if ( special.postDispatch ) {\n\
      special.postDispatch.call( this, event );\n\
    }\n\
\n\
    return event.result;\n\
  },\n\
\n\
  handlers: function( event, handlers ) {\n\
    var sel, handleObj, matches, i,\n\
      handlerQueue = [],\n\
      delegateCount = handlers.delegateCount,\n\
      cur = event.target;\n\
\n\
    // Find delegate handlers\n\
    // Black-hole SVG <use> instance trees (#13180)\n\
    // Avoid non-left-click bubbling in Firefox (#3861)\n\
    if ( delegateCount && cur.nodeType && (!event.button || event.type !== \"click\") ) {\n\
\n\
      /* jshint eqeqeq: false */\n\
      for ( ; cur != this; cur = cur.parentNode || this ) {\n\
        /* jshint eqeqeq: true */\n\
\n\
        // Don't check non-elements (#13208)\n\
        // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)\n\
        if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== \"click\") ) {\n\
          matches = [];\n\
          for ( i = 0; i < delegateCount; i++ ) {\n\
            handleObj = handlers[ i ];\n\
\n\
            // Don't conflict with Object.prototype properties (#13203)\n\
            sel = handleObj.selector + \" \";\n\
\n\
            if ( matches[ sel ] === undefined ) {\n\
              matches[ sel ] = handleObj.needsContext ?\n\
                jQuery( sel, this ).index( cur ) >= 0 :\n\
                jQuery.find( sel, this, null, [ cur ] ).length;\n\
            }\n\
            if ( matches[ sel ] ) {\n\
              matches.push( handleObj );\n\
            }\n\
          }\n\
          if ( matches.length ) {\n\
            handlerQueue.push({ elem: cur, handlers: matches });\n\
          }\n\
        }\n\
      }\n\
    }\n\
\n\
    // Add the remaining (directly-bound) handlers\n\
    if ( delegateCount < handlers.length ) {\n\
      handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });\n\
    }\n\
\n\
    return handlerQueue;\n\
  },\n\
\n\
  fix: function( event ) {\n\
    if ( event[ jQuery.expando ] ) {\n\
      return event;\n\
    }\n\
\n\
    // Create a writable copy of the event object and normalize some properties\n\
    var i, prop, copy,\n\
      type = event.type,\n\
      originalEvent = event,\n\
      fixHook = this.fixHooks[ type ];\n\
\n\
    if ( !fixHook ) {\n\
      this.fixHooks[ type ] = fixHook =\n\
        rmouseEvent.test( type ) ? this.mouseHooks :\n\
        rkeyEvent.test( type ) ? this.keyHooks :\n\
        {};\n\
    }\n\
    copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;\n\
\n\
    event = new jQuery.Event( originalEvent );\n\
\n\
    i = copy.length;\n\
    while ( i-- ) {\n\
      prop = copy[ i ];\n\
      event[ prop ] = originalEvent[ prop ];\n\
    }\n\
\n\
    // Support: IE<9\n\
    // Fix target property (#1925)\n\
    if ( !event.target ) {\n\
      event.target = originalEvent.srcElement || document;\n\
    }\n\
\n\
    // Support: Chrome 23+, Safari?\n\
    // Target should not be a text node (#504, #13143)\n\
    if ( event.target.nodeType === 3 ) {\n\
      event.target = event.target.parentNode;\n\
    }\n\
\n\
    // Support: IE<9\n\
    // For mouse/key events, metaKey==false if it's undefined (#3368, #11328)\n\
    event.metaKey = !!event.metaKey;\n\
\n\
    return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;\n\
  },\n\
\n\
  // Includes some event props shared by KeyEvent and MouseEvent\n\
  props: \"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which\".split(\" \"),\n\
\n\
  fixHooks: {},\n\
\n\
  keyHooks: {\n\
    props: \"char charCode key keyCode\".split(\" \"),\n\
    filter: function( event, original ) {\n\
\n\
      // Add which for key events\n\
      if ( event.which == null ) {\n\
        event.which = original.charCode != null ? original.charCode : original.keyCode;\n\
      }\n\
\n\
      return event;\n\
    }\n\
  },\n\
\n\
  mouseHooks: {\n\
    props: \"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement\".split(\" \"),\n\
    filter: function( event, original ) {\n\
      var body, eventDoc, doc,\n\
        button = original.button,\n\
        fromElement = original.fromElement;\n\
\n\
      // Calculate pageX/Y if missing and clientX/Y available\n\
      if ( event.pageX == null && original.clientX != null ) {\n\
        eventDoc = event.target.ownerDocument || document;\n\
        doc = eventDoc.documentElement;\n\
        body = eventDoc.body;\n\
\n\
        event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );\n\
        event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );\n\
      }\n\
\n\
      // Add relatedTarget, if necessary\n\
      if ( !event.relatedTarget && fromElement ) {\n\
        event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;\n\
      }\n\
\n\
      // Add which for click: 1 === left; 2 === middle; 3 === right\n\
      // Note: button is not normalized, so don't use it\n\
      if ( !event.which && button !== undefined ) {\n\
        event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );\n\
      }\n\
\n\
      return event;\n\
    }\n\
  },\n\
\n\
  special: {\n\
    load: {\n\
      // Prevent triggered image.load events from bubbling to window.load\n\
      noBubble: true\n\
    },\n\
    focus: {\n\
      // Fire native event if possible so blur/focus sequence is correct\n\
      trigger: function() {\n\
        if ( this !== safeActiveElement() && this.focus ) {\n\
          try {\n\
            this.focus();\n\
            return false;\n\
          } catch ( e ) {\n\
            // Support: IE<9\n\
            // If we error on focus to hidden element (#1486, #12518),\n\
            // let .trigger() run the handlers\n\
          }\n\
        }\n\
      },\n\
      delegateType: \"focusin\"\n\
    },\n\
    blur: {\n\
      trigger: function() {\n\
        if ( this === safeActiveElement() && this.blur ) {\n\
          this.blur();\n\
          return false;\n\
        }\n\
      },\n\
      delegateType: \"focusout\"\n\
    },\n\
    click: {\n\
      // For checkbox, fire native event so checked state will be right\n\
      trigger: function() {\n\
        if ( jQuery.nodeName( this, \"input\" ) && this.type === \"checkbox\" && this.click ) {\n\
          this.click();\n\
          return false;\n\
        }\n\
      },\n\
\n\
      // For cross-browser consistency, don't fire native .click() on links\n\
      _default: function( event ) {\n\
        return jQuery.nodeName( event.target, \"a\" );\n\
      }\n\
    },\n\
\n\
    beforeunload: {\n\
      postDispatch: function( event ) {\n\
\n\
        // Support: Firefox 20+\n\
        // Firefox doesn't alert if the returnValue field is not set.\n\
        if ( event.result !== undefined && event.originalEvent ) {\n\
          event.originalEvent.returnValue = event.result;\n\
        }\n\
      }\n\
    }\n\
  },\n\
\n\
  simulate: function( type, elem, event, bubble ) {\n\
    // Piggyback on a donor event to simulate a different one.\n\
    // Fake originalEvent to avoid donor's stopPropagation, but if the\n\
    // simulated event prevents default then we do the same on the donor.\n\
    var e = jQuery.extend(\n\
      new jQuery.Event(),\n\
      event,\n\
      {\n\
        type: type,\n\
        isSimulated: true,\n\
        originalEvent: {}\n\
      }\n\
    );\n\
    if ( bubble ) {\n\
      jQuery.event.trigger( e, null, elem );\n\
    } else {\n\
      jQuery.event.dispatch.call( elem, e );\n\
    }\n\
    if ( e.isDefaultPrevented() ) {\n\
      event.preventDefault();\n\
    }\n\
  }\n\
};\n\
\n\
jQuery.removeEvent = document.removeEventListener ?\n\
  function( elem, type, handle ) {\n\
    if ( elem.removeEventListener ) {\n\
      elem.removeEventListener( type, handle, false );\n\
    }\n\
  } :\n\
  function( elem, type, handle ) {\n\
    var name = \"on\" + type;\n\
\n\
    if ( elem.detachEvent ) {\n\
\n\
      // #8545, #7054, preventing memory leaks for custom events in IE6-8\n\
      // detachEvent needed property on element, by name of that event, to properly expose it to GC\n\
      if ( typeof elem[ name ] === strundefined ) {\n\
        elem[ name ] = null;\n\
      }\n\
\n\
      elem.detachEvent( name, handle );\n\
    }\n\
  };\n\
\n\
jQuery.Event = function( src, props ) {\n\
  // Allow instantiation without the 'new' keyword\n\
  if ( !(this instanceof jQuery.Event) ) {\n\
    return new jQuery.Event( src, props );\n\
  }\n\
\n\
  // Event object\n\
  if ( src && src.type ) {\n\
    this.originalEvent = src;\n\
    this.type = src.type;\n\
\n\
    // Events bubbling up the document may have been marked as prevented\n\
    // by a handler lower down the tree; reflect the correct value.\n\
    this.isDefaultPrevented = src.defaultPrevented ||\n\
        src.defaultPrevented === undefined &&\n\
        // Support: IE < 9, Android < 4.0\n\
        src.returnValue === false ?\n\
      returnTrue :\n\
      returnFalse;\n\
\n\
  // Event type\n\
  } else {\n\
    this.type = src;\n\
  }\n\
\n\
  // Put explicitly provided properties onto the event object\n\
  if ( props ) {\n\
    jQuery.extend( this, props );\n\
  }\n\
\n\
  // Create a timestamp if incoming event doesn't have one\n\
  this.timeStamp = src && src.timeStamp || jQuery.now();\n\
\n\
  // Mark it as fixed\n\
  this[ jQuery.expando ] = true;\n\
};\n\
\n\
// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding\n\
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html\n\
jQuery.Event.prototype = {\n\
  isDefaultPrevented: returnFalse,\n\
  isPropagationStopped: returnFalse,\n\
  isImmediatePropagationStopped: returnFalse,\n\
\n\
  preventDefault: function() {\n\
    var e = this.originalEvent;\n\
\n\
    this.isDefaultPrevented = returnTrue;\n\
    if ( !e ) {\n\
      return;\n\
    }\n\
\n\
    // If preventDefault exists, run it on the original event\n\
    if ( e.preventDefault ) {\n\
      e.preventDefault();\n\
\n\
    // Support: IE\n\
    // Otherwise set the returnValue property of the original event to false\n\
    } else {\n\
      e.returnValue = false;\n\
    }\n\
  },\n\
  stopPropagation: function() {\n\
    var e = this.originalEvent;\n\
\n\
    this.isPropagationStopped = returnTrue;\n\
    if ( !e ) {\n\
      return;\n\
    }\n\
    // If stopPropagation exists, run it on the original event\n\
    if ( e.stopPropagation ) {\n\
      e.stopPropagation();\n\
    }\n\
\n\
    // Support: IE\n\
    // Set the cancelBubble property of the original event to true\n\
    e.cancelBubble = true;\n\
  },\n\
  stopImmediatePropagation: function() {\n\
    var e = this.originalEvent;\n\
\n\
    this.isImmediatePropagationStopped = returnTrue;\n\
\n\
    if ( e && e.stopImmediatePropagation ) {\n\
      e.stopImmediatePropagation();\n\
    }\n\
\n\
    this.stopPropagation();\n\
  }\n\
};\n\
\n\
// Create mouseenter/leave events using mouseover/out and event-time checks\n\
jQuery.each({\n\
  mouseenter: \"mouseover\",\n\
  mouseleave: \"mouseout\",\n\
  pointerenter: \"pointerover\",\n\
  pointerleave: \"pointerout\"\n\
}, function( orig, fix ) {\n\
  jQuery.event.special[ orig ] = {\n\
    delegateType: fix,\n\
    bindType: fix,\n\
\n\
    handle: function( event ) {\n\
      var ret,\n\
        target = this,\n\
        related = event.relatedTarget,\n\
        handleObj = event.handleObj;\n\
\n\
      // For mousenter/leave call the handler if related is outside the target.\n\
      // NB: No relatedTarget if the mouse left/entered the browser window\n\
      if ( !related || (related !== target && !jQuery.contains( target, related )) ) {\n\
        event.type = handleObj.origType;\n\
        ret = handleObj.handler.apply( this, arguments );\n\
        event.type = fix;\n\
      }\n\
      return ret;\n\
    }\n\
  };\n\
});\n\
\n\
// IE submit delegation\n\
if ( !support.submitBubbles ) {\n\
\n\
  jQuery.event.special.submit = {\n\
    setup: function() {\n\
      // Only need this for delegated form submit events\n\
      if ( jQuery.nodeName( this, \"form\" ) ) {\n\
        return false;\n\
      }\n\
\n\
      // Lazy-add a submit handler when a descendant form may potentially be submitted\n\
      jQuery.event.add( this, \"click._submit keypress._submit\", function( e ) {\n\
        // Node name check avoids a VML-related crash in IE (#9807)\n\
        var elem = e.target,\n\
          form = jQuery.nodeName( elem, \"input\" ) || jQuery.nodeName( elem, \"button\" ) ? elem.form : undefined;\n\
        if ( form && !jQuery._data( form, \"submitBubbles\" ) ) {\n\
          jQuery.event.add( form, \"submit._submit\", function( event ) {\n\
            event._submit_bubble = true;\n\
          });\n\
          jQuery._data( form, \"submitBubbles\", true );\n\
        }\n\
      });\n\
      // return undefined since we don't need an event listener\n\
    },\n\
\n\
    postDispatch: function( event ) {\n\
      // If form was submitted by the user, bubble the event up the tree\n\
      if ( event._submit_bubble ) {\n\
        delete event._submit_bubble;\n\
        if ( this.parentNode && !event.isTrigger ) {\n\
          jQuery.event.simulate( \"submit\", this.parentNode, event, true );\n\
        }\n\
      }\n\
    },\n\
\n\
    teardown: function() {\n\
      // Only need this for delegated form submit events\n\
      if ( jQuery.nodeName( this, \"form\" ) ) {\n\
        return false;\n\
      }\n\
\n\
      // Remove delegated handlers; cleanData eventually reaps submit handlers attached above\n\
      jQuery.event.remove( this, \"._submit\" );\n\
    }\n\
  };\n\
}\n\
\n\
// IE change delegation and checkbox/radio fix\n\
if ( !support.changeBubbles ) {\n\
\n\
  jQuery.event.special.change = {\n\
\n\
    setup: function() {\n\
\n\
      if ( rformElems.test( this.nodeName ) ) {\n\
        // IE doesn't fire change on a check/radio until blur; trigger it on click\n\
        // after a propertychange. Eat the blur-change in special.change.handle.\n\
        // This still fires onchange a second time for check/radio after blur.\n\
        if ( this.type === \"checkbox\" || this.type === \"radio\" ) {\n\
          jQuery.event.add( this, \"propertychange._change\", function( event ) {\n\
            if ( event.originalEvent.propertyName === \"checked\" ) {\n\
              this._just_changed = true;\n\
            }\n\
          });\n\
          jQuery.event.add( this, \"click._change\", function( event ) {\n\
            if ( this._just_changed && !event.isTrigger ) {\n\
              this._just_changed = false;\n\
            }\n\
            // Allow triggered, simulated change events (#11500)\n\
            jQuery.event.simulate( \"change\", this, event, true );\n\
          });\n\
        }\n\
        return false;\n\
      }\n\
      // Delegated event; lazy-add a change handler on descendant inputs\n\
      jQuery.event.add( this, \"beforeactivate._change\", function( e ) {\n\
        var elem = e.target;\n\
\n\
        if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, \"changeBubbles\" ) ) {\n\
          jQuery.event.add( elem, \"change._change\", function( event ) {\n\
            if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {\n\
              jQuery.event.simulate( \"change\", this.parentNode, event, true );\n\
            }\n\
          });\n\
          jQuery._data( elem, \"changeBubbles\", true );\n\
        }\n\
      });\n\
    },\n\
\n\
    handle: function( event ) {\n\
      var elem = event.target;\n\
\n\
      // Swallow native change events from checkbox/radio, we already triggered them above\n\
      if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== \"radio\" && elem.type !== \"checkbox\") ) {\n\
        return event.handleObj.handler.apply( this, arguments );\n\
      }\n\
    },\n\
\n\
    teardown: function() {\n\
      jQuery.event.remove( this, \"._change\" );\n\
\n\
      return !rformElems.test( this.nodeName );\n\
    }\n\
  };\n\
}\n\
\n\
// Create \"bubbling\" focus and blur events\n\
if ( !support.focusinBubbles ) {\n\
  jQuery.each({ focus: \"focusin\", blur: \"focusout\" }, function( orig, fix ) {\n\
\n\
    // Attach a single capturing handler on the document while someone wants focusin/focusout\n\
    var handler = function( event ) {\n\
        jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );\n\
      };\n\
\n\
    jQuery.event.special[ fix ] = {\n\
      setup: function() {\n\
        var doc = this.ownerDocument || this,\n\
          attaches = jQuery._data( doc, fix );\n\
\n\
        if ( !attaches ) {\n\
          doc.addEventListener( orig, handler, true );\n\
        }\n\
        jQuery._data( doc, fix, ( attaches || 0 ) + 1 );\n\
      },\n\
      teardown: function() {\n\
        var doc = this.ownerDocument || this,\n\
          attaches = jQuery._data( doc, fix ) - 1;\n\
\n\
        if ( !attaches ) {\n\
          doc.removeEventListener( orig, handler, true );\n\
          jQuery._removeData( doc, fix );\n\
        } else {\n\
          jQuery._data( doc, fix, attaches );\n\
        }\n\
      }\n\
    };\n\
  });\n\
}\n\
\n\
jQuery.fn.extend({\n\
\n\
  on: function( types, selector, data, fn, /*INTERNAL*/ one ) {\n\
    var type, origFn;\n\
\n\
    // Types can be a map of types/handlers\n\
    if ( typeof types === \"object\" ) {\n\
      // ( types-Object, selector, data )\n\
      if ( typeof selector !== \"string\" ) {\n\
        // ( types-Object, data )\n\
        data = data || selector;\n\
        selector = undefined;\n\
      }\n\
      for ( type in types ) {\n\
        this.on( type, selector, data, types[ type ], one );\n\
      }\n\
      return this;\n\
    }\n\
\n\
    if ( data == null && fn == null ) {\n\
      // ( types, fn )\n\
      fn = selector;\n\
      data = selector = undefined;\n\
    } else if ( fn == null ) {\n\
      if ( typeof selector === \"string\" ) {\n\
        // ( types, selector, fn )\n\
        fn = data;\n\
        data = undefined;\n\
      } else {\n\
        // ( types, data, fn )\n\
        fn = data;\n\
        data = selector;\n\
        selector = undefined;\n\
      }\n\
    }\n\
    if ( fn === false ) {\n\
      fn = returnFalse;\n\
    } else if ( !fn ) {\n\
      return this;\n\
    }\n\
\n\
    if ( one === 1 ) {\n\
      origFn = fn;\n\
      fn = function( event ) {\n\
        // Can use an empty set, since event contains the info\n\
        jQuery().off( event );\n\
        return origFn.apply( this, arguments );\n\
      };\n\
      // Use same guid so caller can remove using origFn\n\
      fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );\n\
    }\n\
    return this.each( function() {\n\
      jQuery.event.add( this, types, fn, data, selector );\n\
    });\n\
  },\n\
  one: function( types, selector, data, fn ) {\n\
    return this.on( types, selector, data, fn, 1 );\n\
  },\n\
  off: function( types, selector, fn ) {\n\
    var handleObj, type;\n\
    if ( types && types.preventDefault && types.handleObj ) {\n\
      // ( event )  dispatched jQuery.Event\n\
      handleObj = types.handleObj;\n\
      jQuery( types.delegateTarget ).off(\n\
        handleObj.namespace ? handleObj.origType + \".\" + handleObj.namespace : handleObj.origType,\n\
        handleObj.selector,\n\
        handleObj.handler\n\
      );\n\
      return this;\n\
    }\n\
    if ( typeof types === \"object\" ) {\n\
      // ( types-object [, selector] )\n\
      for ( type in types ) {\n\
        this.off( type, selector, types[ type ] );\n\
      }\n\
      return this;\n\
    }\n\
    if ( selector === false || typeof selector === \"function\" ) {\n\
      // ( types [, fn] )\n\
      fn = selector;\n\
      selector = undefined;\n\
    }\n\
    if ( fn === false ) {\n\
      fn = returnFalse;\n\
    }\n\
    return this.each(function() {\n\
      jQuery.event.remove( this, types, fn, selector );\n\
    });\n\
  },\n\
\n\
  trigger: function( type, data ) {\n\
    return this.each(function() {\n\
      jQuery.event.trigger( type, data, this );\n\
    });\n\
  },\n\
  triggerHandler: function( type, data ) {\n\
    var elem = this[0];\n\
    if ( elem ) {\n\
      return jQuery.event.trigger( type, data, elem, true );\n\
    }\n\
  }\n\
});\n\
\n\
\n\
function createSafeFragment( document ) {\n\
  var list = nodeNames.split( \"|\" ),\n\
    safeFrag = document.createDocumentFragment();\n\
\n\
  if ( safeFrag.createElement ) {\n\
    while ( list.length ) {\n\
      safeFrag.createElement(\n\
        list.pop()\n\
      );\n\
    }\n\
  }\n\
  return safeFrag;\n\
}\n\
\n\
var nodeNames = \"abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|\" +\n\
    \"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video\",\n\
  rinlinejQuery = / jQuery\\d+=\"(?:null|\\d+)\"/g,\n\
  rnoshimcache = new RegExp(\"<(?:\" + nodeNames + \")[\\\\s/>]\", \"i\"),\n\
  rleadingWhitespace = /^\\s+/,\n\
  rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\\w:]+)[^>]*)\\/>/gi,\n\
  rtagName = /<([\\w:]+)/,\n\
  rtbody = /<tbody/i,\n\
  rhtml = /<|&#?\\w+;/,\n\
  rnoInnerhtml = /<(?:script|style|link)/i,\n\
  // checked=\"checked\" or checked\n\
  rchecked = /checked\\s*(?:[^=]|=\\s*.checked.)/i,\n\
  rscriptType = /^$|\\/(?:java|ecma)script/i,\n\
  rscriptTypeMasked = /^true\\/(.*)/,\n\
  rcleanScript = /^\\s*<!(?:\\[CDATA\\[|--)|(?:\\]\\]|--)>\\s*$/g,\n\
\n\
  // We have to close these tags to support XHTML (#13200)\n\
  wrapMap = {\n\
    option: [ 1, \"<select multiple='multiple'>\", \"</select>\" ],\n\
    legend: [ 1, \"<fieldset>\", \"</fieldset>\" ],\n\
    area: [ 1, \"<map>\", \"</map>\" ],\n\
    param: [ 1, \"<object>\", \"</object>\" ],\n\
    thead: [ 1, \"<table>\", \"</table>\" ],\n\
    tr: [ 2, \"<table><tbody>\", \"</tbody></table>\" ],\n\
    col: [ 2, \"<table><tbody></tbody><colgroup>\", \"</colgroup></table>\" ],\n\
    td: [ 3, \"<table><tbody><tr>\", \"</tr></tbody></table>\" ],\n\
\n\
    // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,\n\
    // unless wrapped in a div with non-breaking characters in front of it.\n\
    _default: support.htmlSerialize ? [ 0, \"\", \"\" ] : [ 1, \"X<div>\", \"</div>\"  ]\n\
  },\n\
  safeFragment = createSafeFragment( document ),\n\
  fragmentDiv = safeFragment.appendChild( document.createElement(\"div\") );\n\
\n\
wrapMap.optgroup = wrapMap.option;\n\
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;\n\
wrapMap.th = wrapMap.td;\n\
\n\
function getAll( context, tag ) {\n\
  var elems, elem,\n\
    i = 0,\n\
    found = typeof context.getElementsByTagName !== strundefined ? context.getElementsByTagName( tag || \"*\" ) :\n\
      typeof context.querySelectorAll !== strundefined ? context.querySelectorAll( tag || \"*\" ) :\n\
      undefined;\n\
\n\
  if ( !found ) {\n\
    for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {\n\
      if ( !tag || jQuery.nodeName( elem, tag ) ) {\n\
        found.push( elem );\n\
      } else {\n\
        jQuery.merge( found, getAll( elem, tag ) );\n\
      }\n\
    }\n\
  }\n\
\n\
  return tag === undefined || tag && jQuery.nodeName( context, tag ) ?\n\
    jQuery.merge( [ context ], found ) :\n\
    found;\n\
}\n\
\n\
// Used in buildFragment, fixes the defaultChecked property\n\
function fixDefaultChecked( elem ) {\n\
  if ( rcheckableType.test( elem.type ) ) {\n\
    elem.defaultChecked = elem.checked;\n\
  }\n\
}\n\
\n\
// Support: IE<8\n\
// Manipulating tables requires a tbody\n\
function manipulationTarget( elem, content ) {\n\
  return jQuery.nodeName( elem, \"table\" ) &&\n\
    jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, \"tr\" ) ?\n\
\n\
    elem.getElementsByTagName(\"tbody\")[0] ||\n\
      elem.appendChild( elem.ownerDocument.createElement(\"tbody\") ) :\n\
    elem;\n\
}\n\
\n\
// Replace/restore the type attribute of script elements for safe DOM manipulation\n\
function disableScript( elem ) {\n\
  elem.type = (jQuery.find.attr( elem, \"type\" ) !== null) + \"/\" + elem.type;\n\
  return elem;\n\
}\n\
function restoreScript( elem ) {\n\
  var match = rscriptTypeMasked.exec( elem.type );\n\
  if ( match ) {\n\
    elem.type = match[1];\n\
  } else {\n\
    elem.removeAttribute(\"type\");\n\
  }\n\
  return elem;\n\
}\n\
\n\
// Mark scripts as having already been evaluated\n\
function setGlobalEval( elems, refElements ) {\n\
  var elem,\n\
    i = 0;\n\
  for ( ; (elem = elems[i]) != null; i++ ) {\n\
    jQuery._data( elem, \"globalEval\", !refElements || jQuery._data( refElements[i], \"globalEval\" ) );\n\
  }\n\
}\n\
\n\
function cloneCopyEvent( src, dest ) {\n\
\n\
  if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {\n\
    return;\n\
  }\n\
\n\
  var type, i, l,\n\
    oldData = jQuery._data( src ),\n\
    curData = jQuery._data( dest, oldData ),\n\
    events = oldData.events;\n\
\n\
  if ( events ) {\n\
    delete curData.handle;\n\
    curData.events = {};\n\
\n\
    for ( type in events ) {\n\
      for ( i = 0, l = events[ type ].length; i < l; i++ ) {\n\
        jQuery.event.add( dest, type, events[ type ][ i ] );\n\
      }\n\
    }\n\
  }\n\
\n\
  // make the cloned public data object a copy from the original\n\
  if ( curData.data ) {\n\
    curData.data = jQuery.extend( {}, curData.data );\n\
  }\n\
}\n\
\n\
function fixCloneNodeIssues( src, dest ) {\n\
  var nodeName, e, data;\n\
\n\
  // We do not need to do anything for non-Elements\n\
  if ( dest.nodeType !== 1 ) {\n\
    return;\n\
  }\n\
\n\
  nodeName = dest.nodeName.toLowerCase();\n\
\n\
  // IE6-8 copies events bound via attachEvent when using cloneNode.\n\
  if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {\n\
    data = jQuery._data( dest );\n\
\n\
    for ( e in data.events ) {\n\
      jQuery.removeEvent( dest, e, data.handle );\n\
    }\n\
\n\
    // Event data gets referenced instead of copied if the expando gets copied too\n\
    dest.removeAttribute( jQuery.expando );\n\
  }\n\
\n\
  // IE blanks contents when cloning scripts, and tries to evaluate newly-set text\n\
  if ( nodeName === \"script\" && dest.text !== src.text ) {\n\
    disableScript( dest ).text = src.text;\n\
    restoreScript( dest );\n\
\n\
  // IE6-10 improperly clones children of object elements using classid.\n\
  // IE10 throws NoModificationAllowedError if parent is null, #12132.\n\
  } else if ( nodeName === \"object\" ) {\n\
    if ( dest.parentNode ) {\n\
      dest.outerHTML = src.outerHTML;\n\
    }\n\
\n\
    // This path appears unavoidable for IE9. When cloning an object\n\
    // element in IE9, the outerHTML strategy above is not sufficient.\n\
    // If the src has innerHTML and the destination does not,\n\
    // copy the src.innerHTML into the dest.innerHTML. #10324\n\
    if ( support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {\n\
      dest.innerHTML = src.innerHTML;\n\
    }\n\
\n\
  } else if ( nodeName === \"input\" && rcheckableType.test( src.type ) ) {\n\
    // IE6-8 fails to persist the checked state of a cloned checkbox\n\
    // or radio button. Worse, IE6-7 fail to give the cloned element\n\
    // a checked appearance if the defaultChecked value isn't also set\n\
\n\
    dest.defaultChecked = dest.checked = src.checked;\n\
\n\
    // IE6-7 get confused and end up setting the value of a cloned\n\
    // checkbox/radio button to an empty string instead of \"on\"\n\
    if ( dest.value !== src.value ) {\n\
      dest.value = src.value;\n\
    }\n\
\n\
  // IE6-8 fails to return the selected option to the default selected\n\
  // state when cloning options\n\
  } else if ( nodeName === \"option\" ) {\n\
    dest.defaultSelected = dest.selected = src.defaultSelected;\n\
\n\
  // IE6-8 fails to set the defaultValue to the correct value when\n\
  // cloning other types of input fields\n\
  } else if ( nodeName === \"input\" || nodeName === \"textarea\" ) {\n\
    dest.defaultValue = src.defaultValue;\n\
  }\n\
}\n\
\n\
jQuery.extend({\n\
  clone: function( elem, dataAndEvents, deepDataAndEvents ) {\n\
    var destElements, node, clone, i, srcElements,\n\
      inPage = jQuery.contains( elem.ownerDocument, elem );\n\
\n\
    if ( support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( \"<\" + elem.nodeName + \">\" ) ) {\n\
      clone = elem.cloneNode( true );\n\
\n\
    // IE<=8 does not properly clone detached, unknown element nodes\n\
    } else {\n\
      fragmentDiv.innerHTML = elem.outerHTML;\n\
      fragmentDiv.removeChild( clone = fragmentDiv.firstChild );\n\
    }\n\
\n\
    if ( (!support.noCloneEvent || !support.noCloneChecked) &&\n\
        (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {\n\
\n\
      // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2\n\
      destElements = getAll( clone );\n\
      srcElements = getAll( elem );\n\
\n\
      // Fix all IE cloning issues\n\
      for ( i = 0; (node = srcElements[i]) != null; ++i ) {\n\
        // Ensure that the destination node is not null; Fixes #9587\n\
        if ( destElements[i] ) {\n\
          fixCloneNodeIssues( node, destElements[i] );\n\
        }\n\
      }\n\
    }\n\
\n\
    // Copy the events from the original to the clone\n\
    if ( dataAndEvents ) {\n\
      if ( deepDataAndEvents ) {\n\
        srcElements = srcElements || getAll( elem );\n\
        destElements = destElements || getAll( clone );\n\
\n\
        for ( i = 0; (node = srcElements[i]) != null; i++ ) {\n\
          cloneCopyEvent( node, destElements[i] );\n\
        }\n\
      } else {\n\
        cloneCopyEvent( elem, clone );\n\
      }\n\
    }\n\
\n\
    // Preserve script evaluation history\n\
    destElements = getAll( clone, \"script\" );\n\
    if ( destElements.length > 0 ) {\n\
      setGlobalEval( destElements, !inPage && getAll( elem, \"script\" ) );\n\
    }\n\
\n\
    destElements = srcElements = node = null;\n\
\n\
    // Return the cloned set\n\
    return clone;\n\
  },\n\
\n\
  buildFragment: function( elems, context, scripts, selection ) {\n\
    var j, elem, contains,\n\
      tmp, tag, tbody, wrap,\n\
      l = elems.length,\n\
\n\
      // Ensure a safe fragment\n\
      safe = createSafeFragment( context ),\n\
\n\
      nodes = [],\n\
      i = 0;\n\
\n\
    for ( ; i < l; i++ ) {\n\
      elem = elems[ i ];\n\
\n\
      if ( elem || elem === 0 ) {\n\
\n\
        // Add nodes directly\n\
        if ( jQuery.type( elem ) === \"object\" ) {\n\
          jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );\n\
\n\
        // Convert non-html into a text node\n\
        } else if ( !rhtml.test( elem ) ) {\n\
          nodes.push( context.createTextNode( elem ) );\n\
\n\
        // Convert html into DOM nodes\n\
        } else {\n\
          tmp = tmp || safe.appendChild( context.createElement(\"div\") );\n\
\n\
          // Deserialize a standard representation\n\
          tag = (rtagName.exec( elem ) || [ \"\", \"\" ])[ 1 ].toLowerCase();\n\
          wrap = wrapMap[ tag ] || wrapMap._default;\n\
\n\
          tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, \"<$1></$2>\" ) + wrap[2];\n\
\n\
          // Descend through wrappers to the right content\n\
          j = wrap[0];\n\
          while ( j-- ) {\n\
            tmp = tmp.lastChild;\n\
          }\n\
\n\
          // Manually add leading whitespace removed by IE\n\
          if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {\n\
            nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );\n\
          }\n\
\n\
          // Remove IE's autoinserted <tbody> from table fragments\n\
          if ( !support.tbody ) {\n\
\n\
            // String was a <table>, *may* have spurious <tbody>\n\
            elem = tag === \"table\" && !rtbody.test( elem ) ?\n\
              tmp.firstChild :\n\
\n\
              // String was a bare <thead> or <tfoot>\n\
              wrap[1] === \"<table>\" && !rtbody.test( elem ) ?\n\
                tmp :\n\
                0;\n\
\n\
            j = elem && elem.childNodes.length;\n\
            while ( j-- ) {\n\
              if ( jQuery.nodeName( (tbody = elem.childNodes[j]), \"tbody\" ) && !tbody.childNodes.length ) {\n\
                elem.removeChild( tbody );\n\
              }\n\
            }\n\
          }\n\
\n\
          jQuery.merge( nodes, tmp.childNodes );\n\
\n\
          // Fix #12392 for WebKit and IE > 9\n\
          tmp.textContent = \"\";\n\
\n\
          // Fix #12392 for oldIE\n\
          while ( tmp.firstChild ) {\n\
            tmp.removeChild( tmp.firstChild );\n\
          }\n\
\n\
          // Remember the top-level container for proper cleanup\n\
          tmp = safe.lastChild;\n\
        }\n\
      }\n\
    }\n\
\n\
    // Fix #11356: Clear elements from fragment\n\
    if ( tmp ) {\n\
      safe.removeChild( tmp );\n\
    }\n\
\n\
    // Reset defaultChecked for any radios and checkboxes\n\
    // about to be appended to the DOM in IE 6/7 (#8060)\n\
    if ( !support.appendChecked ) {\n\
      jQuery.grep( getAll( nodes, \"input\" ), fixDefaultChecked );\n\
    }\n\
\n\
    i = 0;\n\
    while ( (elem = nodes[ i++ ]) ) {\n\
\n\
      // #4087 - If origin and destination elements are the same, and this is\n\
      // that element, do not do anything\n\
      if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {\n\
        continue;\n\
      }\n\
\n\
      contains = jQuery.contains( elem.ownerDocument, elem );\n\
\n\
      // Append to fragment\n\
      tmp = getAll( safe.appendChild( elem ), \"script\" );\n\
\n\
      // Preserve script evaluation history\n\
      if ( contains ) {\n\
        setGlobalEval( tmp );\n\
      }\n\
\n\
      // Capture executables\n\
      if ( scripts ) {\n\
        j = 0;\n\
        while ( (elem = tmp[ j++ ]) ) {\n\
          if ( rscriptType.test( elem.type || \"\" ) ) {\n\
            scripts.push( elem );\n\
          }\n\
        }\n\
      }\n\
    }\n\
\n\
    tmp = null;\n\
\n\
    return safe;\n\
  },\n\
\n\
  cleanData: function( elems, /* internal */ acceptData ) {\n\
    var elem, type, id, data,\n\
      i = 0,\n\
      internalKey = jQuery.expando,\n\
      cache = jQuery.cache,\n\
      deleteExpando = support.deleteExpando,\n\
      special = jQuery.event.special;\n\
\n\
    for ( ; (elem = elems[i]) != null; i++ ) {\n\
      if ( acceptData || jQuery.acceptData( elem ) ) {\n\
\n\
        id = elem[ internalKey ];\n\
        data = id && cache[ id ];\n\
\n\
        if ( data ) {\n\
          if ( data.events ) {\n\
            for ( type in data.events ) {\n\
              if ( special[ type ] ) {\n\
                jQuery.event.remove( elem, type );\n\
\n\
              // This is a shortcut to avoid jQuery.event.remove's overhead\n\
              } else {\n\
                jQuery.removeEvent( elem, type, data.handle );\n\
              }\n\
            }\n\
          }\n\
\n\
          // Remove cache only if it was not already removed by jQuery.event.remove\n\
          if ( cache[ id ] ) {\n\
\n\
            delete cache[ id ];\n\
\n\
            // IE does not allow us to delete expando properties from nodes,\n\
            // nor does it have a removeAttribute function on Document nodes;\n\
            // we must handle all of these cases\n\
            if ( deleteExpando ) {\n\
              delete elem[ internalKey ];\n\
\n\
            } else if ( typeof elem.removeAttribute !== strundefined ) {\n\
              elem.removeAttribute( internalKey );\n\
\n\
            } else {\n\
              elem[ internalKey ] = null;\n\
            }\n\
\n\
            deletedIds.push( id );\n\
          }\n\
        }\n\
      }\n\
    }\n\
  }\n\
});\n\
\n\
jQuery.fn.extend({\n\
  text: function( value ) {\n\
    return access( this, function( value ) {\n\
      return value === undefined ?\n\
        jQuery.text( this ) :\n\
        this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );\n\
    }, null, value, arguments.length );\n\
  },\n\
\n\
  append: function() {\n\
    return this.domManip( arguments, function( elem ) {\n\
      if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {\n\
        var target = manipulationTarget( this, elem );\n\
        target.appendChild( elem );\n\
      }\n\
    });\n\
  },\n\
\n\
  prepend: function() {\n\
    return this.domManip( arguments, function( elem ) {\n\
      if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {\n\
        var target = manipulationTarget( this, elem );\n\
        target.insertBefore( elem, target.firstChild );\n\
      }\n\
    });\n\
  },\n\
\n\
  before: function() {\n\
    return this.domManip( arguments, function( elem ) {\n\
      if ( this.parentNode ) {\n\
        this.parentNode.insertBefore( elem, this );\n\
      }\n\
    });\n\
  },\n\
\n\
  after: function() {\n\
    return this.domManip( arguments, function( elem ) {\n\
      if ( this.parentNode ) {\n\
        this.parentNode.insertBefore( elem, this.nextSibling );\n\
      }\n\
    });\n\
  },\n\
\n\
  remove: function( selector, keepData /* Internal Use Only */ ) {\n\
    var elem,\n\
      elems = selector ? jQuery.filter( selector, this ) : this,\n\
      i = 0;\n\
\n\
    for ( ; (elem = elems[i]) != null; i++ ) {\n\
\n\
      if ( !keepData && elem.nodeType === 1 ) {\n\
        jQuery.cleanData( getAll( elem ) );\n\
      }\n\
\n\
      if ( elem.parentNode ) {\n\
        if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {\n\
          setGlobalEval( getAll( elem, \"script\" ) );\n\
        }\n\
        elem.parentNode.removeChild( elem );\n\
      }\n\
    }\n\
\n\
    return this;\n\
  },\n\
\n\
  empty: function() {\n\
    var elem,\n\
      i = 0;\n\
\n\
    for ( ; (elem = this[i]) != null; i++ ) {\n\
      // Remove element nodes and prevent memory leaks\n\
      if ( elem.nodeType === 1 ) {\n\
        jQuery.cleanData( getAll( elem, false ) );\n\
      }\n\
\n\
      // Remove any remaining nodes\n\
      while ( elem.firstChild ) {\n\
        elem.removeChild( elem.firstChild );\n\
      }\n\
\n\
      // If this is a select, ensure that it displays empty (#12336)\n\
      // Support: IE<9\n\
      if ( elem.options && jQuery.nodeName( elem, \"select\" ) ) {\n\
        elem.options.length = 0;\n\
      }\n\
    }\n\
\n\
    return this;\n\
  },\n\
\n\
  clone: function( dataAndEvents, deepDataAndEvents ) {\n\
    dataAndEvents = dataAndEvents == null ? false : dataAndEvents;\n\
    deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;\n\
\n\
    return this.map(function() {\n\
      return jQuery.clone( this, dataAndEvents, deepDataAndEvents );\n\
    });\n\
  },\n\
\n\
  html: function( value ) {\n\
    return access( this, function( value ) {\n\
      var elem = this[ 0 ] || {},\n\
        i = 0,\n\
        l = this.length;\n\
\n\
      if ( value === undefined ) {\n\
        return elem.nodeType === 1 ?\n\
          elem.innerHTML.replace( rinlinejQuery, \"\" ) :\n\
          undefined;\n\
      }\n\
\n\
      // See if we can take a shortcut and just use innerHTML\n\
      if ( typeof value === \"string\" && !rnoInnerhtml.test( value ) &&\n\
        ( support.htmlSerialize || !rnoshimcache.test( value )  ) &&\n\
        ( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&\n\
        !wrapMap[ (rtagName.exec( value ) || [ \"\", \"\" ])[ 1 ].toLowerCase() ] ) {\n\
\n\
        value = value.replace( rxhtmlTag, \"<$1></$2>\" );\n\
\n\
        try {\n\
          for (; i < l; i++ ) {\n\
            // Remove element nodes and prevent memory leaks\n\
            elem = this[i] || {};\n\
            if ( elem.nodeType === 1 ) {\n\
              jQuery.cleanData( getAll( elem, false ) );\n\
              elem.innerHTML = value;\n\
            }\n\
          }\n\
\n\
          elem = 0;\n\
\n\
        // If using innerHTML throws an exception, use the fallback method\n\
        } catch(e) {}\n\
      }\n\
\n\
      if ( elem ) {\n\
        this.empty().append( value );\n\
      }\n\
    }, null, value, arguments.length );\n\
  },\n\
\n\
  replaceWith: function() {\n\
    var arg = arguments[ 0 ];\n\
\n\
    // Make the changes, replacing each context element with the new content\n\
    this.domManip( arguments, function( elem ) {\n\
      arg = this.parentNode;\n\
\n\
      jQuery.cleanData( getAll( this ) );\n\
\n\
      if ( arg ) {\n\
        arg.replaceChild( elem, this );\n\
      }\n\
    });\n\
\n\
    // Force removal if there was no new content (e.g., from empty arguments)\n\
    return arg && (arg.length || arg.nodeType) ? this : this.remove();\n\
  },\n\
\n\
  detach: function( selector ) {\n\
    return this.remove( selector, true );\n\
  },\n\
\n\
  domManip: function( args, callback ) {\n\
\n\
    // Flatten any nested arrays\n\
    args = concat.apply( [], args );\n\
\n\
    var first, node, hasScripts,\n\
      scripts, doc, fragment,\n\
      i = 0,\n\
      l = this.length,\n\
      set = this,\n\
      iNoClone = l - 1,\n\
      value = args[0],\n\
      isFunction = jQuery.isFunction( value );\n\
\n\
    // We can't cloneNode fragments that contain checked, in WebKit\n\
    if ( isFunction ||\n\
        ( l > 1 && typeof value === \"string\" &&\n\
          !support.checkClone && rchecked.test( value ) ) ) {\n\
      return this.each(function( index ) {\n\
        var self = set.eq( index );\n\
        if ( isFunction ) {\n\
          args[0] = value.call( this, index, self.html() );\n\
        }\n\
        self.domManip( args, callback );\n\
      });\n\
    }\n\
\n\
    if ( l ) {\n\
      fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );\n\
      first = fragment.firstChild;\n\
\n\
      if ( fragment.childNodes.length === 1 ) {\n\
        fragment = first;\n\
      }\n\
\n\
      if ( first ) {\n\
        scripts = jQuery.map( getAll( fragment, \"script\" ), disableScript );\n\
        hasScripts = scripts.length;\n\
\n\
        // Use the original fragment for the last item instead of the first because it can end up\n\
        // being emptied incorrectly in certain situations (#8070).\n\
        for ( ; i < l; i++ ) {\n\
          node = fragment;\n\
\n\
          if ( i !== iNoClone ) {\n\
            node = jQuery.clone( node, true, true );\n\
\n\
            // Keep references to cloned scripts for later restoration\n\
            if ( hasScripts ) {\n\
              jQuery.merge( scripts, getAll( node, \"script\" ) );\n\
            }\n\
          }\n\
\n\
          callback.call( this[i], node, i );\n\
        }\n\
\n\
        if ( hasScripts ) {\n\
          doc = scripts[ scripts.length - 1 ].ownerDocument;\n\
\n\
          // Reenable scripts\n\
          jQuery.map( scripts, restoreScript );\n\
\n\
          // Evaluate executable scripts on first document insertion\n\
          for ( i = 0; i < hasScripts; i++ ) {\n\
            node = scripts[ i ];\n\
            if ( rscriptType.test( node.type || \"\" ) &&\n\
              !jQuery._data( node, \"globalEval\" ) && jQuery.contains( doc, node ) ) {\n\
\n\
              if ( node.src ) {\n\
                // Optional AJAX dependency, but won't run scripts if not present\n\
                if ( jQuery._evalUrl ) {\n\
                  jQuery._evalUrl( node.src );\n\
                }\n\
              } else {\n\
                jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || \"\" ).replace( rcleanScript, \"\" ) );\n\
              }\n\
            }\n\
          }\n\
        }\n\
\n\
        // Fix #11809: Avoid leaking memory\n\
        fragment = first = null;\n\
      }\n\
    }\n\
\n\
    return this;\n\
  }\n\
});\n\
\n\
jQuery.each({\n\
  appendTo: \"append\",\n\
  prependTo: \"prepend\",\n\
  insertBefore: \"before\",\n\
  insertAfter: \"after\",\n\
  replaceAll: \"replaceWith\"\n\
}, function( name, original ) {\n\
  jQuery.fn[ name ] = function( selector ) {\n\
    var elems,\n\
      i = 0,\n\
      ret = [],\n\
      insert = jQuery( selector ),\n\
      last = insert.length - 1;\n\
\n\
    for ( ; i <= last; i++ ) {\n\
      elems = i === last ? this : this.clone(true);\n\
      jQuery( insert[i] )[ original ]( elems );\n\
\n\
      // Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()\n\
      push.apply( ret, elems.get() );\n\
    }\n\
\n\
    return this.pushStack( ret );\n\
  };\n\
});\n\
\n\
\n\
var iframe,\n\
  elemdisplay = {};\n\
\n\
/**\n\
 * Retrieve the actual display of a element\n\
 * @param {String} name nodeName of the element\n\
 * @param {Object} doc Document object\n\
 */\n\
// Called only from within defaultDisplay\n\
function actualDisplay( name, doc ) {\n\
  var style,\n\
    elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),\n\
\n\
    // getDefaultComputedStyle might be reliably used only on attached element\n\
    display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?\n\
\n\
      // Use of this method is a temporary fix (more like optmization) until something better comes along,\n\
      // since it was removed from specification and supported only in FF\n\
      style.display : jQuery.css( elem[ 0 ], \"display\" );\n\
\n\
  // We don't have any data stored on the element,\n\
  // so use \"detach\" method as fast way to get rid of the element\n\
  elem.detach();\n\
\n\
  return display;\n\
}\n\
\n\
/**\n\
 * Try to determine the default display value of an element\n\
 * @param {String} nodeName\n\
 */\n\
function defaultDisplay( nodeName ) {\n\
  var doc = document,\n\
    display = elemdisplay[ nodeName ];\n\
\n\
  if ( !display ) {\n\
    display = actualDisplay( nodeName, doc );\n\
\n\
    // If the simple way fails, read from inside an iframe\n\
    if ( display === \"none\" || !display ) {\n\
\n\
      // Use the already-created iframe if possible\n\
      iframe = (iframe || jQuery( \"<iframe frameborder='0' width='0' height='0'/>\" )).appendTo( doc.documentElement );\n\
\n\
      // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse\n\
      doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;\n\
\n\
      // Support: IE\n\
      doc.write();\n\
      doc.close();\n\
\n\
      display = actualDisplay( nodeName, doc );\n\
      iframe.detach();\n\
    }\n\
\n\
    // Store the correct default display\n\
    elemdisplay[ nodeName ] = display;\n\
  }\n\
\n\
  return display;\n\
}\n\
\n\
\n\
(function() {\n\
  var shrinkWrapBlocksVal;\n\
\n\
  support.shrinkWrapBlocks = function() {\n\
    if ( shrinkWrapBlocksVal != null ) {\n\
      return shrinkWrapBlocksVal;\n\
    }\n\
\n\
    // Will be changed later if needed.\n\
    shrinkWrapBlocksVal = false;\n\
\n\
    // Minified: var b,c,d\n\
    var div, body, container;\n\
\n\
    body = document.getElementsByTagName( \"body\" )[ 0 ];\n\
    if ( !body || !body.style ) {\n\
      // Test fired too early or in an unsupported environment, exit.\n\
      return;\n\
    }\n\
\n\
    // Setup\n\
    div = document.createElement( \"div\" );\n\
    container = document.createElement( \"div\" );\n\
    container.style.cssText = \"position:absolute;border:0;width:0;height:0;top:0;left:-9999px\";\n\
    body.appendChild( container ).appendChild( div );\n\
\n\
    // Support: IE6\n\
    // Check if elements with layout shrink-wrap their children\n\
    if ( typeof div.style.zoom !== strundefined ) {\n\
      // Reset CSS: box-sizing; display; margin; border\n\
      div.style.cssText =\n\
        // Support: Firefox<29, Android 2.3\n\
        // Vendor-prefix box-sizing\n\
        \"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;\" +\n\
        \"box-sizing:content-box;display:block;margin:0;border:0;\" +\n\
        \"padding:1px;width:1px;zoom:1\";\n\
      div.appendChild( document.createElement( \"div\" ) ).style.width = \"5px\";\n\
      shrinkWrapBlocksVal = div.offsetWidth !== 3;\n\
    }\n\
\n\
    body.removeChild( container );\n\
\n\
    return shrinkWrapBlocksVal;\n\
  };\n\
\n\
})();\n\
var rmargin = (/^margin/);\n\
\n\
var rnumnonpx = new RegExp( \"^(\" + pnum + \")(?!px)[a-z%]+$\", \"i\" );\n\
\n\
\n\
\n\
var getStyles, curCSS,\n\
  rposition = /^(top|right|bottom|left)$/;\n\
\n\
if ( window.getComputedStyle ) {\n\
  getStyles = function( elem ) {\n\
    return elem.ownerDocument.defaultView.getComputedStyle( elem, null );\n\
  };\n\
\n\
  curCSS = function( elem, name, computed ) {\n\
    var width, minWidth, maxWidth, ret,\n\
      style = elem.style;\n\
\n\
    computed = computed || getStyles( elem );\n\
\n\
    // getPropertyValue is only needed for .css('filter') in IE9, see #12537\n\
    ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;\n\
\n\
    if ( computed ) {\n\
\n\
      if ( ret === \"\" && !jQuery.contains( elem.ownerDocument, elem ) ) {\n\
        ret = jQuery.style( elem, name );\n\
      }\n\
\n\
      // A tribute to the \"awesome hack by Dean Edwards\"\n\
      // Chrome < 17 and Safari 5.0 uses \"computed value\" instead of \"used value\" for margin-right\n\
      // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels\n\
      // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values\n\
      if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {\n\
\n\
        // Remember the original values\n\
        width = style.width;\n\
        minWidth = style.minWidth;\n\
        maxWidth = style.maxWidth;\n\
\n\
        // Put in the new values to get a computed value out\n\
        style.minWidth = style.maxWidth = style.width = ret;\n\
        ret = computed.width;\n\
\n\
        // Revert the changed values\n\
        style.width = width;\n\
        style.minWidth = minWidth;\n\
        style.maxWidth = maxWidth;\n\
      }\n\
    }\n\
\n\
    // Support: IE\n\
    // IE returns zIndex value as an integer.\n\
    return ret === undefined ?\n\
      ret :\n\
      ret + \"\";\n\
  };\n\
} else if ( document.documentElement.currentStyle ) {\n\
  getStyles = function( elem ) {\n\
    return elem.currentStyle;\n\
  };\n\
\n\
  curCSS = function( elem, name, computed ) {\n\
    var left, rs, rsLeft, ret,\n\
      style = elem.style;\n\
\n\
    computed = computed || getStyles( elem );\n\
    ret = computed ? computed[ name ] : undefined;\n\
\n\
    // Avoid setting ret to empty string here\n\
    // so we don't default to auto\n\
    if ( ret == null && style && style[ name ] ) {\n\
      ret = style[ name ];\n\
    }\n\
\n\
    // From the awesome hack by Dean Edwards\n\
    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291\n\
\n\
    // If we're not dealing with a regular pixel number\n\
    // but a number that has a weird ending, we need to convert it to pixels\n\
    // but not position css attributes, as those are proportional to the parent element instead\n\
    // and we can't measure the parent instead because it might trigger a \"stacking dolls\" problem\n\
    if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {\n\
\n\
      // Remember the original values\n\
      left = style.left;\n\
      rs = elem.runtimeStyle;\n\
      rsLeft = rs && rs.left;\n\
\n\
      // Put in the new values to get a computed value out\n\
      if ( rsLeft ) {\n\
        rs.left = elem.currentStyle.left;\n\
      }\n\
      style.left = name === \"fontSize\" ? \"1em\" : ret;\n\
      ret = style.pixelLeft + \"px\";\n\
\n\
      // Revert the changed values\n\
      style.left = left;\n\
      if ( rsLeft ) {\n\
        rs.left = rsLeft;\n\
      }\n\
    }\n\
\n\
    // Support: IE\n\
    // IE returns zIndex value as an integer.\n\
    return ret === undefined ?\n\
      ret :\n\
      ret + \"\" || \"auto\";\n\
  };\n\
}\n\
\n\
\n\
\n\
\n\
function addGetHookIf( conditionFn, hookFn ) {\n\
  // Define the hook, we'll check on the first run if it's really needed.\n\
  return {\n\
    get: function() {\n\
      var condition = conditionFn();\n\
\n\
      if ( condition == null ) {\n\
        // The test was not ready at this point; screw the hook this time\n\
        // but check again when needed next time.\n\
        return;\n\
      }\n\
\n\
      if ( condition ) {\n\
        // Hook not needed (or it's not possible to use it due to missing dependency),\n\
        // remove it.\n\
        // Since there are no other hooks for marginRight, remove the whole object.\n\
        delete this.get;\n\
        return;\n\
      }\n\
\n\
      // Hook needed; redefine it so that the support test is not executed again.\n\
\n\
      return (this.get = hookFn).apply( this, arguments );\n\
    }\n\
  };\n\
}\n\
\n\
\n\
(function() {\n\
  // Minified: var b,c,d,e,f,g, h,i\n\
  var div, style, a, pixelPositionVal, boxSizingReliableVal,\n\
    reliableHiddenOffsetsVal, reliableMarginRightVal;\n\
\n\
  // Setup\n\
  div = document.createElement( \"div\" );\n\
  div.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\
  a = div.getElementsByTagName( \"a\" )[ 0 ];\n\
  style = a && a.style;\n\
\n\
  // Finish early in limited (non-browser) environments\n\
  if ( !style ) {\n\
    return;\n\
  }\n\
\n\
  style.cssText = \"float:left;opacity:.5\";\n\
\n\
  // Support: IE<9\n\
  // Make sure that element opacity exists (as opposed to filter)\n\
  support.opacity = style.opacity === \"0.5\";\n\
\n\
  // Verify style float existence\n\
  // (IE uses styleFloat instead of cssFloat)\n\
  support.cssFloat = !!style.cssFloat;\n\
\n\
  div.style.backgroundClip = \"content-box\";\n\
  div.cloneNode( true ).style.backgroundClip = \"\";\n\
  support.clearCloneStyle = div.style.backgroundClip === \"content-box\";\n\
\n\
  // Support: Firefox<29, Android 2.3\n\
  // Vendor-prefix box-sizing\n\
  support.boxSizing = style.boxSizing === \"\" || style.MozBoxSizing === \"\" ||\n\
    style.WebkitBoxSizing === \"\";\n\
\n\
  jQuery.extend(support, {\n\
    reliableHiddenOffsets: function() {\n\
      if ( reliableHiddenOffsetsVal == null ) {\n\
        computeStyleTests();\n\
      }\n\
      return reliableHiddenOffsetsVal;\n\
    },\n\
\n\
    boxSizingReliable: function() {\n\
      if ( boxSizingReliableVal == null ) {\n\
        computeStyleTests();\n\
      }\n\
      return boxSizingReliableVal;\n\
    },\n\
\n\
    pixelPosition: function() {\n\
      if ( pixelPositionVal == null ) {\n\
        computeStyleTests();\n\
      }\n\
      return pixelPositionVal;\n\
    },\n\
\n\
    // Support: Android 2.3\n\
    reliableMarginRight: function() {\n\
      if ( reliableMarginRightVal == null ) {\n\
        computeStyleTests();\n\
      }\n\
      return reliableMarginRightVal;\n\
    }\n\
  });\n\
\n\
  function computeStyleTests() {\n\
    // Minified: var b,c,d,j\n\
    var div, body, container, contents;\n\
\n\
    body = document.getElementsByTagName( \"body\" )[ 0 ];\n\
    if ( !body || !body.style ) {\n\
      // Test fired too early or in an unsupported environment, exit.\n\
      return;\n\
    }\n\
\n\
    // Setup\n\
    div = document.createElement( \"div\" );\n\
    container = document.createElement( \"div\" );\n\
    container.style.cssText = \"position:absolute;border:0;width:0;height:0;top:0;left:-9999px\";\n\
    body.appendChild( container ).appendChild( div );\n\
\n\
    div.style.cssText =\n\
      // Support: Firefox<29, Android 2.3\n\
      // Vendor-prefix box-sizing\n\
      \"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;\" +\n\
      \"box-sizing:border-box;display:block;margin-top:1%;top:1%;\" +\n\
      \"border:1px;padding:1px;width:4px;position:absolute\";\n\
\n\
    // Support: IE<9\n\
    // Assume reasonable values in the absence of getComputedStyle\n\
    pixelPositionVal = boxSizingReliableVal = false;\n\
    reliableMarginRightVal = true;\n\
\n\
    // Check for getComputedStyle so that this code is not run in IE<9.\n\
    if ( window.getComputedStyle ) {\n\
      pixelPositionVal = ( window.getComputedStyle( div, null ) || {} ).top !== \"1%\";\n\
      boxSizingReliableVal =\n\
        ( window.getComputedStyle( div, null ) || { width: \"4px\" } ).width === \"4px\";\n\
\n\
      // Support: Android 2.3\n\
      // Div with explicit width and no margin-right incorrectly\n\
      // gets computed margin-right based on width of container (#3333)\n\
      // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
      contents = div.appendChild( document.createElement( \"div\" ) );\n\
\n\
      // Reset CSS: box-sizing; display; margin; border; padding\n\
      contents.style.cssText = div.style.cssText =\n\
        // Support: Firefox<29, Android 2.3\n\
        // Vendor-prefix box-sizing\n\
        \"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;\" +\n\
        \"box-sizing:content-box;display:block;margin:0;border:0;padding:0\";\n\
      contents.style.marginRight = contents.style.width = \"0\";\n\
      div.style.width = \"1px\";\n\
\n\
      reliableMarginRightVal =\n\
        !parseFloat( ( window.getComputedStyle( contents, null ) || {} ).marginRight );\n\
    }\n\
\n\
    // Support: IE8\n\
    // Check if table cells still have offsetWidth/Height when they are set\n\
    // to display:none and there are still other visible table cells in a\n\
    // table row; if so, offsetWidth/Height are not reliable for use when\n\
    // determining if an element has been hidden directly using\n\
    // display:none (it is still safe to use offsets if a parent element is\n\
    // hidden; don safety goggles and see bug #4512 for more information).\n\
    div.innerHTML = \"<table><tr><td></td><td>t</td></tr></table>\";\n\
    contents = div.getElementsByTagName( \"td\" );\n\
    contents[ 0 ].style.cssText = \"margin:0;border:0;padding:0;display:none\";\n\
    reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;\n\
    if ( reliableHiddenOffsetsVal ) {\n\
      contents[ 0 ].style.display = \"\";\n\
      contents[ 1 ].style.display = \"none\";\n\
      reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;\n\
    }\n\
\n\
    body.removeChild( container );\n\
  }\n\
\n\
})();\n\
\n\
\n\
// A method for quickly swapping in/out CSS properties to get correct calculations.\n\
jQuery.swap = function( elem, options, callback, args ) {\n\
  var ret, name,\n\
    old = {};\n\
\n\
  // Remember the old values, and insert the new ones\n\
  for ( name in options ) {\n\
    old[ name ] = elem.style[ name ];\n\
    elem.style[ name ] = options[ name ];\n\
  }\n\
\n\
  ret = callback.apply( elem, args || [] );\n\
\n\
  // Revert the old values\n\
  for ( name in options ) {\n\
    elem.style[ name ] = old[ name ];\n\
  }\n\
\n\
  return ret;\n\
};\n\
\n\
\n\
var\n\
    ralpha = /alpha\\([^)]*\\)/i,\n\
  ropacity = /opacity\\s*=\\s*([^)]*)/,\n\
\n\
  // swappable if display is none or starts with table except \"table\", \"table-cell\", or \"table-caption\"\n\
  // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display\n\
  rdisplayswap = /^(none|table(?!-c[ea]).+)/,\n\
  rnumsplit = new RegExp( \"^(\" + pnum + \")(.*)$\", \"i\" ),\n\
  rrelNum = new RegExp( \"^([+-])=(\" + pnum + \")\", \"i\" ),\n\
\n\
  cssShow = { position: \"absolute\", visibility: \"hidden\", display: \"block\" },\n\
  cssNormalTransform = {\n\
    letterSpacing: \"0\",\n\
    fontWeight: \"400\"\n\
  },\n\
\n\
  cssPrefixes = [ \"Webkit\", \"O\", \"Moz\", \"ms\" ];\n\
\n\
\n\
// return a css property mapped to a potentially vendor prefixed property\n\
function vendorPropName( style, name ) {\n\
\n\
  // shortcut for names that are not vendor prefixed\n\
  if ( name in style ) {\n\
    return name;\n\
  }\n\
\n\
  // check for vendor prefixed names\n\
  var capName = name.charAt(0).toUpperCase() + name.slice(1),\n\
    origName = name,\n\
    i = cssPrefixes.length;\n\
\n\
  while ( i-- ) {\n\
    name = cssPrefixes[ i ] + capName;\n\
    if ( name in style ) {\n\
      return name;\n\
    }\n\
  }\n\
\n\
  return origName;\n\
}\n\
\n\
function showHide( elements, show ) {\n\
  var display, elem, hidden,\n\
    values = [],\n\
    index = 0,\n\
    length = elements.length;\n\
\n\
  for ( ; index < length; index++ ) {\n\
    elem = elements[ index ];\n\
    if ( !elem.style ) {\n\
      continue;\n\
    }\n\
\n\
    values[ index ] = jQuery._data( elem, \"olddisplay\" );\n\
    display = elem.style.display;\n\
    if ( show ) {\n\
      // Reset the inline display of this element to learn if it is\n\
      // being hidden by cascaded rules or not\n\
      if ( !values[ index ] && display === \"none\" ) {\n\
        elem.style.display = \"\";\n\
      }\n\
\n\
      // Set elements which have been overridden with display: none\n\
      // in a stylesheet to whatever the default browser style is\n\
      // for such an element\n\
      if ( elem.style.display === \"\" && isHidden( elem ) ) {\n\
        values[ index ] = jQuery._data( elem, \"olddisplay\", defaultDisplay(elem.nodeName) );\n\
      }\n\
    } else {\n\
      hidden = isHidden( elem );\n\
\n\
      if ( display && display !== \"none\" || !hidden ) {\n\
        jQuery._data( elem, \"olddisplay\", hidden ? display : jQuery.css( elem, \"display\" ) );\n\
      }\n\
    }\n\
  }\n\
\n\
  // Set the display of most of the elements in a second loop\n\
  // to avoid the constant reflow\n\
  for ( index = 0; index < length; index++ ) {\n\
    elem = elements[ index ];\n\
    if ( !elem.style ) {\n\
      continue;\n\
    }\n\
    if ( !show || elem.style.display === \"none\" || elem.style.display === \"\" ) {\n\
      elem.style.display = show ? values[ index ] || \"\" : \"none\";\n\
    }\n\
  }\n\
\n\
  return elements;\n\
}\n\
\n\
function setPositiveNumber( elem, value, subtract ) {\n\
  var matches = rnumsplit.exec( value );\n\
  return matches ?\n\
    // Guard against undefined \"subtract\", e.g., when used as in cssHooks\n\
    Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || \"px\" ) :\n\
    value;\n\
}\n\
\n\
function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {\n\
  var i = extra === ( isBorderBox ? \"border\" : \"content\" ) ?\n\
    // If we already have the right measurement, avoid augmentation\n\
    4 :\n\
    // Otherwise initialize for horizontal or vertical properties\n\
    name === \"width\" ? 1 : 0,\n\
\n\
    val = 0;\n\
\n\
  for ( ; i < 4; i += 2 ) {\n\
    // both box models exclude margin, so add it if we want it\n\
    if ( extra === \"margin\" ) {\n\
      val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );\n\
    }\n\
\n\
    if ( isBorderBox ) {\n\
      // border-box includes padding, so remove it if we want content\n\
      if ( extra === \"content\" ) {\n\
        val -= jQuery.css( elem, \"padding\" + cssExpand[ i ], true, styles );\n\
      }\n\
\n\
      // at this point, extra isn't border nor margin, so remove border\n\
      if ( extra !== \"margin\" ) {\n\
        val -= jQuery.css( elem, \"border\" + cssExpand[ i ] + \"Width\", true, styles );\n\
      }\n\
    } else {\n\
      // at this point, extra isn't content, so add padding\n\
      val += jQuery.css( elem, \"padding\" + cssExpand[ i ], true, styles );\n\
\n\
      // at this point, extra isn't content nor padding, so add border\n\
      if ( extra !== \"padding\" ) {\n\
        val += jQuery.css( elem, \"border\" + cssExpand[ i ] + \"Width\", true, styles );\n\
      }\n\
    }\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
function getWidthOrHeight( elem, name, extra ) {\n\
\n\
  // Start with offset property, which is equivalent to the border-box value\n\
  var valueIsBorderBox = true,\n\
    val = name === \"width\" ? elem.offsetWidth : elem.offsetHeight,\n\
    styles = getStyles( elem ),\n\
    isBorderBox = support.boxSizing && jQuery.css( elem, \"boxSizing\", false, styles ) === \"border-box\";\n\
\n\
  // some non-html elements return undefined for offsetWidth, so check for null/undefined\n\
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285\n\
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668\n\
  if ( val <= 0 || val == null ) {\n\
    // Fall back to computed then uncomputed css if necessary\n\
    val = curCSS( elem, name, styles );\n\
    if ( val < 0 || val == null ) {\n\
      val = elem.style[ name ];\n\
    }\n\
\n\
    // Computed unit is not pixels. Stop here and return.\n\
    if ( rnumnonpx.test(val) ) {\n\
      return val;\n\
    }\n\
\n\
    // we need the check for style in case a browser which returns unreliable values\n\
    // for getComputedStyle silently falls back to the reliable elem.style\n\
    valueIsBorderBox = isBorderBox && ( support.boxSizingReliable() || val === elem.style[ name ] );\n\
\n\
    // Normalize \"\", auto, and prepare for extra\n\
    val = parseFloat( val ) || 0;\n\
  }\n\
\n\
  // use the active box-sizing model to add/subtract irrelevant styles\n\
  return ( val +\n\
    augmentWidthOrHeight(\n\
      elem,\n\
      name,\n\
      extra || ( isBorderBox ? \"border\" : \"content\" ),\n\
      valueIsBorderBox,\n\
      styles\n\
    )\n\
  ) + \"px\";\n\
}\n\
\n\
jQuery.extend({\n\
  // Add in style property hooks for overriding the default\n\
  // behavior of getting and setting a style property\n\
  cssHooks: {\n\
    opacity: {\n\
      get: function( elem, computed ) {\n\
        if ( computed ) {\n\
          // We should always get a number back from opacity\n\
          var ret = curCSS( elem, \"opacity\" );\n\
          return ret === \"\" ? \"1\" : ret;\n\
        }\n\
      }\n\
    }\n\
  },\n\
\n\
  // Don't automatically add \"px\" to these possibly-unitless properties\n\
  cssNumber: {\n\
    \"columnCount\": true,\n\
    \"fillOpacity\": true,\n\
    \"flexGrow\": true,\n\
    \"flexShrink\": true,\n\
    \"fontWeight\": true,\n\
    \"lineHeight\": true,\n\
    \"opacity\": true,\n\
    \"order\": true,\n\
    \"orphans\": true,\n\
    \"widows\": true,\n\
    \"zIndex\": true,\n\
    \"zoom\": true\n\
  },\n\
\n\
  // Add in properties whose names you wish to fix before\n\
  // setting or getting the value\n\
  cssProps: {\n\
    // normalize float css property\n\
    \"float\": support.cssFloat ? \"cssFloat\" : \"styleFloat\"\n\
  },\n\
\n\
  // Get and set the style property on a DOM Node\n\
  style: function( elem, name, value, extra ) {\n\
    // Don't set styles on text and comment nodes\n\
    if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {\n\
      return;\n\
    }\n\
\n\
    // Make sure that we're working with the right name\n\
    var ret, type, hooks,\n\
      origName = jQuery.camelCase( name ),\n\
      style = elem.style;\n\
\n\
    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );\n\
\n\
    // gets hook for the prefixed version\n\
    // followed by the unprefixed version\n\
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];\n\
\n\
    // Check if we're setting a value\n\
    if ( value !== undefined ) {\n\
      type = typeof value;\n\
\n\
      // convert relative number strings (+= or -=) to relative numbers. #7345\n\
      if ( type === \"string\" && (ret = rrelNum.exec( value )) ) {\n\
        value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );\n\
        // Fixes bug #9237\n\
        type = \"number\";\n\
      }\n\
\n\
      // Make sure that null and NaN values aren't set. See: #7116\n\
      if ( value == null || value !== value ) {\n\
        return;\n\
      }\n\
\n\
      // If a number was passed in, add 'px' to the (except for certain CSS properties)\n\
      if ( type === \"number\" && !jQuery.cssNumber[ origName ] ) {\n\
        value += \"px\";\n\
      }\n\
\n\
      // Fixes #8908, it can be done more correctly by specifing setters in cssHooks,\n\
      // but it would mean to define eight (for every problematic property) identical functions\n\
      if ( !support.clearCloneStyle && value === \"\" && name.indexOf(\"background\") === 0 ) {\n\
        style[ name ] = \"inherit\";\n\
      }\n\
\n\
      // If a hook was provided, use that value, otherwise just set the specified value\n\
      if ( !hooks || !(\"set\" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {\n\
\n\
        // Support: IE\n\
        // Swallow errors from 'invalid' CSS values (#5509)\n\
        try {\n\
          style[ name ] = value;\n\
        } catch(e) {}\n\
      }\n\
\n\
    } else {\n\
      // If a hook was provided get the non-computed value from there\n\
      if ( hooks && \"get\" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {\n\
        return ret;\n\
      }\n\
\n\
      // Otherwise just get the value from the style object\n\
      return style[ name ];\n\
    }\n\
  },\n\
\n\
  css: function( elem, name, extra, styles ) {\n\
    var num, val, hooks,\n\
      origName = jQuery.camelCase( name );\n\
\n\
    // Make sure that we're working with the right name\n\
    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );\n\
\n\
    // gets hook for the prefixed version\n\
    // followed by the unprefixed version\n\
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];\n\
\n\
    // If a hook was provided get the computed value from there\n\
    if ( hooks && \"get\" in hooks ) {\n\
      val = hooks.get( elem, true, extra );\n\
    }\n\
\n\
    // Otherwise, if a way to get the computed value exists, use that\n\
    if ( val === undefined ) {\n\
      val = curCSS( elem, name, styles );\n\
    }\n\
\n\
    //convert \"normal\" to computed value\n\
    if ( val === \"normal\" && name in cssNormalTransform ) {\n\
      val = cssNormalTransform[ name ];\n\
    }\n\
\n\
    // Return, converting to number if forced or a qualifier was provided and val looks numeric\n\
    if ( extra === \"\" || extra ) {\n\
      num = parseFloat( val );\n\
      return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;\n\
    }\n\
    return val;\n\
  }\n\
});\n\
\n\
jQuery.each([ \"height\", \"width\" ], function( i, name ) {\n\
  jQuery.cssHooks[ name ] = {\n\
    get: function( elem, computed, extra ) {\n\
      if ( computed ) {\n\
        // certain elements can have dimension info if we invisibly show them\n\
        // however, it must have a current display style that would benefit from this\n\
        return rdisplayswap.test( jQuery.css( elem, \"display\" ) ) && elem.offsetWidth === 0 ?\n\
          jQuery.swap( elem, cssShow, function() {\n\
            return getWidthOrHeight( elem, name, extra );\n\
          }) :\n\
          getWidthOrHeight( elem, name, extra );\n\
      }\n\
    },\n\
\n\
    set: function( elem, value, extra ) {\n\
      var styles = extra && getStyles( elem );\n\
      return setPositiveNumber( elem, value, extra ?\n\
        augmentWidthOrHeight(\n\
          elem,\n\
          name,\n\
          extra,\n\
          support.boxSizing && jQuery.css( elem, \"boxSizing\", false, styles ) === \"border-box\",\n\
          styles\n\
        ) : 0\n\
      );\n\
    }\n\
  };\n\
});\n\
\n\
if ( !support.opacity ) {\n\
  jQuery.cssHooks.opacity = {\n\
    get: function( elem, computed ) {\n\
      // IE uses filters for opacity\n\
      return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || \"\" ) ?\n\
        ( 0.01 * parseFloat( RegExp.$1 ) ) + \"\" :\n\
        computed ? \"1\" : \"\";\n\
    },\n\
\n\
    set: function( elem, value ) {\n\
      var style = elem.style,\n\
        currentStyle = elem.currentStyle,\n\
        opacity = jQuery.isNumeric( value ) ? \"alpha(opacity=\" + value * 100 + \")\" : \"\",\n\
        filter = currentStyle && currentStyle.filter || style.filter || \"\";\n\
\n\
      // IE has trouble with opacity if it does not have layout\n\
      // Force it by setting the zoom level\n\
      style.zoom = 1;\n\
\n\
      // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652\n\
      // if value === \"\", then remove inline opacity #12685\n\
      if ( ( value >= 1 || value === \"\" ) &&\n\
          jQuery.trim( filter.replace( ralpha, \"\" ) ) === \"\" &&\n\
          style.removeAttribute ) {\n\
\n\
        // Setting style.filter to null, \"\" & \" \" still leave \"filter:\" in the cssText\n\
        // if \"filter:\" is present at all, clearType is disabled, we want to avoid this\n\
        // style.removeAttribute is IE Only, but so apparently is this code path...\n\
        style.removeAttribute( \"filter\" );\n\
\n\
        // if there is no filter style applied in a css rule or unset inline opacity, we are done\n\
        if ( value === \"\" || currentStyle && !currentStyle.filter ) {\n\
          return;\n\
        }\n\
      }\n\
\n\
      // otherwise, set new filter values\n\
      style.filter = ralpha.test( filter ) ?\n\
        filter.replace( ralpha, opacity ) :\n\
        filter + \" \" + opacity;\n\
    }\n\
  };\n\
}\n\
\n\
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,\n\
  function( elem, computed ) {\n\
    if ( computed ) {\n\
      // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
      // Work around by temporarily setting element display to inline-block\n\
      return jQuery.swap( elem, { \"display\": \"inline-block\" },\n\
        curCSS, [ elem, \"marginRight\" ] );\n\
    }\n\
  }\n\
);\n\
\n\
// These hooks are used by animate to expand properties\n\
jQuery.each({\n\
  margin: \"\",\n\
  padding: \"\",\n\
  border: \"Width\"\n\
}, function( prefix, suffix ) {\n\
  jQuery.cssHooks[ prefix + suffix ] = {\n\
    expand: function( value ) {\n\
      var i = 0,\n\
        expanded = {},\n\
\n\
        // assumes a single number if not a string\n\
        parts = typeof value === \"string\" ? value.split(\" \") : [ value ];\n\
\n\
      for ( ; i < 4; i++ ) {\n\
        expanded[ prefix + cssExpand[ i ] + suffix ] =\n\
          parts[ i ] || parts[ i - 2 ] || parts[ 0 ];\n\
      }\n\
\n\
      return expanded;\n\
    }\n\
  };\n\
\n\
  if ( !rmargin.test( prefix ) ) {\n\
    jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;\n\
  }\n\
});\n\
\n\
jQuery.fn.extend({\n\
  css: function( name, value ) {\n\
    return access( this, function( elem, name, value ) {\n\
      var styles, len,\n\
        map = {},\n\
        i = 0;\n\
\n\
      if ( jQuery.isArray( name ) ) {\n\
        styles = getStyles( elem );\n\
        len = name.length;\n\
\n\
        for ( ; i < len; i++ ) {\n\
          map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );\n\
        }\n\
\n\
        return map;\n\
      }\n\
\n\
      return value !== undefined ?\n\
        jQuery.style( elem, name, value ) :\n\
        jQuery.css( elem, name );\n\
    }, name, value, arguments.length > 1 );\n\
  },\n\
  show: function() {\n\
    return showHide( this, true );\n\
  },\n\
  hide: function() {\n\
    return showHide( this );\n\
  },\n\
  toggle: function( state ) {\n\
    if ( typeof state === \"boolean\" ) {\n\
      return state ? this.show() : this.hide();\n\
    }\n\
\n\
    return this.each(function() {\n\
      if ( isHidden( this ) ) {\n\
        jQuery( this ).show();\n\
      } else {\n\
        jQuery( this ).hide();\n\
      }\n\
    });\n\
  }\n\
});\n\
\n\
\n\
function Tween( elem, options, prop, end, easing ) {\n\
  return new Tween.prototype.init( elem, options, prop, end, easing );\n\
}\n\
jQuery.Tween = Tween;\n\
\n\
Tween.prototype = {\n\
  constructor: Tween,\n\
  init: function( elem, options, prop, end, easing, unit ) {\n\
    this.elem = elem;\n\
    this.prop = prop;\n\
    this.easing = easing || \"swing\";\n\
    this.options = options;\n\
    this.start = this.now = this.cur();\n\
    this.end = end;\n\
    this.unit = unit || ( jQuery.cssNumber[ prop ] ? \"\" : \"px\" );\n\
  },\n\
  cur: function() {\n\
    var hooks = Tween.propHooks[ this.prop ];\n\
\n\
    return hooks && hooks.get ?\n\
      hooks.get( this ) :\n\
      Tween.propHooks._default.get( this );\n\
  },\n\
  run: function( percent ) {\n\
    var eased,\n\
      hooks = Tween.propHooks[ this.prop ];\n\
\n\
    if ( this.options.duration ) {\n\
      this.pos = eased = jQuery.easing[ this.easing ](\n\
        percent, this.options.duration * percent, 0, 1, this.options.duration\n\
      );\n\
    } else {\n\
      this.pos = eased = percent;\n\
    }\n\
    this.now = ( this.end - this.start ) * eased + this.start;\n\
\n\
    if ( this.options.step ) {\n\
      this.options.step.call( this.elem, this.now, this );\n\
    }\n\
\n\
    if ( hooks && hooks.set ) {\n\
      hooks.set( this );\n\
    } else {\n\
      Tween.propHooks._default.set( this );\n\
    }\n\
    return this;\n\
  }\n\
};\n\
\n\
Tween.prototype.init.prototype = Tween.prototype;\n\
\n\
Tween.propHooks = {\n\
  _default: {\n\
    get: function( tween ) {\n\
      var result;\n\
\n\
      if ( tween.elem[ tween.prop ] != null &&\n\
        (!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {\n\
        return tween.elem[ tween.prop ];\n\
      }\n\
\n\
      // passing an empty string as a 3rd parameter to .css will automatically\n\
      // attempt a parseFloat and fallback to a string if the parse fails\n\
      // so, simple values such as \"10px\" are parsed to Float.\n\
      // complex values such as \"rotate(1rad)\" are returned as is.\n\
      result = jQuery.css( tween.elem, tween.prop, \"\" );\n\
      // Empty strings, null, undefined and \"auto\" are converted to 0.\n\
      return !result || result === \"auto\" ? 0 : result;\n\
    },\n\
    set: function( tween ) {\n\
      // use step hook for back compat - use cssHook if its there - use .style if its\n\
      // available and use plain properties where available\n\
      if ( jQuery.fx.step[ tween.prop ] ) {\n\
        jQuery.fx.step[ tween.prop ]( tween );\n\
      } else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {\n\
        jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );\n\
      } else {\n\
        tween.elem[ tween.prop ] = tween.now;\n\
      }\n\
    }\n\
  }\n\
};\n\
\n\
// Support: IE <=9\n\
// Panic based approach to setting things on disconnected nodes\n\
\n\
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {\n\
  set: function( tween ) {\n\
    if ( tween.elem.nodeType && tween.elem.parentNode ) {\n\
      tween.elem[ tween.prop ] = tween.now;\n\
    }\n\
  }\n\
};\n\
\n\
jQuery.easing = {\n\
  linear: function( p ) {\n\
    return p;\n\
  },\n\
  swing: function( p ) {\n\
    return 0.5 - Math.cos( p * Math.PI ) / 2;\n\
  }\n\
};\n\
\n\
jQuery.fx = Tween.prototype.init;\n\
\n\
// Back Compat <1.8 extension point\n\
jQuery.fx.step = {};\n\
\n\
\n\
\n\
\n\
var\n\
  fxNow, timerId,\n\
  rfxtypes = /^(?:toggle|show|hide)$/,\n\
  rfxnum = new RegExp( \"^(?:([+-])=|)(\" + pnum + \")([a-z%]*)$\", \"i\" ),\n\
  rrun = /queueHooks$/,\n\
  animationPrefilters = [ defaultPrefilter ],\n\
  tweeners = {\n\
    \"*\": [ function( prop, value ) {\n\
      var tween = this.createTween( prop, value ),\n\
        target = tween.cur(),\n\
        parts = rfxnum.exec( value ),\n\
        unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? \"\" : \"px\" ),\n\
\n\
        // Starting value computation is required for potential unit mismatches\n\
        start = ( jQuery.cssNumber[ prop ] || unit !== \"px\" && +target ) &&\n\
          rfxnum.exec( jQuery.css( tween.elem, prop ) ),\n\
        scale = 1,\n\
        maxIterations = 20;\n\
\n\
      if ( start && start[ 3 ] !== unit ) {\n\
        // Trust units reported by jQuery.css\n\
        unit = unit || start[ 3 ];\n\
\n\
        // Make sure we update the tween properties later on\n\
        parts = parts || [];\n\
\n\
        // Iteratively approximate from a nonzero starting point\n\
        start = +target || 1;\n\
\n\
        do {\n\
          // If previous iteration zeroed out, double until we get *something*\n\
          // Use a string for doubling factor so we don't accidentally see scale as unchanged below\n\
          scale = scale || \".5\";\n\
\n\
          // Adjust and apply\n\
          start = start / scale;\n\
          jQuery.style( tween.elem, prop, start + unit );\n\
\n\
        // Update scale, tolerating zero or NaN from tween.cur()\n\
        // And breaking the loop if scale is unchanged or perfect, or if we've just had enough\n\
        } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );\n\
      }\n\
\n\
      // Update tween properties\n\
      if ( parts ) {\n\
        start = tween.start = +start || +target || 0;\n\
        tween.unit = unit;\n\
        // If a +=/-= token was provided, we're doing a relative animation\n\
        tween.end = parts[ 1 ] ?\n\
          start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :\n\
          +parts[ 2 ];\n\
      }\n\
\n\
      return tween;\n\
    } ]\n\
  };\n\
\n\
// Animations created synchronously will run synchronously\n\
function createFxNow() {\n\
  setTimeout(function() {\n\
    fxNow = undefined;\n\
  });\n\
  return ( fxNow = jQuery.now() );\n\
}\n\
\n\
// Generate parameters to create a standard animation\n\
function genFx( type, includeWidth ) {\n\
  var which,\n\
    attrs = { height: type },\n\
    i = 0;\n\
\n\
  // if we include width, step value is 1 to do all cssExpand values,\n\
  // if we don't include width, step value is 2 to skip over Left and Right\n\
  includeWidth = includeWidth ? 1 : 0;\n\
  for ( ; i < 4 ; i += 2 - includeWidth ) {\n\
    which = cssExpand[ i ];\n\
    attrs[ \"margin\" + which ] = attrs[ \"padding\" + which ] = type;\n\
  }\n\
\n\
  if ( includeWidth ) {\n\
    attrs.opacity = attrs.width = type;\n\
  }\n\
\n\
  return attrs;\n\
}\n\
\n\
function createTween( value, prop, animation ) {\n\
  var tween,\n\
    collection = ( tweeners[ prop ] || [] ).concat( tweeners[ \"*\" ] ),\n\
    index = 0,\n\
    length = collection.length;\n\
  for ( ; index < length; index++ ) {\n\
    if ( (tween = collection[ index ].call( animation, prop, value )) ) {\n\
\n\
      // we're done with this property\n\
      return tween;\n\
    }\n\
  }\n\
}\n\
\n\
function defaultPrefilter( elem, props, opts ) {\n\
  /* jshint validthis: true */\n\
  var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,\n\
    anim = this,\n\
    orig = {},\n\
    style = elem.style,\n\
    hidden = elem.nodeType && isHidden( elem ),\n\
    dataShow = jQuery._data( elem, \"fxshow\" );\n\
\n\
  // handle queue: false promises\n\
  if ( !opts.queue ) {\n\
    hooks = jQuery._queueHooks( elem, \"fx\" );\n\
    if ( hooks.unqueued == null ) {\n\
      hooks.unqueued = 0;\n\
      oldfire = hooks.empty.fire;\n\
      hooks.empty.fire = function() {\n\
        if ( !hooks.unqueued ) {\n\
          oldfire();\n\
        }\n\
      };\n\
    }\n\
    hooks.unqueued++;\n\
\n\
    anim.always(function() {\n\
      // doing this makes sure that the complete handler will be called\n\
      // before this completes\n\
      anim.always(function() {\n\
        hooks.unqueued--;\n\
        if ( !jQuery.queue( elem, \"fx\" ).length ) {\n\
          hooks.empty.fire();\n\
        }\n\
      });\n\
    });\n\
  }\n\
\n\
  // height/width overflow pass\n\
  if ( elem.nodeType === 1 && ( \"height\" in props || \"width\" in props ) ) {\n\
    // Make sure that nothing sneaks out\n\
    // Record all 3 overflow attributes because IE does not\n\
    // change the overflow attribute when overflowX and\n\
    // overflowY are set to the same value\n\
    opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];\n\
\n\
    // Set display property to inline-block for height/width\n\
    // animations on inline elements that are having width/height animated\n\
    display = jQuery.css( elem, \"display\" );\n\
\n\
    // Test default display if display is currently \"none\"\n\
    checkDisplay = display === \"none\" ?\n\
      jQuery._data( elem, \"olddisplay\" ) || defaultDisplay( elem.nodeName ) : display;\n\
\n\
    if ( checkDisplay === \"inline\" && jQuery.css( elem, \"float\" ) === \"none\" ) {\n\
\n\
      // inline-level elements accept inline-block;\n\
      // block-level elements need to be inline with layout\n\
      if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === \"inline\" ) {\n\
        style.display = \"inline-block\";\n\
      } else {\n\
        style.zoom = 1;\n\
      }\n\
    }\n\
  }\n\
\n\
  if ( opts.overflow ) {\n\
    style.overflow = \"hidden\";\n\
    if ( !support.shrinkWrapBlocks() ) {\n\
      anim.always(function() {\n\
        style.overflow = opts.overflow[ 0 ];\n\
        style.overflowX = opts.overflow[ 1 ];\n\
        style.overflowY = opts.overflow[ 2 ];\n\
      });\n\
    }\n\
  }\n\
\n\
  // show/hide pass\n\
  for ( prop in props ) {\n\
    value = props[ prop ];\n\
    if ( rfxtypes.exec( value ) ) {\n\
      delete props[ prop ];\n\
      toggle = toggle || value === \"toggle\";\n\
      if ( value === ( hidden ? \"hide\" : \"show\" ) ) {\n\
\n\
        // If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden\n\
        if ( value === \"show\" && dataShow && dataShow[ prop ] !== undefined ) {\n\
          hidden = true;\n\
        } else {\n\
          continue;\n\
        }\n\
      }\n\
      orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );\n\
\n\
    // Any non-fx value stops us from restoring the original display value\n\
    } else {\n\
      display = undefined;\n\
    }\n\
  }\n\
\n\
  if ( !jQuery.isEmptyObject( orig ) ) {\n\
    if ( dataShow ) {\n\
      if ( \"hidden\" in dataShow ) {\n\
        hidden = dataShow.hidden;\n\
      }\n\
    } else {\n\
      dataShow = jQuery._data( elem, \"fxshow\", {} );\n\
    }\n\
\n\
    // store state if its toggle - enables .stop().toggle() to \"reverse\"\n\
    if ( toggle ) {\n\
      dataShow.hidden = !hidden;\n\
    }\n\
    if ( hidden ) {\n\
      jQuery( elem ).show();\n\
    } else {\n\
      anim.done(function() {\n\
        jQuery( elem ).hide();\n\
      });\n\
    }\n\
    anim.done(function() {\n\
      var prop;\n\
      jQuery._removeData( elem, \"fxshow\" );\n\
      for ( prop in orig ) {\n\
        jQuery.style( elem, prop, orig[ prop ] );\n\
      }\n\
    });\n\
    for ( prop in orig ) {\n\
      tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );\n\
\n\
      if ( !( prop in dataShow ) ) {\n\
        dataShow[ prop ] = tween.start;\n\
        if ( hidden ) {\n\
          tween.end = tween.start;\n\
          tween.start = prop === \"width\" || prop === \"height\" ? 1 : 0;\n\
        }\n\
      }\n\
    }\n\
\n\
  // If this is a noop like .hide().hide(), restore an overwritten display value\n\
  } else if ( (display === \"none\" ? defaultDisplay( elem.nodeName ) : display) === \"inline\" ) {\n\
    style.display = display;\n\
  }\n\
}\n\
\n\
function propFilter( props, specialEasing ) {\n\
  var index, name, easing, value, hooks;\n\
\n\
  // camelCase, specialEasing and expand cssHook pass\n\
  for ( index in props ) {\n\
    name = jQuery.camelCase( index );\n\
    easing = specialEasing[ name ];\n\
    value = props[ index ];\n\
    if ( jQuery.isArray( value ) ) {\n\
      easing = value[ 1 ];\n\
      value = props[ index ] = value[ 0 ];\n\
    }\n\
\n\
    if ( index !== name ) {\n\
      props[ name ] = value;\n\
      delete props[ index ];\n\
    }\n\
\n\
    hooks = jQuery.cssHooks[ name ];\n\
    if ( hooks && \"expand\" in hooks ) {\n\
      value = hooks.expand( value );\n\
      delete props[ name ];\n\
\n\
      // not quite $.extend, this wont overwrite keys already present.\n\
      // also - reusing 'index' from above because we have the correct \"name\"\n\
      for ( index in value ) {\n\
        if ( !( index in props ) ) {\n\
          props[ index ] = value[ index ];\n\
          specialEasing[ index ] = easing;\n\
        }\n\
      }\n\
    } else {\n\
      specialEasing[ name ] = easing;\n\
    }\n\
  }\n\
}\n\
\n\
function Animation( elem, properties, options ) {\n\
  var result,\n\
    stopped,\n\
    index = 0,\n\
    length = animationPrefilters.length,\n\
    deferred = jQuery.Deferred().always( function() {\n\
      // don't match elem in the :animated selector\n\
      delete tick.elem;\n\
    }),\n\
    tick = function() {\n\
      if ( stopped ) {\n\
        return false;\n\
      }\n\
      var currentTime = fxNow || createFxNow(),\n\
        remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),\n\
        // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)\n\
        temp = remaining / animation.duration || 0,\n\
        percent = 1 - temp,\n\
        index = 0,\n\
        length = animation.tweens.length;\n\
\n\
      for ( ; index < length ; index++ ) {\n\
        animation.tweens[ index ].run( percent );\n\
      }\n\
\n\
      deferred.notifyWith( elem, [ animation, percent, remaining ]);\n\
\n\
      if ( percent < 1 && length ) {\n\
        return remaining;\n\
      } else {\n\
        deferred.resolveWith( elem, [ animation ] );\n\
        return false;\n\
      }\n\
    },\n\
    animation = deferred.promise({\n\
      elem: elem,\n\
      props: jQuery.extend( {}, properties ),\n\
      opts: jQuery.extend( true, { specialEasing: {} }, options ),\n\
      originalProperties: properties,\n\
      originalOptions: options,\n\
      startTime: fxNow || createFxNow(),\n\
      duration: options.duration,\n\
      tweens: [],\n\
      createTween: function( prop, end ) {\n\
        var tween = jQuery.Tween( elem, animation.opts, prop, end,\n\
            animation.opts.specialEasing[ prop ] || animation.opts.easing );\n\
        animation.tweens.push( tween );\n\
        return tween;\n\
      },\n\
      stop: function( gotoEnd ) {\n\
        var index = 0,\n\
          // if we are going to the end, we want to run all the tweens\n\
          // otherwise we skip this part\n\
          length = gotoEnd ? animation.tweens.length : 0;\n\
        if ( stopped ) {\n\
          return this;\n\
        }\n\
        stopped = true;\n\
        for ( ; index < length ; index++ ) {\n\
          animation.tweens[ index ].run( 1 );\n\
        }\n\
\n\
        // resolve when we played the last frame\n\
        // otherwise, reject\n\
        if ( gotoEnd ) {\n\
          deferred.resolveWith( elem, [ animation, gotoEnd ] );\n\
        } else {\n\
          deferred.rejectWith( elem, [ animation, gotoEnd ] );\n\
        }\n\
        return this;\n\
      }\n\
    }),\n\
    props = animation.props;\n\
\n\
  propFilter( props, animation.opts.specialEasing );\n\
\n\
  for ( ; index < length ; index++ ) {\n\
    result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );\n\
    if ( result ) {\n\
      return result;\n\
    }\n\
  }\n\
\n\
  jQuery.map( props, createTween, animation );\n\
\n\
  if ( jQuery.isFunction( animation.opts.start ) ) {\n\
    animation.opts.start.call( elem, animation );\n\
  }\n\
\n\
  jQuery.fx.timer(\n\
    jQuery.extend( tick, {\n\
      elem: elem,\n\
      anim: animation,\n\
      queue: animation.opts.queue\n\
    })\n\
  );\n\
\n\
  // attach callbacks from options\n\
  return animation.progress( animation.opts.progress )\n\
    .done( animation.opts.done, animation.opts.complete )\n\
    .fail( animation.opts.fail )\n\
    .always( animation.opts.always );\n\
}\n\
\n\
jQuery.Animation = jQuery.extend( Animation, {\n\
  tweener: function( props, callback ) {\n\
    if ( jQuery.isFunction( props ) ) {\n\
      callback = props;\n\
      props = [ \"*\" ];\n\
    } else {\n\
      props = props.split(\" \");\n\
    }\n\
\n\
    var prop,\n\
      index = 0,\n\
      length = props.length;\n\
\n\
    for ( ; index < length ; index++ ) {\n\
      prop = props[ index ];\n\
      tweeners[ prop ] = tweeners[ prop ] || [];\n\
      tweeners[ prop ].unshift( callback );\n\
    }\n\
  },\n\
\n\
  prefilter: function( callback, prepend ) {\n\
    if ( prepend ) {\n\
      animationPrefilters.unshift( callback );\n\
    } else {\n\
      animationPrefilters.push( callback );\n\
    }\n\
  }\n\
});\n\
\n\
jQuery.speed = function( speed, easing, fn ) {\n\
  var opt = speed && typeof speed === \"object\" ? jQuery.extend( {}, speed ) : {\n\
    complete: fn || !fn && easing ||\n\
      jQuery.isFunction( speed ) && speed,\n\
    duration: speed,\n\
    easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing\n\
  };\n\
\n\
  opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === \"number\" ? opt.duration :\n\
    opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;\n\
\n\
  // normalize opt.queue - true/undefined/null -> \"fx\"\n\
  if ( opt.queue == null || opt.queue === true ) {\n\
    opt.queue = \"fx\";\n\
  }\n\
\n\
  // Queueing\n\
  opt.old = opt.complete;\n\
\n\
  opt.complete = function() {\n\
    if ( jQuery.isFunction( opt.old ) ) {\n\
      opt.old.call( this );\n\
    }\n\
\n\
    if ( opt.queue ) {\n\
      jQuery.dequeue( this, opt.queue );\n\
    }\n\
  };\n\
\n\
  return opt;\n\
};\n\
\n\
jQuery.fn.extend({\n\
  fadeTo: function( speed, to, easing, callback ) {\n\
\n\
    // show any hidden elements after setting opacity to 0\n\
    return this.filter( isHidden ).css( \"opacity\", 0 ).show()\n\
\n\
      // animate to the value specified\n\
      .end().animate({ opacity: to }, speed, easing, callback );\n\
  },\n\
  animate: function( prop, speed, easing, callback ) {\n\
    var empty = jQuery.isEmptyObject( prop ),\n\
      optall = jQuery.speed( speed, easing, callback ),\n\
      doAnimation = function() {\n\
        // Operate on a copy of prop so per-property easing won't be lost\n\
        var anim = Animation( this, jQuery.extend( {}, prop ), optall );\n\
\n\
        // Empty animations, or finishing resolves immediately\n\
        if ( empty || jQuery._data( this, \"finish\" ) ) {\n\
          anim.stop( true );\n\
        }\n\
      };\n\
      doAnimation.finish = doAnimation;\n\
\n\
    return empty || optall.queue === false ?\n\
      this.each( doAnimation ) :\n\
      this.queue( optall.queue, doAnimation );\n\
  },\n\
  stop: function( type, clearQueue, gotoEnd ) {\n\
    var stopQueue = function( hooks ) {\n\
      var stop = hooks.stop;\n\
      delete hooks.stop;\n\
      stop( gotoEnd );\n\
    };\n\
\n\
    if ( typeof type !== \"string\" ) {\n\
      gotoEnd = clearQueue;\n\
      clearQueue = type;\n\
      type = undefined;\n\
    }\n\
    if ( clearQueue && type !== false ) {\n\
      this.queue( type || \"fx\", [] );\n\
    }\n\
\n\
    return this.each(function() {\n\
      var dequeue = true,\n\
        index = type != null && type + \"queueHooks\",\n\
        timers = jQuery.timers,\n\
        data = jQuery._data( this );\n\
\n\
      if ( index ) {\n\
        if ( data[ index ] && data[ index ].stop ) {\n\
          stopQueue( data[ index ] );\n\
        }\n\
      } else {\n\
        for ( index in data ) {\n\
          if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {\n\
            stopQueue( data[ index ] );\n\
          }\n\
        }\n\
      }\n\
\n\
      for ( index = timers.length; index--; ) {\n\
        if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {\n\
          timers[ index ].anim.stop( gotoEnd );\n\
          dequeue = false;\n\
          timers.splice( index, 1 );\n\
        }\n\
      }\n\
\n\
      // start the next in the queue if the last step wasn't forced\n\
      // timers currently will call their complete callbacks, which will dequeue\n\
      // but only if they were gotoEnd\n\
      if ( dequeue || !gotoEnd ) {\n\
        jQuery.dequeue( this, type );\n\
      }\n\
    });\n\
  },\n\
  finish: function( type ) {\n\
    if ( type !== false ) {\n\
      type = type || \"fx\";\n\
    }\n\
    return this.each(function() {\n\
      var index,\n\
        data = jQuery._data( this ),\n\
        queue = data[ type + \"queue\" ],\n\
        hooks = data[ type + \"queueHooks\" ],\n\
        timers = jQuery.timers,\n\
        length = queue ? queue.length : 0;\n\
\n\
      // enable finishing flag on private data\n\
      data.finish = true;\n\
\n\
      // empty the queue first\n\
      jQuery.queue( this, type, [] );\n\
\n\
      if ( hooks && hooks.stop ) {\n\
        hooks.stop.call( this, true );\n\
      }\n\
\n\
      // look for any active animations, and finish them\n\
      for ( index = timers.length; index--; ) {\n\
        if ( timers[ index ].elem === this && timers[ index ].queue === type ) {\n\
          timers[ index ].anim.stop( true );\n\
          timers.splice( index, 1 );\n\
        }\n\
      }\n\
\n\
      // look for any animations in the old queue and finish them\n\
      for ( index = 0; index < length; index++ ) {\n\
        if ( queue[ index ] && queue[ index ].finish ) {\n\
          queue[ index ].finish.call( this );\n\
        }\n\
      }\n\
\n\
      // turn off finishing flag\n\
      delete data.finish;\n\
    });\n\
  }\n\
});\n\
\n\
jQuery.each([ \"toggle\", \"show\", \"hide\" ], function( i, name ) {\n\
  var cssFn = jQuery.fn[ name ];\n\
  jQuery.fn[ name ] = function( speed, easing, callback ) {\n\
    return speed == null || typeof speed === \"boolean\" ?\n\
      cssFn.apply( this, arguments ) :\n\
      this.animate( genFx( name, true ), speed, easing, callback );\n\
  };\n\
});\n\
\n\
// Generate shortcuts for custom animations\n\
jQuery.each({\n\
  slideDown: genFx(\"show\"),\n\
  slideUp: genFx(\"hide\"),\n\
  slideToggle: genFx(\"toggle\"),\n\
  fadeIn: { opacity: \"show\" },\n\
  fadeOut: { opacity: \"hide\" },\n\
  fadeToggle: { opacity: \"toggle\" }\n\
}, function( name, props ) {\n\
  jQuery.fn[ name ] = function( speed, easing, callback ) {\n\
    return this.animate( props, speed, easing, callback );\n\
  };\n\
});\n\
\n\
jQuery.timers = [];\n\
jQuery.fx.tick = function() {\n\
  var timer,\n\
    timers = jQuery.timers,\n\
    i = 0;\n\
\n\
  fxNow = jQuery.now();\n\
\n\
  for ( ; i < timers.length; i++ ) {\n\
    timer = timers[ i ];\n\
    // Checks the timer has not already been removed\n\
    if ( !timer() && timers[ i ] === timer ) {\n\
      timers.splice( i--, 1 );\n\
    }\n\
  }\n\
\n\
  if ( !timers.length ) {\n\
    jQuery.fx.stop();\n\
  }\n\
  fxNow = undefined;\n\
};\n\
\n\
jQuery.fx.timer = function( timer ) {\n\
  jQuery.timers.push( timer );\n\
  if ( timer() ) {\n\
    jQuery.fx.start();\n\
  } else {\n\
    jQuery.timers.pop();\n\
  }\n\
};\n\
\n\
jQuery.fx.interval = 13;\n\
\n\
jQuery.fx.start = function() {\n\
  if ( !timerId ) {\n\
    timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );\n\
  }\n\
};\n\
\n\
jQuery.fx.stop = function() {\n\
  clearInterval( timerId );\n\
  timerId = null;\n\
};\n\
\n\
jQuery.fx.speeds = {\n\
  slow: 600,\n\
  fast: 200,\n\
  // Default speed\n\
  _default: 400\n\
};\n\
\n\
\n\
// Based off of the plugin by Clint Helfers, with permission.\n\
// http://blindsignals.com/index.php/2009/07/jquery-delay/\n\
jQuery.fn.delay = function( time, type ) {\n\
  time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;\n\
  type = type || \"fx\";\n\
\n\
  return this.queue( type, function( next, hooks ) {\n\
    var timeout = setTimeout( next, time );\n\
    hooks.stop = function() {\n\
      clearTimeout( timeout );\n\
    };\n\
  });\n\
};\n\
\n\
\n\
(function() {\n\
  // Minified: var a,b,c,d,e\n\
  var input, div, select, a, opt;\n\
\n\
  // Setup\n\
  div = document.createElement( \"div\" );\n\
  div.setAttribute( \"className\", \"t\" );\n\
  div.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\
  a = div.getElementsByTagName(\"a\")[ 0 ];\n\
\n\
  // First batch of tests.\n\
  select = document.createElement(\"select\");\n\
  opt = select.appendChild( document.createElement(\"option\") );\n\
  input = div.getElementsByTagName(\"input\")[ 0 ];\n\
\n\
  a.style.cssText = \"top:1px\";\n\
\n\
  // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)\n\
  support.getSetAttribute = div.className !== \"t\";\n\
\n\
  // Get the style information from getAttribute\n\
  // (IE uses .cssText instead)\n\
  support.style = /top/.test( a.getAttribute(\"style\") );\n\
\n\
  // Make sure that URLs aren't manipulated\n\
  // (IE normalizes it by default)\n\
  support.hrefNormalized = a.getAttribute(\"href\") === \"/a\";\n\
\n\
  // Check the default checkbox/radio value (\"\" on WebKit; \"on\" elsewhere)\n\
  support.checkOn = !!input.value;\n\
\n\
  // Make sure that a selected-by-default option has a working selected property.\n\
  // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)\n\
  support.optSelected = opt.selected;\n\
\n\
  // Tests for enctype support on a form (#6743)\n\
  support.enctype = !!document.createElement(\"form\").enctype;\n\
\n\
  // Make sure that the options inside disabled selects aren't marked as disabled\n\
  // (WebKit marks them as disabled)\n\
  select.disabled = true;\n\
  support.optDisabled = !opt.disabled;\n\
\n\
  // Support: IE8 only\n\
  // Check if we can trust getAttribute(\"value\")\n\
  input = document.createElement( \"input\" );\n\
  input.setAttribute( \"value\", \"\" );\n\
  support.input = input.getAttribute( \"value\" ) === \"\";\n\
\n\
  // Check if an input maintains its value after becoming a radio\n\
  input.value = \"t\";\n\
  input.setAttribute( \"type\", \"radio\" );\n\
  support.radioValue = input.value === \"t\";\n\
})();\n\
\n\
\n\
var rreturn = /\\r/g;\n\
\n\
jQuery.fn.extend({\n\
  val: function( value ) {\n\
    var hooks, ret, isFunction,\n\
      elem = this[0];\n\
\n\
    if ( !arguments.length ) {\n\
      if ( elem ) {\n\
        hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];\n\
\n\
        if ( hooks && \"get\" in hooks && (ret = hooks.get( elem, \"value\" )) !== undefined ) {\n\
          return ret;\n\
        }\n\
\n\
        ret = elem.value;\n\
\n\
        return typeof ret === \"string\" ?\n\
          // handle most common string cases\n\
          ret.replace(rreturn, \"\") :\n\
          // handle cases where value is null/undef or number\n\
          ret == null ? \"\" : ret;\n\
      }\n\
\n\
      return;\n\
    }\n\
\n\
    isFunction = jQuery.isFunction( value );\n\
\n\
    return this.each(function( i ) {\n\
      var val;\n\
\n\
      if ( this.nodeType !== 1 ) {\n\
        return;\n\
      }\n\
\n\
      if ( isFunction ) {\n\
        val = value.call( this, i, jQuery( this ).val() );\n\
      } else {\n\
        val = value;\n\
      }\n\
\n\
      // Treat null/undefined as \"\"; convert numbers to string\n\
      if ( val == null ) {\n\
        val = \"\";\n\
      } else if ( typeof val === \"number\" ) {\n\
        val += \"\";\n\
      } else if ( jQuery.isArray( val ) ) {\n\
        val = jQuery.map( val, function( value ) {\n\
          return value == null ? \"\" : value + \"\";\n\
        });\n\
      }\n\
\n\
      hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];\n\
\n\
      // If set returns undefined, fall back to normal setting\n\
      if ( !hooks || !(\"set\" in hooks) || hooks.set( this, val, \"value\" ) === undefined ) {\n\
        this.value = val;\n\
      }\n\
    });\n\
  }\n\
});\n\
\n\
jQuery.extend({\n\
  valHooks: {\n\
    option: {\n\
      get: function( elem ) {\n\
        var val = jQuery.find.attr( elem, \"value\" );\n\
        return val != null ?\n\
          val :\n\
          // Support: IE10-11+\n\
          // option.text throws exceptions (#14686, #14858)\n\
          jQuery.trim( jQuery.text( elem ) );\n\
      }\n\
    },\n\
    select: {\n\
      get: function( elem ) {\n\
        var value, option,\n\
          options = elem.options,\n\
          index = elem.selectedIndex,\n\
          one = elem.type === \"select-one\" || index < 0,\n\
          values = one ? null : [],\n\
          max = one ? index + 1 : options.length,\n\
          i = index < 0 ?\n\
            max :\n\
            one ? index : 0;\n\
\n\
        // Loop through all the selected options\n\
        for ( ; i < max; i++ ) {\n\
          option = options[ i ];\n\
\n\
          // oldIE doesn't update selected after form reset (#2551)\n\
          if ( ( option.selected || i === index ) &&\n\
              // Don't return options that are disabled or in a disabled optgroup\n\
              ( support.optDisabled ? !option.disabled : option.getAttribute(\"disabled\") === null ) &&\n\
              ( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, \"optgroup\" ) ) ) {\n\
\n\
            // Get the specific value for the option\n\
            value = jQuery( option ).val();\n\
\n\
            // We don't need an array for one selects\n\
            if ( one ) {\n\
              return value;\n\
            }\n\
\n\
            // Multi-Selects return an array\n\
            values.push( value );\n\
          }\n\
        }\n\
\n\
        return values;\n\
      },\n\
\n\
      set: function( elem, value ) {\n\
        var optionSet, option,\n\
          options = elem.options,\n\
          values = jQuery.makeArray( value ),\n\
          i = options.length;\n\
\n\
        while ( i-- ) {\n\
          option = options[ i ];\n\
\n\
          if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) >= 0 ) {\n\
\n\
            // Support: IE6\n\
            // When new option element is added to select box we need to\n\
            // force reflow of newly added node in order to workaround delay\n\
            // of initialization properties\n\
            try {\n\
              option.selected = optionSet = true;\n\
\n\
            } catch ( _ ) {\n\
\n\
              // Will be executed only in IE6\n\
              option.scrollHeight;\n\
            }\n\
\n\
          } else {\n\
            option.selected = false;\n\
          }\n\
        }\n\
\n\
        // Force browsers to behave consistently when non-matching value is set\n\
        if ( !optionSet ) {\n\
          elem.selectedIndex = -1;\n\
        }\n\
\n\
        return options;\n\
      }\n\
    }\n\
  }\n\
});\n\
\n\
// Radios and checkboxes getter/setter\n\
jQuery.each([ \"radio\", \"checkbox\" ], function() {\n\
  jQuery.valHooks[ this ] = {\n\
    set: function( elem, value ) {\n\
      if ( jQuery.isArray( value ) ) {\n\
        return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );\n\
      }\n\
    }\n\
  };\n\
  if ( !support.checkOn ) {\n\
    jQuery.valHooks[ this ].get = function( elem ) {\n\
      // Support: Webkit\n\
      // \"\" is returned instead of \"on\" if a value isn't specified\n\
      return elem.getAttribute(\"value\") === null ? \"on\" : elem.value;\n\
    };\n\
  }\n\
});\n\
\n\
\n\
\n\
\n\
var nodeHook, boolHook,\n\
  attrHandle = jQuery.expr.attrHandle,\n\
  ruseDefault = /^(?:checked|selected)$/i,\n\
  getSetAttribute = support.getSetAttribute,\n\
  getSetInput = support.input;\n\
\n\
jQuery.fn.extend({\n\
  attr: function( name, value ) {\n\
    return access( this, jQuery.attr, name, value, arguments.length > 1 );\n\
  },\n\
\n\
  removeAttr: function( name ) {\n\
    return this.each(function() {\n\
      jQuery.removeAttr( this, name );\n\
    });\n\
  }\n\
});\n\
\n\
jQuery.extend({\n\
  attr: function( elem, name, value ) {\n\
    var hooks, ret,\n\
      nType = elem.nodeType;\n\
\n\
    // don't get/set attributes on text, comment and attribute nodes\n\
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {\n\
      return;\n\
    }\n\
\n\
    // Fallback to prop when attributes are not supported\n\
    if ( typeof elem.getAttribute === strundefined ) {\n\
      return jQuery.prop( elem, name, value );\n\
    }\n\
\n\
    // All attributes are lowercase\n\
    // Grab necessary hook if one is defined\n\
    if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {\n\
      name = name.toLowerCase();\n\
      hooks = jQuery.attrHooks[ name ] ||\n\
        ( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );\n\
    }\n\
\n\
    if ( value !== undefined ) {\n\
\n\
      if ( value === null ) {\n\
        jQuery.removeAttr( elem, name );\n\
\n\
      } else if ( hooks && \"set\" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {\n\
        return ret;\n\
\n\
      } else {\n\
        elem.setAttribute( name, value + \"\" );\n\
        return value;\n\
      }\n\
\n\
    } else if ( hooks && \"get\" in hooks && (ret = hooks.get( elem, name )) !== null ) {\n\
      return ret;\n\
\n\
    } else {\n\
      ret = jQuery.find.attr( elem, name );\n\
\n\
      // Non-existent attributes return null, we normalize to undefined\n\
      return ret == null ?\n\
        undefined :\n\
        ret;\n\
    }\n\
  },\n\
\n\
  removeAttr: function( elem, value ) {\n\
    var name, propName,\n\
      i = 0,\n\
      attrNames = value && value.match( rnotwhite );\n\
\n\
    if ( attrNames && elem.nodeType === 1 ) {\n\
      while ( (name = attrNames[i++]) ) {\n\
        propName = jQuery.propFix[ name ] || name;\n\
\n\
        // Boolean attributes get special treatment (#10870)\n\
        if ( jQuery.expr.match.bool.test( name ) ) {\n\
          // Set corresponding property to false\n\
          if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {\n\
            elem[ propName ] = false;\n\
          // Support: IE<9\n\
          // Also clear defaultChecked/defaultSelected (if appropriate)\n\
          } else {\n\
            elem[ jQuery.camelCase( \"default-\" + name ) ] =\n\
              elem[ propName ] = false;\n\
          }\n\
\n\
        // See #9699 for explanation of this approach (setting first, then removal)\n\
        } else {\n\
          jQuery.attr( elem, name, \"\" );\n\
        }\n\
\n\
        elem.removeAttribute( getSetAttribute ? name : propName );\n\
      }\n\
    }\n\
  },\n\
\n\
  attrHooks: {\n\
    type: {\n\
      set: function( elem, value ) {\n\
        if ( !support.radioValue && value === \"radio\" && jQuery.nodeName(elem, \"input\") ) {\n\
          // Setting the type on a radio button after the value resets the value in IE6-9\n\
          // Reset value to default in case type is set after value during creation\n\
          var val = elem.value;\n\
          elem.setAttribute( \"type\", value );\n\
          if ( val ) {\n\
            elem.value = val;\n\
          }\n\
          return value;\n\
        }\n\
      }\n\
    }\n\
  }\n\
});\n\
\n\
// Hook for boolean attributes\n\
boolHook = {\n\
  set: function( elem, value, name ) {\n\
    if ( value === false ) {\n\
      // Remove boolean attributes when set to false\n\
      jQuery.removeAttr( elem, name );\n\
    } else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {\n\
      // IE<8 needs the *property* name\n\
      elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );\n\
\n\
    // Use defaultChecked and defaultSelected for oldIE\n\
    } else {\n\
      elem[ jQuery.camelCase( \"default-\" + name ) ] = elem[ name ] = true;\n\
    }\n\
\n\
    return name;\n\
  }\n\
};\n\
\n\
// Retrieve booleans specially\n\
jQuery.each( jQuery.expr.match.bool.source.match( /\\w+/g ), function( i, name ) {\n\
\n\
  var getter = attrHandle[ name ] || jQuery.find.attr;\n\
\n\
  attrHandle[ name ] = getSetInput && getSetAttribute || !ruseDefault.test( name ) ?\n\
    function( elem, name, isXML ) {\n\
      var ret, handle;\n\
      if ( !isXML ) {\n\
        // Avoid an infinite loop by temporarily removing this function from the getter\n\
        handle = attrHandle[ name ];\n\
        attrHandle[ name ] = ret;\n\
        ret = getter( elem, name, isXML ) != null ?\n\
          name.toLowerCase() :\n\
          null;\n\
        attrHandle[ name ] = handle;\n\
      }\n\
      return ret;\n\
    } :\n\
    function( elem, name, isXML ) {\n\
      if ( !isXML ) {\n\
        return elem[ jQuery.camelCase( \"default-\" + name ) ] ?\n\
          name.toLowerCase() :\n\
          null;\n\
      }\n\
    };\n\
});\n\
\n\
// fix oldIE attroperties\n\
if ( !getSetInput || !getSetAttribute ) {\n\
  jQuery.attrHooks.value = {\n\
    set: function( elem, value, name ) {\n\
      if ( jQuery.nodeName( elem, \"input\" ) ) {\n\
        // Does not return so that setAttribute is also used\n\
        elem.defaultValue = value;\n\
      } else {\n\
        // Use nodeHook if defined (#1954); otherwise setAttribute is fine\n\
        return nodeHook && nodeHook.set( elem, value, name );\n\
      }\n\
    }\n\
  };\n\
}\n\
\n\
// IE6/7 do not support getting/setting some attributes with get/setAttribute\n\
if ( !getSetAttribute ) {\n\
\n\
  // Use this for any attribute in IE6/7\n\
  // This fixes almost every IE6/7 issue\n\
  nodeHook = {\n\
    set: function( elem, value, name ) {\n\
      // Set the existing or create a new attribute node\n\
      var ret = elem.getAttributeNode( name );\n\
      if ( !ret ) {\n\
        elem.setAttributeNode(\n\
          (ret = elem.ownerDocument.createAttribute( name ))\n\
        );\n\
      }\n\
\n\
      ret.value = value += \"\";\n\
\n\
      // Break association with cloned elements by also using setAttribute (#9646)\n\
      if ( name === \"value\" || value === elem.getAttribute( name ) ) {\n\
        return value;\n\
      }\n\
    }\n\
  };\n\
\n\
  // Some attributes are constructed with empty-string values when not defined\n\
  attrHandle.id = attrHandle.name = attrHandle.coords =\n\
    function( elem, name, isXML ) {\n\
      var ret;\n\
      if ( !isXML ) {\n\
        return (ret = elem.getAttributeNode( name )) && ret.value !== \"\" ?\n\
          ret.value :\n\
          null;\n\
      }\n\
    };\n\
\n\
  // Fixing value retrieval on a button requires this module\n\
  jQuery.valHooks.button = {\n\
    get: function( elem, name ) {\n\
      var ret = elem.getAttributeNode( name );\n\
      if ( ret && ret.specified ) {\n\
        return ret.value;\n\
      }\n\
    },\n\
    set: nodeHook.set\n\
  };\n\
\n\
  // Set contenteditable to false on removals(#10429)\n\
  // Setting to empty string throws an error as an invalid value\n\
  jQuery.attrHooks.contenteditable = {\n\
    set: function( elem, value, name ) {\n\
      nodeHook.set( elem, value === \"\" ? false : value, name );\n\
    }\n\
  };\n\
\n\
  // Set width and height to auto instead of 0 on empty string( Bug #8150 )\n\
  // This is for removals\n\
  jQuery.each([ \"width\", \"height\" ], function( i, name ) {\n\
    jQuery.attrHooks[ name ] = {\n\
      set: function( elem, value ) {\n\
        if ( value === \"\" ) {\n\
          elem.setAttribute( name, \"auto\" );\n\
          return value;\n\
        }\n\
      }\n\
    };\n\
  });\n\
}\n\
\n\
if ( !support.style ) {\n\
  jQuery.attrHooks.style = {\n\
    get: function( elem ) {\n\
      // Return undefined in the case of empty string\n\
      // Note: IE uppercases css property names, but if we were to .toLowerCase()\n\
      // .cssText, that would destroy case senstitivity in URL's, like in \"background\"\n\
      return elem.style.cssText || undefined;\n\
    },\n\
    set: function( elem, value ) {\n\
      return ( elem.style.cssText = value + \"\" );\n\
    }\n\
  };\n\
}\n\
\n\
\n\
\n\
\n\
var rfocusable = /^(?:input|select|textarea|button|object)$/i,\n\
  rclickable = /^(?:a|area)$/i;\n\
\n\
jQuery.fn.extend({\n\
  prop: function( name, value ) {\n\
    return access( this, jQuery.prop, name, value, arguments.length > 1 );\n\
  },\n\
\n\
  removeProp: function( name ) {\n\
    name = jQuery.propFix[ name ] || name;\n\
    return this.each(function() {\n\
      // try/catch handles cases where IE balks (such as removing a property on window)\n\
      try {\n\
        this[ name ] = undefined;\n\
        delete this[ name ];\n\
      } catch( e ) {}\n\
    });\n\
  }\n\
});\n\
\n\
jQuery.extend({\n\
  propFix: {\n\
    \"for\": \"htmlFor\",\n\
    \"class\": \"className\"\n\
  },\n\
\n\
  prop: function( elem, name, value ) {\n\
    var ret, hooks, notxml,\n\
      nType = elem.nodeType;\n\
\n\
    // don't get/set properties on text, comment and attribute nodes\n\
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {\n\
      return;\n\
    }\n\
\n\
    notxml = nType !== 1 || !jQuery.isXMLDoc( elem );\n\
\n\
    if ( notxml ) {\n\
      // Fix name and attach hooks\n\
      name = jQuery.propFix[ name ] || name;\n\
      hooks = jQuery.propHooks[ name ];\n\
    }\n\
\n\
    if ( value !== undefined ) {\n\
      return hooks && \"set\" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?\n\
        ret :\n\
        ( elem[ name ] = value );\n\
\n\
    } else {\n\
      return hooks && \"get\" in hooks && (ret = hooks.get( elem, name )) !== null ?\n\
        ret :\n\
        elem[ name ];\n\
    }\n\
  },\n\
\n\
  propHooks: {\n\
    tabIndex: {\n\
      get: function( elem ) {\n\
        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set\n\
        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/\n\
        // Use proper attribute retrieval(#12072)\n\
        var tabindex = jQuery.find.attr( elem, \"tabindex\" );\n\
\n\
        return tabindex ?\n\
          parseInt( tabindex, 10 ) :\n\
          rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?\n\
            0 :\n\
            -1;\n\
      }\n\
    }\n\
  }\n\
});\n\
\n\
// Some attributes require a special call on IE\n\
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx\n\
if ( !support.hrefNormalized ) {\n\
  // href/src property should get the full normalized URL (#10299/#12915)\n\
  jQuery.each([ \"href\", \"src\" ], function( i, name ) {\n\
    jQuery.propHooks[ name ] = {\n\
      get: function( elem ) {\n\
        return elem.getAttribute( name, 4 );\n\
      }\n\
    };\n\
  });\n\
}\n\
\n\
// Support: Safari, IE9+\n\
// mis-reports the default selected property of an option\n\
// Accessing the parent's selectedIndex property fixes it\n\
if ( !support.optSelected ) {\n\
  jQuery.propHooks.selected = {\n\
    get: function( elem ) {\n\
      var parent = elem.parentNode;\n\
\n\
      if ( parent ) {\n\
        parent.selectedIndex;\n\
\n\
        // Make sure that it also works with optgroups, see #5701\n\
        if ( parent.parentNode ) {\n\
          parent.parentNode.selectedIndex;\n\
        }\n\
      }\n\
      return null;\n\
    }\n\
  };\n\
}\n\
\n\
jQuery.each([\n\
  \"tabIndex\",\n\
  \"readOnly\",\n\
  \"maxLength\",\n\
  \"cellSpacing\",\n\
  \"cellPadding\",\n\
  \"rowSpan\",\n\
  \"colSpan\",\n\
  \"useMap\",\n\
  \"frameBorder\",\n\
  \"contentEditable\"\n\
], function() {\n\
  jQuery.propFix[ this.toLowerCase() ] = this;\n\
});\n\
\n\
// IE6/7 call enctype encoding\n\
if ( !support.enctype ) {\n\
  jQuery.propFix.enctype = \"encoding\";\n\
}\n\
\n\
\n\
\n\
\n\
var rclass = /[\\t\\r\\n\
\\f]/g;\n\
\n\
jQuery.fn.extend({\n\
  addClass: function( value ) {\n\
    var classes, elem, cur, clazz, j, finalValue,\n\
      i = 0,\n\
      len = this.length,\n\
      proceed = typeof value === \"string\" && value;\n\
\n\
    if ( jQuery.isFunction( value ) ) {\n\
      return this.each(function( j ) {\n\
        jQuery( this ).addClass( value.call( this, j, this.className ) );\n\
      });\n\
    }\n\
\n\
    if ( proceed ) {\n\
      // The disjunction here is for better compressibility (see removeClass)\n\
      classes = ( value || \"\" ).match( rnotwhite ) || [];\n\
\n\
      for ( ; i < len; i++ ) {\n\
        elem = this[ i ];\n\
        cur = elem.nodeType === 1 && ( elem.className ?\n\
          ( \" \" + elem.className + \" \" ).replace( rclass, \" \" ) :\n\
          \" \"\n\
        );\n\
\n\
        if ( cur ) {\n\
          j = 0;\n\
          while ( (clazz = classes[j++]) ) {\n\
            if ( cur.indexOf( \" \" + clazz + \" \" ) < 0 ) {\n\
              cur += clazz + \" \";\n\
            }\n\
          }\n\
\n\
          // only assign if different to avoid unneeded rendering.\n\
          finalValue = jQuery.trim( cur );\n\
          if ( elem.className !== finalValue ) {\n\
            elem.className = finalValue;\n\
          }\n\
        }\n\
      }\n\
    }\n\
\n\
    return this;\n\
  },\n\
\n\
  removeClass: function( value ) {\n\
    var classes, elem, cur, clazz, j, finalValue,\n\
      i = 0,\n\
      len = this.length,\n\
      proceed = arguments.length === 0 || typeof value === \"string\" && value;\n\
\n\
    if ( jQuery.isFunction( value ) ) {\n\
      return this.each(function( j ) {\n\
        jQuery( this ).removeClass( value.call( this, j, this.className ) );\n\
      });\n\
    }\n\
    if ( proceed ) {\n\
      classes = ( value || \"\" ).match( rnotwhite ) || [];\n\
\n\
      for ( ; i < len; i++ ) {\n\
        elem = this[ i ];\n\
        // This expression is here for better compressibility (see addClass)\n\
        cur = elem.nodeType === 1 && ( elem.className ?\n\
          ( \" \" + elem.className + \" \" ).replace( rclass, \" \" ) :\n\
          \"\"\n\
        );\n\
\n\
        if ( cur ) {\n\
          j = 0;\n\
          while ( (clazz = classes[j++]) ) {\n\
            // Remove *all* instances\n\
            while ( cur.indexOf( \" \" + clazz + \" \" ) >= 0 ) {\n\
              cur = cur.replace( \" \" + clazz + \" \", \" \" );\n\
            }\n\
          }\n\
\n\
          // only assign if different to avoid unneeded rendering.\n\
          finalValue = value ? jQuery.trim( cur ) : \"\";\n\
          if ( elem.className !== finalValue ) {\n\
            elem.className = finalValue;\n\
          }\n\
        }\n\
      }\n\
    }\n\
\n\
    return this;\n\
  },\n\
\n\
  toggleClass: function( value, stateVal ) {\n\
    var type = typeof value;\n\
\n\
    if ( typeof stateVal === \"boolean\" && type === \"string\" ) {\n\
      return stateVal ? this.addClass( value ) : this.removeClass( value );\n\
    }\n\
\n\
    if ( jQuery.isFunction( value ) ) {\n\
      return this.each(function( i ) {\n\
        jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );\n\
      });\n\
    }\n\
\n\
    return this.each(function() {\n\
      if ( type === \"string\" ) {\n\
        // toggle individual class names\n\
        var className,\n\
          i = 0,\n\
          self = jQuery( this ),\n\
          classNames = value.match( rnotwhite ) || [];\n\
\n\
        while ( (className = classNames[ i++ ]) ) {\n\
          // check each className given, space separated list\n\
          if ( self.hasClass( className ) ) {\n\
            self.removeClass( className );\n\
          } else {\n\
            self.addClass( className );\n\
          }\n\
        }\n\
\n\
      // Toggle whole class name\n\
      } else if ( type === strundefined || type === \"boolean\" ) {\n\
        if ( this.className ) {\n\
          // store className if set\n\
          jQuery._data( this, \"__className__\", this.className );\n\
        }\n\
\n\
        // If the element has a class name or if we're passed \"false\",\n\
        // then remove the whole classname (if there was one, the above saved it).\n\
        // Otherwise bring back whatever was previously saved (if anything),\n\
        // falling back to the empty string if nothing was stored.\n\
        this.className = this.className || value === false ? \"\" : jQuery._data( this, \"__className__\" ) || \"\";\n\
      }\n\
    });\n\
  },\n\
\n\
  hasClass: function( selector ) {\n\
    var className = \" \" + selector + \" \",\n\
      i = 0,\n\
      l = this.length;\n\
    for ( ; i < l; i++ ) {\n\
      if ( this[i].nodeType === 1 && (\" \" + this[i].className + \" \").replace(rclass, \" \").indexOf( className ) >= 0 ) {\n\
        return true;\n\
      }\n\
    }\n\
\n\
    return false;\n\
  }\n\
});\n\
\n\
\n\
\n\
\n\
// Return jQuery for attributes-only inclusion\n\
\n\
\n\
jQuery.each( (\"blur focus focusin focusout load resize scroll unload click dblclick \" +\n\
  \"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave \" +\n\
  \"change select submit keydown keypress keyup error contextmenu\").split(\" \"), function( i, name ) {\n\
\n\
  // Handle event binding\n\
  jQuery.fn[ name ] = function( data, fn ) {\n\
    return arguments.length > 0 ?\n\
      this.on( name, null, data, fn ) :\n\
      this.trigger( name );\n\
  };\n\
});\n\
\n\
jQuery.fn.extend({\n\
  hover: function( fnOver, fnOut ) {\n\
    return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );\n\
  },\n\
\n\
  bind: function( types, data, fn ) {\n\
    return this.on( types, null, data, fn );\n\
  },\n\
  unbind: function( types, fn ) {\n\
    return this.off( types, null, fn );\n\
  },\n\
\n\
  delegate: function( selector, types, data, fn ) {\n\
    return this.on( types, selector, data, fn );\n\
  },\n\
  undelegate: function( selector, types, fn ) {\n\
    // ( namespace ) or ( selector, types [, fn] )\n\
    return arguments.length === 1 ? this.off( selector, \"**\" ) : this.off( types, selector || \"**\", fn );\n\
  }\n\
});\n\
\n\
\n\
var nonce = jQuery.now();\n\
\n\
var rquery = (/\\?/);\n\
\n\
\n\
\n\
var rvalidtokens = /(,)|(\\[|{)|(}|])|\"(?:[^\"\\\\\\r\\n\
]|\\\\[\"\\\\\\/bfnrt]|\\\\u[\\da-fA-F]{4})*\"\\s*:?|true|false|null|-?(?!0\\d)\\d+(?:\\.\\d+|)(?:[eE][+-]?\\d+|)/g;\n\
\n\
jQuery.parseJSON = function( data ) {\n\
  // Attempt to parse using the native JSON parser first\n\
  if ( window.JSON && window.JSON.parse ) {\n\
    // Support: Android 2.3\n\
    // Workaround failure to string-cast null input\n\
    return window.JSON.parse( data + \"\" );\n\
  }\n\
\n\
  var requireNonComma,\n\
    depth = null,\n\
    str = jQuery.trim( data + \"\" );\n\
\n\
  // Guard against invalid (and possibly dangerous) input by ensuring that nothing remains\n\
  // after removing valid tokens\n\
  return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {\n\
\n\
    // Force termination if we see a misplaced comma\n\
    if ( requireNonComma && comma ) {\n\
      depth = 0;\n\
    }\n\
\n\
    // Perform no more replacements after returning to outermost depth\n\
    if ( depth === 0 ) {\n\
      return token;\n\
    }\n\
\n\
    // Commas must not follow \"[\", \"{\", or \",\"\n\
    requireNonComma = open || comma;\n\
\n\
    // Determine new depth\n\
    // array/object open (\"[\" or \"{\"): depth += true - false (increment)\n\
    // array/object close (\"]\" or \"}\"): depth += false - true (decrement)\n\
    // other cases (\",\" or primitive): depth += true - true (numeric cast)\n\
    depth += !close - !open;\n\
\n\
    // Remove this token\n\
    return \"\";\n\
  }) ) ?\n\
    ( Function( \"return \" + str ) )() :\n\
    jQuery.error( \"Invalid JSON: \" + data );\n\
};\n\
\n\
\n\
// Cross-browser xml parsing\n\
jQuery.parseXML = function( data ) {\n\
  var xml, tmp;\n\
  if ( !data || typeof data !== \"string\" ) {\n\
    return null;\n\
  }\n\
  try {\n\
    if ( window.DOMParser ) { // Standard\n\
      tmp = new DOMParser();\n\
      xml = tmp.parseFromString( data, \"text/xml\" );\n\
    } else { // IE\n\
      xml = new ActiveXObject( \"Microsoft.XMLDOM\" );\n\
      xml.async = \"false\";\n\
      xml.loadXML( data );\n\
    }\n\
  } catch( e ) {\n\
    xml = undefined;\n\
  }\n\
  if ( !xml || !xml.documentElement || xml.getElementsByTagName( \"parsererror\" ).length ) {\n\
    jQuery.error( \"Invalid XML: \" + data );\n\
  }\n\
  return xml;\n\
};\n\
\n\
\n\
var\n\
  // Document location\n\
  ajaxLocParts,\n\
  ajaxLocation,\n\
\n\
  rhash = /#.*$/,\n\
  rts = /([?&])_=[^&]*/,\n\
  rheaders = /^(.*?):[ \\t]*([^\\r\\n\
]*)\\r?$/mg, // IE leaves an \\r character at EOL\n\
  // #7653, #8125, #8152: local protocol detection\n\
  rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,\n\
  rnoContent = /^(?:GET|HEAD)$/,\n\
  rprotocol = /^\\/\\//,\n\
  rurl = /^([\\w.+-]+:)(?:\\/\\/(?:[^\\/?#]*@|)([^\\/?#:]*)(?::(\\d+)|)|)/,\n\
\n\
  /* Prefilters\n\
   * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)\n\
   * 2) These are called:\n\
   *    - BEFORE asking for a transport\n\
   *    - AFTER param serialization (s.data is a string if s.processData is true)\n\
   * 3) key is the dataType\n\
   * 4) the catchall symbol \"*\" can be used\n\
   * 5) execution will start with transport dataType and THEN continue down to \"*\" if needed\n\
   */\n\
  prefilters = {},\n\
\n\
  /* Transports bindings\n\
   * 1) key is the dataType\n\
   * 2) the catchall symbol \"*\" can be used\n\
   * 3) selection will start with transport dataType and THEN go to \"*\" if needed\n\
   */\n\
  transports = {},\n\
\n\
  // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression\n\
  allTypes = \"*/\".concat(\"*\");\n\
\n\
// #8138, IE may throw an exception when accessing\n\
// a field from window.location if document.domain has been set\n\
try {\n\
  ajaxLocation = location.href;\n\
} catch( e ) {\n\
  // Use the href attribute of an A element\n\
  // since IE will modify it given document.location\n\
  ajaxLocation = document.createElement( \"a\" );\n\
  ajaxLocation.href = \"\";\n\
  ajaxLocation = ajaxLocation.href;\n\
}\n\
\n\
// Segment location into parts\n\
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];\n\
\n\
// Base \"constructor\" for jQuery.ajaxPrefilter and jQuery.ajaxTransport\n\
function addToPrefiltersOrTransports( structure ) {\n\
\n\
  // dataTypeExpression is optional and defaults to \"*\"\n\
  return function( dataTypeExpression, func ) {\n\
\n\
    if ( typeof dataTypeExpression !== \"string\" ) {\n\
      func = dataTypeExpression;\n\
      dataTypeExpression = \"*\";\n\
    }\n\
\n\
    var dataType,\n\
      i = 0,\n\
      dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];\n\
\n\
    if ( jQuery.isFunction( func ) ) {\n\
      // For each dataType in the dataTypeExpression\n\
      while ( (dataType = dataTypes[i++]) ) {\n\
        // Prepend if requested\n\
        if ( dataType.charAt( 0 ) === \"+\" ) {\n\
          dataType = dataType.slice( 1 ) || \"*\";\n\
          (structure[ dataType ] = structure[ dataType ] || []).unshift( func );\n\
\n\
        // Otherwise append\n\
        } else {\n\
          (structure[ dataType ] = structure[ dataType ] || []).push( func );\n\
        }\n\
      }\n\
    }\n\
  };\n\
}\n\
\n\
// Base inspection function for prefilters and transports\n\
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {\n\
\n\
  var inspected = {},\n\
    seekingTransport = ( structure === transports );\n\
\n\
  function inspect( dataType ) {\n\
    var selected;\n\
    inspected[ dataType ] = true;\n\
    jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {\n\
      var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );\n\
      if ( typeof dataTypeOrTransport === \"string\" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {\n\
        options.dataTypes.unshift( dataTypeOrTransport );\n\
        inspect( dataTypeOrTransport );\n\
        return false;\n\
      } else if ( seekingTransport ) {\n\
        return !( selected = dataTypeOrTransport );\n\
      }\n\
    });\n\
    return selected;\n\
  }\n\
\n\
  return inspect( options.dataTypes[ 0 ] ) || !inspected[ \"*\" ] && inspect( \"*\" );\n\
}\n\
\n\
// A special extend for ajax options\n\
// that takes \"flat\" options (not to be deep extended)\n\
// Fixes #9887\n\
function ajaxExtend( target, src ) {\n\
  var deep, key,\n\
    flatOptions = jQuery.ajaxSettings.flatOptions || {};\n\
\n\
  for ( key in src ) {\n\
    if ( src[ key ] !== undefined ) {\n\
      ( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];\n\
    }\n\
  }\n\
  if ( deep ) {\n\
    jQuery.extend( true, target, deep );\n\
  }\n\
\n\
  return target;\n\
}\n\
\n\
/* Handles responses to an ajax request:\n\
 * - finds the right dataType (mediates between content-type and expected dataType)\n\
 * - returns the corresponding response\n\
 */\n\
function ajaxHandleResponses( s, jqXHR, responses ) {\n\
  var firstDataType, ct, finalDataType, type,\n\
    contents = s.contents,\n\
    dataTypes = s.dataTypes;\n\
\n\
  // Remove auto dataType and get content-type in the process\n\
  while ( dataTypes[ 0 ] === \"*\" ) {\n\
    dataTypes.shift();\n\
    if ( ct === undefined ) {\n\
      ct = s.mimeType || jqXHR.getResponseHeader(\"Content-Type\");\n\
    }\n\
  }\n\
\n\
  // Check if we're dealing with a known content-type\n\
  if ( ct ) {\n\
    for ( type in contents ) {\n\
      if ( contents[ type ] && contents[ type ].test( ct ) ) {\n\
        dataTypes.unshift( type );\n\
        break;\n\
      }\n\
    }\n\
  }\n\
\n\
  // Check to see if we have a response for the expected dataType\n\
  if ( dataTypes[ 0 ] in responses ) {\n\
    finalDataType = dataTypes[ 0 ];\n\
  } else {\n\
    // Try convertible dataTypes\n\
    for ( type in responses ) {\n\
      if ( !dataTypes[ 0 ] || s.converters[ type + \" \" + dataTypes[0] ] ) {\n\
        finalDataType = type;\n\
        break;\n\
      }\n\
      if ( !firstDataType ) {\n\
        firstDataType = type;\n\
      }\n\
    }\n\
    // Or just use first one\n\
    finalDataType = finalDataType || firstDataType;\n\
  }\n\
\n\
  // If we found a dataType\n\
  // We add the dataType to the list if needed\n\
  // and return the corresponding response\n\
  if ( finalDataType ) {\n\
    if ( finalDataType !== dataTypes[ 0 ] ) {\n\
      dataTypes.unshift( finalDataType );\n\
    }\n\
    return responses[ finalDataType ];\n\
  }\n\
}\n\
\n\
/* Chain conversions given the request and the original response\n\
 * Also sets the responseXXX fields on the jqXHR instance\n\
 */\n\
function ajaxConvert( s, response, jqXHR, isSuccess ) {\n\
  var conv2, current, conv, tmp, prev,\n\
    converters = {},\n\
    // Work with a copy of dataTypes in case we need to modify it for conversion\n\
    dataTypes = s.dataTypes.slice();\n\
\n\
  // Create converters map with lowercased keys\n\
  if ( dataTypes[ 1 ] ) {\n\
    for ( conv in s.converters ) {\n\
      converters[ conv.toLowerCase() ] = s.converters[ conv ];\n\
    }\n\
  }\n\
\n\
  current = dataTypes.shift();\n\
\n\
  // Convert to each sequential dataType\n\
  while ( current ) {\n\
\n\
    if ( s.responseFields[ current ] ) {\n\
      jqXHR[ s.responseFields[ current ] ] = response;\n\
    }\n\
\n\
    // Apply the dataFilter if provided\n\
    if ( !prev && isSuccess && s.dataFilter ) {\n\
      response = s.dataFilter( response, s.dataType );\n\
    }\n\
\n\
    prev = current;\n\
    current = dataTypes.shift();\n\
\n\
    if ( current ) {\n\
\n\
      // There's only work to do if current dataType is non-auto\n\
      if ( current === \"*\" ) {\n\
\n\
        current = prev;\n\
\n\
      // Convert response if prev dataType is non-auto and differs from current\n\
      } else if ( prev !== \"*\" && prev !== current ) {\n\
\n\
        // Seek a direct converter\n\
        conv = converters[ prev + \" \" + current ] || converters[ \"* \" + current ];\n\
\n\
        // If none found, seek a pair\n\
        if ( !conv ) {\n\
          for ( conv2 in converters ) {\n\
\n\
            // If conv2 outputs current\n\
            tmp = conv2.split( \" \" );\n\
            if ( tmp[ 1 ] === current ) {\n\
\n\
              // If prev can be converted to accepted input\n\
              conv = converters[ prev + \" \" + tmp[ 0 ] ] ||\n\
                converters[ \"* \" + tmp[ 0 ] ];\n\
              if ( conv ) {\n\
                // Condense equivalence converters\n\
                if ( conv === true ) {\n\
                  conv = converters[ conv2 ];\n\
\n\
                // Otherwise, insert the intermediate dataType\n\
                } else if ( converters[ conv2 ] !== true ) {\n\
                  current = tmp[ 0 ];\n\
                  dataTypes.unshift( tmp[ 1 ] );\n\
                }\n\
                break;\n\
              }\n\
            }\n\
          }\n\
        }\n\
\n\
        // Apply converter (if not an equivalence)\n\
        if ( conv !== true ) {\n\
\n\
          // Unless errors are allowed to bubble, catch and return them\n\
          if ( conv && s[ \"throws\" ] ) {\n\
            response = conv( response );\n\
          } else {\n\
            try {\n\
              response = conv( response );\n\
            } catch ( e ) {\n\
              return { state: \"parsererror\", error: conv ? e : \"No conversion from \" + prev + \" to \" + current };\n\
            }\n\
          }\n\
        }\n\
      }\n\
    }\n\
  }\n\
\n\
  return { state: \"success\", data: response };\n\
}\n\
\n\
jQuery.extend({\n\
\n\
  // Counter for holding the number of active queries\n\
  active: 0,\n\
\n\
  // Last-Modified header cache for next request\n\
  lastModified: {},\n\
  etag: {},\n\
\n\
  ajaxSettings: {\n\
    url: ajaxLocation,\n\
    type: \"GET\",\n\
    isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),\n\
    global: true,\n\
    processData: true,\n\
    async: true,\n\
    contentType: \"application/x-www-form-urlencoded; charset=UTF-8\",\n\
    /*\n\
    timeout: 0,\n\
    data: null,\n\
    dataType: null,\n\
    username: null,\n\
    password: null,\n\
    cache: null,\n\
    throws: false,\n\
    traditional: false,\n\
    headers: {},\n\
    */\n\
\n\
    accepts: {\n\
      \"*\": allTypes,\n\
      text: \"text/plain\",\n\
      html: \"text/html\",\n\
      xml: \"application/xml, text/xml\",\n\
      json: \"application/json, text/javascript\"\n\
    },\n\
\n\
    contents: {\n\
      xml: /xml/,\n\
      html: /html/,\n\
      json: /json/\n\
    },\n\
\n\
    responseFields: {\n\
      xml: \"responseXML\",\n\
      text: \"responseText\",\n\
      json: \"responseJSON\"\n\
    },\n\
\n\
    // Data converters\n\
    // Keys separate source (or catchall \"*\") and destination types with a single space\n\
    converters: {\n\
\n\
      // Convert anything to text\n\
      \"* text\": String,\n\
\n\
      // Text to html (true = no transformation)\n\
      \"text html\": true,\n\
\n\
      // Evaluate text as a json expression\n\
      \"text json\": jQuery.parseJSON,\n\
\n\
      // Parse text as xml\n\
      \"text xml\": jQuery.parseXML\n\
    },\n\
\n\
    // For options that shouldn't be deep extended:\n\
    // you can add your own custom options here if\n\
    // and when you create one that shouldn't be\n\
    // deep extended (see ajaxExtend)\n\
    flatOptions: {\n\
      url: true,\n\
      context: true\n\
    }\n\
  },\n\
\n\
  // Creates a full fledged settings object into target\n\
  // with both ajaxSettings and settings fields.\n\
  // If target is omitted, writes into ajaxSettings.\n\
  ajaxSetup: function( target, settings ) {\n\
    return settings ?\n\
\n\
      // Building a settings object\n\
      ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :\n\
\n\
      // Extending ajaxSettings\n\
      ajaxExtend( jQuery.ajaxSettings, target );\n\
  },\n\
\n\
  ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),\n\
  ajaxTransport: addToPrefiltersOrTransports( transports ),\n\
\n\
  // Main method\n\
  ajax: function( url, options ) {\n\
\n\
    // If url is an object, simulate pre-1.5 signature\n\
    if ( typeof url === \"object\" ) {\n\
      options = url;\n\
      url = undefined;\n\
    }\n\
\n\
    // Force options to be an object\n\
    options = options || {};\n\
\n\
    var // Cross-domain detection vars\n\
      parts,\n\
      // Loop variable\n\
      i,\n\
      // URL without anti-cache param\n\
      cacheURL,\n\
      // Response headers as string\n\
      responseHeadersString,\n\
      // timeout handle\n\
      timeoutTimer,\n\
\n\
      // To know if global events are to be dispatched\n\
      fireGlobals,\n\
\n\
      transport,\n\
      // Response headers\n\
      responseHeaders,\n\
      // Create the final options object\n\
      s = jQuery.ajaxSetup( {}, options ),\n\
      // Callbacks context\n\
      callbackContext = s.context || s,\n\
      // Context for global events is callbackContext if it is a DOM node or jQuery collection\n\
      globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?\n\
        jQuery( callbackContext ) :\n\
        jQuery.event,\n\
      // Deferreds\n\
      deferred = jQuery.Deferred(),\n\
      completeDeferred = jQuery.Callbacks(\"once memory\"),\n\
      // Status-dependent callbacks\n\
      statusCode = s.statusCode || {},\n\
      // Headers (they are sent all at once)\n\
      requestHeaders = {},\n\
      requestHeadersNames = {},\n\
      // The jqXHR state\n\
      state = 0,\n\
      // Default abort message\n\
      strAbort = \"canceled\",\n\
      // Fake xhr\n\
      jqXHR = {\n\
        readyState: 0,\n\
\n\
        // Builds headers hashtable if needed\n\
        getResponseHeader: function( key ) {\n\
          var match;\n\
          if ( state === 2 ) {\n\
            if ( !responseHeaders ) {\n\
              responseHeaders = {};\n\
              while ( (match = rheaders.exec( responseHeadersString )) ) {\n\
                responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];\n\
              }\n\
            }\n\
            match = responseHeaders[ key.toLowerCase() ];\n\
          }\n\
          return match == null ? null : match;\n\
        },\n\
\n\
        // Raw string\n\
        getAllResponseHeaders: function() {\n\
          return state === 2 ? responseHeadersString : null;\n\
        },\n\
\n\
        // Caches the header\n\
        setRequestHeader: function( name, value ) {\n\
          var lname = name.toLowerCase();\n\
          if ( !state ) {\n\
            name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;\n\
            requestHeaders[ name ] = value;\n\
          }\n\
          return this;\n\
        },\n\
\n\
        // Overrides response content-type header\n\
        overrideMimeType: function( type ) {\n\
          if ( !state ) {\n\
            s.mimeType = type;\n\
          }\n\
          return this;\n\
        },\n\
\n\
        // Status-dependent callbacks\n\
        statusCode: function( map ) {\n\
          var code;\n\
          if ( map ) {\n\
            if ( state < 2 ) {\n\
              for ( code in map ) {\n\
                // Lazy-add the new callback in a way that preserves old ones\n\
                statusCode[ code ] = [ statusCode[ code ], map[ code ] ];\n\
              }\n\
            } else {\n\
              // Execute the appropriate callbacks\n\
              jqXHR.always( map[ jqXHR.status ] );\n\
            }\n\
          }\n\
          return this;\n\
        },\n\
\n\
        // Cancel the request\n\
        abort: function( statusText ) {\n\
          var finalText = statusText || strAbort;\n\
          if ( transport ) {\n\
            transport.abort( finalText );\n\
          }\n\
          done( 0, finalText );\n\
          return this;\n\
        }\n\
      };\n\
\n\
    // Attach deferreds\n\
    deferred.promise( jqXHR ).complete = completeDeferred.add;\n\
    jqXHR.success = jqXHR.done;\n\
    jqXHR.error = jqXHR.fail;\n\
\n\
    // Remove hash character (#7531: and string promotion)\n\
    // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)\n\
    // Handle falsy url in the settings object (#10093: consistency with old signature)\n\
    // We also use the url parameter if available\n\
    s.url = ( ( url || s.url || ajaxLocation ) + \"\" ).replace( rhash, \"\" ).replace( rprotocol, ajaxLocParts[ 1 ] + \"//\" );\n\
\n\
    // Alias method option to type as per ticket #12004\n\
    s.type = options.method || options.type || s.method || s.type;\n\
\n\
    // Extract dataTypes list\n\
    s.dataTypes = jQuery.trim( s.dataType || \"*\" ).toLowerCase().match( rnotwhite ) || [ \"\" ];\n\
\n\
    // A cross-domain request is in order when we have a protocol:host:port mismatch\n\
    if ( s.crossDomain == null ) {\n\
      parts = rurl.exec( s.url.toLowerCase() );\n\
      s.crossDomain = !!( parts &&\n\
        ( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||\n\
          ( parts[ 3 ] || ( parts[ 1 ] === \"http:\" ? \"80\" : \"443\" ) ) !==\n\
            ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === \"http:\" ? \"80\" : \"443\" ) ) )\n\
      );\n\
    }\n\
\n\
    // Convert data if not already a string\n\
    if ( s.data && s.processData && typeof s.data !== \"string\" ) {\n\
      s.data = jQuery.param( s.data, s.traditional );\n\
    }\n\
\n\
    // Apply prefilters\n\
    inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );\n\
\n\
    // If request was aborted inside a prefilter, stop there\n\
    if ( state === 2 ) {\n\
      return jqXHR;\n\
    }\n\
\n\
    // We can fire global events as of now if asked to\n\
    fireGlobals = s.global;\n\
\n\
    // Watch for a new set of requests\n\
    if ( fireGlobals && jQuery.active++ === 0 ) {\n\
      jQuery.event.trigger(\"ajaxStart\");\n\
    }\n\
\n\
    // Uppercase the type\n\
    s.type = s.type.toUpperCase();\n\
\n\
    // Determine if request has content\n\
    s.hasContent = !rnoContent.test( s.type );\n\
\n\
    // Save the URL in case we're toying with the If-Modified-Since\n\
    // and/or If-None-Match header later on\n\
    cacheURL = s.url;\n\
\n\
    // More options handling for requests with no content\n\
    if ( !s.hasContent ) {\n\
\n\
      // If data is available, append data to url\n\
      if ( s.data ) {\n\
        cacheURL = ( s.url += ( rquery.test( cacheURL ) ? \"&\" : \"?\" ) + s.data );\n\
        // #9682: remove data so that it's not used in an eventual retry\n\
        delete s.data;\n\
      }\n\
\n\
      // Add anti-cache in url if needed\n\
      if ( s.cache === false ) {\n\
        s.url = rts.test( cacheURL ) ?\n\
\n\
          // If there is already a '_' parameter, set its value\n\
          cacheURL.replace( rts, \"$1_=\" + nonce++ ) :\n\
\n\
          // Otherwise add one to the end\n\
          cacheURL + ( rquery.test( cacheURL ) ? \"&\" : \"?\" ) + \"_=\" + nonce++;\n\
      }\n\
    }\n\
\n\
    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.\n\
    if ( s.ifModified ) {\n\
      if ( jQuery.lastModified[ cacheURL ] ) {\n\
        jqXHR.setRequestHeader( \"If-Modified-Since\", jQuery.lastModified[ cacheURL ] );\n\
      }\n\
      if ( jQuery.etag[ cacheURL ] ) {\n\
        jqXHR.setRequestHeader( \"If-None-Match\", jQuery.etag[ cacheURL ] );\n\
      }\n\
    }\n\
\n\
    // Set the correct header, if data is being sent\n\
    if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {\n\
      jqXHR.setRequestHeader( \"Content-Type\", s.contentType );\n\
    }\n\
\n\
    // Set the Accepts header for the server, depending on the dataType\n\
    jqXHR.setRequestHeader(\n\
      \"Accept\",\n\
      s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?\n\
        s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== \"*\" ? \", \" + allTypes + \"; q=0.01\" : \"\" ) :\n\
        s.accepts[ \"*\" ]\n\
    );\n\
\n\
    // Check for headers option\n\
    for ( i in s.headers ) {\n\
      jqXHR.setRequestHeader( i, s.headers[ i ] );\n\
    }\n\
\n\
    // Allow custom headers/mimetypes and early abort\n\
    if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {\n\
      // Abort if not done already and return\n\
      return jqXHR.abort();\n\
    }\n\
\n\
    // aborting is no longer a cancellation\n\
    strAbort = \"abort\";\n\
\n\
    // Install callbacks on deferreds\n\
    for ( i in { success: 1, error: 1, complete: 1 } ) {\n\
      jqXHR[ i ]( s[ i ] );\n\
    }\n\
\n\
    // Get transport\n\
    transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );\n\
\n\
    // If no transport, we auto-abort\n\
    if ( !transport ) {\n\
      done( -1, \"No Transport\" );\n\
    } else {\n\
      jqXHR.readyState = 1;\n\
\n\
      // Send global event\n\
      if ( fireGlobals ) {\n\
        globalEventContext.trigger( \"ajaxSend\", [ jqXHR, s ] );\n\
      }\n\
      // Timeout\n\
      if ( s.async && s.timeout > 0 ) {\n\
        timeoutTimer = setTimeout(function() {\n\
          jqXHR.abort(\"timeout\");\n\
        }, s.timeout );\n\
      }\n\
\n\
      try {\n\
        state = 1;\n\
        transport.send( requestHeaders, done );\n\
      } catch ( e ) {\n\
        // Propagate exception as error if not done\n\
        if ( state < 2 ) {\n\
          done( -1, e );\n\
        // Simply rethrow otherwise\n\
        } else {\n\
          throw e;\n\
        }\n\
      }\n\
    }\n\
\n\
    // Callback for when everything is done\n\
    function done( status, nativeStatusText, responses, headers ) {\n\
      var isSuccess, success, error, response, modified,\n\
        statusText = nativeStatusText;\n\
\n\
      // Called once\n\
      if ( state === 2 ) {\n\
        return;\n\
      }\n\
\n\
      // State is \"done\" now\n\
      state = 2;\n\
\n\
      // Clear timeout if it exists\n\
      if ( timeoutTimer ) {\n\
        clearTimeout( timeoutTimer );\n\
      }\n\
\n\
      // Dereference transport for early garbage collection\n\
      // (no matter how long the jqXHR object will be used)\n\
      transport = undefined;\n\
\n\
      // Cache response headers\n\
      responseHeadersString = headers || \"\";\n\
\n\
      // Set readyState\n\
      jqXHR.readyState = status > 0 ? 4 : 0;\n\
\n\
      // Determine if successful\n\
      isSuccess = status >= 200 && status < 300 || status === 304;\n\
\n\
      // Get response data\n\
      if ( responses ) {\n\
        response = ajaxHandleResponses( s, jqXHR, responses );\n\
      }\n\
\n\
      // Convert no matter what (that way responseXXX fields are always set)\n\
      response = ajaxConvert( s, response, jqXHR, isSuccess );\n\
\n\
      // If successful, handle type chaining\n\
      if ( isSuccess ) {\n\
\n\
        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.\n\
        if ( s.ifModified ) {\n\
          modified = jqXHR.getResponseHeader(\"Last-Modified\");\n\
          if ( modified ) {\n\
            jQuery.lastModified[ cacheURL ] = modified;\n\
          }\n\
          modified = jqXHR.getResponseHeader(\"etag\");\n\
          if ( modified ) {\n\
            jQuery.etag[ cacheURL ] = modified;\n\
          }\n\
        }\n\
\n\
        // if no content\n\
        if ( status === 204 || s.type === \"HEAD\" ) {\n\
          statusText = \"nocontent\";\n\
\n\
        // if not modified\n\
        } else if ( status === 304 ) {\n\
          statusText = \"notmodified\";\n\
\n\
        // If we have data, let's convert it\n\
        } else {\n\
          statusText = response.state;\n\
          success = response.data;\n\
          error = response.error;\n\
          isSuccess = !error;\n\
        }\n\
      } else {\n\
        // We extract error from statusText\n\
        // then normalize statusText and status for non-aborts\n\
        error = statusText;\n\
        if ( status || !statusText ) {\n\
          statusText = \"error\";\n\
          if ( status < 0 ) {\n\
            status = 0;\n\
          }\n\
        }\n\
      }\n\
\n\
      // Set data for the fake xhr object\n\
      jqXHR.status = status;\n\
      jqXHR.statusText = ( nativeStatusText || statusText ) + \"\";\n\
\n\
      // Success/Error\n\
      if ( isSuccess ) {\n\
        deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );\n\
      } else {\n\
        deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );\n\
      }\n\
\n\
      // Status-dependent callbacks\n\
      jqXHR.statusCode( statusCode );\n\
      statusCode = undefined;\n\
\n\
      if ( fireGlobals ) {\n\
        globalEventContext.trigger( isSuccess ? \"ajaxSuccess\" : \"ajaxError\",\n\
          [ jqXHR, s, isSuccess ? success : error ] );\n\
      }\n\
\n\
      // Complete\n\
      completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );\n\
\n\
      if ( fireGlobals ) {\n\
        globalEventContext.trigger( \"ajaxComplete\", [ jqXHR, s ] );\n\
        // Handle the global AJAX counter\n\
        if ( !( --jQuery.active ) ) {\n\
          jQuery.event.trigger(\"ajaxStop\");\n\
        }\n\
      }\n\
    }\n\
\n\
    return jqXHR;\n\
  },\n\
\n\
  getJSON: function( url, data, callback ) {\n\
    return jQuery.get( url, data, callback, \"json\" );\n\
  },\n\
\n\
  getScript: function( url, callback ) {\n\
    return jQuery.get( url, undefined, callback, \"script\" );\n\
  }\n\
});\n\
\n\
jQuery.each( [ \"get\", \"post\" ], function( i, method ) {\n\
  jQuery[ method ] = function( url, data, callback, type ) {\n\
    // shift arguments if data argument was omitted\n\
    if ( jQuery.isFunction( data ) ) {\n\
      type = type || callback;\n\
      callback = data;\n\
      data = undefined;\n\
    }\n\
\n\
    return jQuery.ajax({\n\
      url: url,\n\
      type: method,\n\
      dataType: type,\n\
      data: data,\n\
      success: callback\n\
    });\n\
  };\n\
});\n\
\n\
// Attach a bunch of functions for handling common AJAX events\n\
jQuery.each( [ \"ajaxStart\", \"ajaxStop\", \"ajaxComplete\", \"ajaxError\", \"ajaxSuccess\", \"ajaxSend\" ], function( i, type ) {\n\
  jQuery.fn[ type ] = function( fn ) {\n\
    return this.on( type, fn );\n\
  };\n\
});\n\
\n\
\n\
jQuery._evalUrl = function( url ) {\n\
  return jQuery.ajax({\n\
    url: url,\n\
    type: \"GET\",\n\
    dataType: \"script\",\n\
    async: false,\n\
    global: false,\n\
    \"throws\": true\n\
  });\n\
};\n\
\n\
\n\
jQuery.fn.extend({\n\
  wrapAll: function( html ) {\n\
    if ( jQuery.isFunction( html ) ) {\n\
      return this.each(function(i) {\n\
        jQuery(this).wrapAll( html.call(this, i) );\n\
      });\n\
    }\n\
\n\
    if ( this[0] ) {\n\
      // The elements to wrap the target around\n\
      var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);\n\
\n\
      if ( this[0].parentNode ) {\n\
        wrap.insertBefore( this[0] );\n\
      }\n\
\n\
      wrap.map(function() {\n\
        var elem = this;\n\
\n\
        while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {\n\
          elem = elem.firstChild;\n\
        }\n\
\n\
        return elem;\n\
      }).append( this );\n\
    }\n\
\n\
    return this;\n\
  },\n\
\n\
  wrapInner: function( html ) {\n\
    if ( jQuery.isFunction( html ) ) {\n\
      return this.each(function(i) {\n\
        jQuery(this).wrapInner( html.call(this, i) );\n\
      });\n\
    }\n\
\n\
    return this.each(function() {\n\
      var self = jQuery( this ),\n\
        contents = self.contents();\n\
\n\
      if ( contents.length ) {\n\
        contents.wrapAll( html );\n\
\n\
      } else {\n\
        self.append( html );\n\
      }\n\
    });\n\
  },\n\
\n\
  wrap: function( html ) {\n\
    var isFunction = jQuery.isFunction( html );\n\
\n\
    return this.each(function(i) {\n\
      jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );\n\
    });\n\
  },\n\
\n\
  unwrap: function() {\n\
    return this.parent().each(function() {\n\
      if ( !jQuery.nodeName( this, \"body\" ) ) {\n\
        jQuery( this ).replaceWith( this.childNodes );\n\
      }\n\
    }).end();\n\
  }\n\
});\n\
\n\
\n\
jQuery.expr.filters.hidden = function( elem ) {\n\
  // Support: Opera <= 12.12\n\
  // Opera reports offsetWidths and offsetHeights less than zero on some elements\n\
  return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||\n\
    (!support.reliableHiddenOffsets() &&\n\
      ((elem.style && elem.style.display) || jQuery.css( elem, \"display\" )) === \"none\");\n\
};\n\
\n\
jQuery.expr.filters.visible = function( elem ) {\n\
  return !jQuery.expr.filters.hidden( elem );\n\
};\n\
\n\
\n\
\n\
\n\
var r20 = /%20/g,\n\
  rbracket = /\\[\\]$/,\n\
  rCRLF = /\\r?\\n\
/g,\n\
  rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,\n\
  rsubmittable = /^(?:input|select|textarea|keygen)/i;\n\
\n\
function buildParams( prefix, obj, traditional, add ) {\n\
  var name;\n\
\n\
  if ( jQuery.isArray( obj ) ) {\n\
    // Serialize array item.\n\
    jQuery.each( obj, function( i, v ) {\n\
      if ( traditional || rbracket.test( prefix ) ) {\n\
        // Treat each array item as a scalar.\n\
        add( prefix, v );\n\
\n\
      } else {\n\
        // Item is non-scalar (array or object), encode its numeric index.\n\
        buildParams( prefix + \"[\" + ( typeof v === \"object\" ? i : \"\" ) + \"]\", v, traditional, add );\n\
      }\n\
    });\n\
\n\
  } else if ( !traditional && jQuery.type( obj ) === \"object\" ) {\n\
    // Serialize object item.\n\
    for ( name in obj ) {\n\
      buildParams( prefix + \"[\" + name + \"]\", obj[ name ], traditional, add );\n\
    }\n\
\n\
  } else {\n\
    // Serialize scalar item.\n\
    add( prefix, obj );\n\
  }\n\
}\n\
\n\
// Serialize an array of form elements or a set of\n\
// key/values into a query string\n\
jQuery.param = function( a, traditional ) {\n\
  var prefix,\n\
    s = [],\n\
    add = function( key, value ) {\n\
      // If value is a function, invoke it and return its value\n\
      value = jQuery.isFunction( value ) ? value() : ( value == null ? \"\" : value );\n\
      s[ s.length ] = encodeURIComponent( key ) + \"=\" + encodeURIComponent( value );\n\
    };\n\
\n\
  // Set traditional to true for jQuery <= 1.3.2 behavior.\n\
  if ( traditional === undefined ) {\n\
    traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;\n\
  }\n\
\n\
  // If an array was passed in, assume that it is an array of form elements.\n\
  if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {\n\
    // Serialize the form elements\n\
    jQuery.each( a, function() {\n\
      add( this.name, this.value );\n\
    });\n\
\n\
  } else {\n\
    // If traditional, encode the \"old\" way (the way 1.3.2 or older\n\
    // did it), otherwise encode params recursively.\n\
    for ( prefix in a ) {\n\
      buildParams( prefix, a[ prefix ], traditional, add );\n\
    }\n\
  }\n\
\n\
  // Return the resulting serialization\n\
  return s.join( \"&\" ).replace( r20, \"+\" );\n\
};\n\
\n\
jQuery.fn.extend({\n\
  serialize: function() {\n\
    return jQuery.param( this.serializeArray() );\n\
  },\n\
  serializeArray: function() {\n\
    return this.map(function() {\n\
      // Can add propHook for \"elements\" to filter or add form elements\n\
      var elements = jQuery.prop( this, \"elements\" );\n\
      return elements ? jQuery.makeArray( elements ) : this;\n\
    })\n\
    .filter(function() {\n\
      var type = this.type;\n\
      // Use .is(\":disabled\") so that fieldset[disabled] works\n\
      return this.name && !jQuery( this ).is( \":disabled\" ) &&\n\
        rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&\n\
        ( this.checked || !rcheckableType.test( type ) );\n\
    })\n\
    .map(function( i, elem ) {\n\
      var val = jQuery( this ).val();\n\
\n\
      return val == null ?\n\
        null :\n\
        jQuery.isArray( val ) ?\n\
          jQuery.map( val, function( val ) {\n\
            return { name: elem.name, value: val.replace( rCRLF, \"\\r\\n\
\" ) };\n\
          }) :\n\
          { name: elem.name, value: val.replace( rCRLF, \"\\r\\n\
\" ) };\n\
    }).get();\n\
  }\n\
});\n\
\n\
\n\
// Create the request object\n\
// (This is still attached to ajaxSettings for backward compatibility)\n\
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?\n\
  // Support: IE6+\n\
  function() {\n\
\n\
    // XHR cannot access local files, always use ActiveX for that case\n\
    return !this.isLocal &&\n\
\n\
      // Support: IE7-8\n\
      // oldIE XHR does not support non-RFC2616 methods (#13240)\n\
      // See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx\n\
      // and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9\n\
      // Although this check for six methods instead of eight\n\
      // since IE also does not support \"trace\" and \"connect\"\n\
      /^(get|post|head|put|delete|options)$/i.test( this.type ) &&\n\
\n\
      createStandardXHR() || createActiveXHR();\n\
  } :\n\
  // For all other browsers, use the standard XMLHttpRequest object\n\
  createStandardXHR;\n\
\n\
var xhrId = 0,\n\
  xhrCallbacks = {},\n\
  xhrSupported = jQuery.ajaxSettings.xhr();\n\
\n\
// Support: IE<10\n\
// Open requests must be manually aborted on unload (#5280)\n\
if ( window.ActiveXObject ) {\n\
  jQuery( window ).on( \"unload\", function() {\n\
    for ( var key in xhrCallbacks ) {\n\
      xhrCallbacks[ key ]( undefined, true );\n\
    }\n\
  });\n\
}\n\
\n\
// Determine support properties\n\
support.cors = !!xhrSupported && ( \"withCredentials\" in xhrSupported );\n\
xhrSupported = support.ajax = !!xhrSupported;\n\
\n\
// Create transport if the browser can provide an xhr\n\
if ( xhrSupported ) {\n\
\n\
  jQuery.ajaxTransport(function( options ) {\n\
    // Cross domain only allowed if supported through XMLHttpRequest\n\
    if ( !options.crossDomain || support.cors ) {\n\
\n\
      var callback;\n\
\n\
      return {\n\
        send: function( headers, complete ) {\n\
          var i,\n\
            xhr = options.xhr(),\n\
            id = ++xhrId;\n\
\n\
          // Open the socket\n\
          xhr.open( options.type, options.url, options.async, options.username, options.password );\n\
\n\
          // Apply custom fields if provided\n\
          if ( options.xhrFields ) {\n\
            for ( i in options.xhrFields ) {\n\
              xhr[ i ] = options.xhrFields[ i ];\n\
            }\n\
          }\n\
\n\
          // Override mime type if needed\n\
          if ( options.mimeType && xhr.overrideMimeType ) {\n\
            xhr.overrideMimeType( options.mimeType );\n\
          }\n\
\n\
          // X-Requested-With header\n\
          // For cross-domain requests, seeing as conditions for a preflight are\n\
          // akin to a jigsaw puzzle, we simply never set it to be sure.\n\
          // (it can always be set on a per-request basis or even using ajaxSetup)\n\
          // For same-domain requests, won't change header if already provided.\n\
          if ( !options.crossDomain && !headers[\"X-Requested-With\"] ) {\n\
            headers[\"X-Requested-With\"] = \"XMLHttpRequest\";\n\
          }\n\
\n\
          // Set headers\n\
          for ( i in headers ) {\n\
            // Support: IE<9\n\
            // IE's ActiveXObject throws a 'Type Mismatch' exception when setting\n\
            // request header to a null-value.\n\
            //\n\
            // To keep consistent with other XHR implementations, cast the value\n\
            // to string and ignore `undefined`.\n\
            if ( headers[ i ] !== undefined ) {\n\
              xhr.setRequestHeader( i, headers[ i ] + \"\" );\n\
            }\n\
          }\n\
\n\
          // Do send the request\n\
          // This may raise an exception which is actually\n\
          // handled in jQuery.ajax (so no try/catch here)\n\
          xhr.send( ( options.hasContent && options.data ) || null );\n\
\n\
          // Listener\n\
          callback = function( _, isAbort ) {\n\
            var status, statusText, responses;\n\
\n\
            // Was never called and is aborted or complete\n\
            if ( callback && ( isAbort || xhr.readyState === 4 ) ) {\n\
              // Clean up\n\
              delete xhrCallbacks[ id ];\n\
              callback = undefined;\n\
              xhr.onreadystatechange = jQuery.noop;\n\
\n\
              // Abort manually if needed\n\
              if ( isAbort ) {\n\
                if ( xhr.readyState !== 4 ) {\n\
                  xhr.abort();\n\
                }\n\
              } else {\n\
                responses = {};\n\
                status = xhr.status;\n\
\n\
                // Support: IE<10\n\
                // Accessing binary-data responseText throws an exception\n\
                // (#11426)\n\
                if ( typeof xhr.responseText === \"string\" ) {\n\
                  responses.text = xhr.responseText;\n\
                }\n\
\n\
                // Firefox throws an exception when accessing\n\
                // statusText for faulty cross-domain requests\n\
                try {\n\
                  statusText = xhr.statusText;\n\
                } catch( e ) {\n\
                  // We normalize with Webkit giving an empty statusText\n\
                  statusText = \"\";\n\
                }\n\
\n\
                // Filter status for non standard behaviors\n\
\n\
                // If the request is local and we have data: assume a success\n\
                // (success with no data won't get notified, that's the best we\n\
                // can do given current implementations)\n\
                if ( !status && options.isLocal && !options.crossDomain ) {\n\
                  status = responses.text ? 200 : 404;\n\
                // IE - #1450: sometimes returns 1223 when it should be 204\n\
                } else if ( status === 1223 ) {\n\
                  status = 204;\n\
                }\n\
              }\n\
            }\n\
\n\
            // Call complete if needed\n\
            if ( responses ) {\n\
              complete( status, statusText, responses, xhr.getAllResponseHeaders() );\n\
            }\n\
          };\n\
\n\
          if ( !options.async ) {\n\
            // if we're in sync mode we fire the callback\n\
            callback();\n\
          } else if ( xhr.readyState === 4 ) {\n\
            // (IE6 & IE7) if it's in cache and has been\n\
            // retrieved directly we need to fire the callback\n\
            setTimeout( callback );\n\
          } else {\n\
            // Add to the list of active xhr callbacks\n\
            xhr.onreadystatechange = xhrCallbacks[ id ] = callback;\n\
          }\n\
        },\n\
\n\
        abort: function() {\n\
          if ( callback ) {\n\
            callback( undefined, true );\n\
          }\n\
        }\n\
      };\n\
    }\n\
  });\n\
}\n\
\n\
// Functions to create xhrs\n\
function createStandardXHR() {\n\
  try {\n\
    return new window.XMLHttpRequest();\n\
  } catch( e ) {}\n\
}\n\
\n\
function createActiveXHR() {\n\
  try {\n\
    return new window.ActiveXObject( \"Microsoft.XMLHTTP\" );\n\
  } catch( e ) {}\n\
}\n\
\n\
\n\
\n\
\n\
// Install script dataType\n\
jQuery.ajaxSetup({\n\
  accepts: {\n\
    script: \"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript\"\n\
  },\n\
  contents: {\n\
    script: /(?:java|ecma)script/\n\
  },\n\
  converters: {\n\
    \"text script\": function( text ) {\n\
      jQuery.globalEval( text );\n\
      return text;\n\
    }\n\
  }\n\
});\n\
\n\
// Handle cache's special case and global\n\
jQuery.ajaxPrefilter( \"script\", function( s ) {\n\
  if ( s.cache === undefined ) {\n\
    s.cache = false;\n\
  }\n\
  if ( s.crossDomain ) {\n\
    s.type = \"GET\";\n\
    s.global = false;\n\
  }\n\
});\n\
\n\
// Bind script tag hack transport\n\
jQuery.ajaxTransport( \"script\", function(s) {\n\
\n\
  // This transport only deals with cross domain requests\n\
  if ( s.crossDomain ) {\n\
\n\
    var script,\n\
      head = document.head || jQuery(\"head\")[0] || document.documentElement;\n\
\n\
    return {\n\
\n\
      send: function( _, callback ) {\n\
\n\
        script = document.createElement(\"script\");\n\
\n\
        script.async = true;\n\
\n\
        if ( s.scriptCharset ) {\n\
          script.charset = s.scriptCharset;\n\
        }\n\
\n\
        script.src = s.url;\n\
\n\
        // Attach handlers for all browsers\n\
        script.onload = script.onreadystatechange = function( _, isAbort ) {\n\
\n\
          if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {\n\
\n\
            // Handle memory leak in IE\n\
            script.onload = script.onreadystatechange = null;\n\
\n\
            // Remove the script\n\
            if ( script.parentNode ) {\n\
              script.parentNode.removeChild( script );\n\
            }\n\
\n\
            // Dereference the script\n\
            script = null;\n\
\n\
            // Callback if not abort\n\
            if ( !isAbort ) {\n\
              callback( 200, \"success\" );\n\
            }\n\
          }\n\
        };\n\
\n\
        // Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending\n\
        // Use native DOM manipulation to avoid our domManip AJAX trickery\n\
        head.insertBefore( script, head.firstChild );\n\
      },\n\
\n\
      abort: function() {\n\
        if ( script ) {\n\
          script.onload( undefined, true );\n\
        }\n\
      }\n\
    };\n\
  }\n\
});\n\
\n\
\n\
\n\
\n\
var oldCallbacks = [],\n\
  rjsonp = /(=)\\?(?=&|$)|\\?\\?/;\n\
\n\
// Default jsonp settings\n\
jQuery.ajaxSetup({\n\
  jsonp: \"callback\",\n\
  jsonpCallback: function() {\n\
    var callback = oldCallbacks.pop() || ( jQuery.expando + \"_\" + ( nonce++ ) );\n\
    this[ callback ] = true;\n\
    return callback;\n\
  }\n\
});\n\
\n\
// Detect, normalize options and install callbacks for jsonp requests\n\
jQuery.ajaxPrefilter( \"json jsonp\", function( s, originalSettings, jqXHR ) {\n\
\n\
  var callbackName, overwritten, responseContainer,\n\
    jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?\n\
      \"url\" :\n\
      typeof s.data === \"string\" && !( s.contentType || \"\" ).indexOf(\"application/x-www-form-urlencoded\") && rjsonp.test( s.data ) && \"data\"\n\
    );\n\
\n\
  // Handle iff the expected data type is \"jsonp\" or we have a parameter to set\n\
  if ( jsonProp || s.dataTypes[ 0 ] === \"jsonp\" ) {\n\
\n\
    // Get callback name, remembering preexisting value associated with it\n\
    callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?\n\
      s.jsonpCallback() :\n\
      s.jsonpCallback;\n\
\n\
    // Insert callback into url or form data\n\
    if ( jsonProp ) {\n\
      s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, \"$1\" + callbackName );\n\
    } else if ( s.jsonp !== false ) {\n\
      s.url += ( rquery.test( s.url ) ? \"&\" : \"?\" ) + s.jsonp + \"=\" + callbackName;\n\
    }\n\
\n\
    // Use data converter to retrieve json after script execution\n\
    s.converters[\"script json\"] = function() {\n\
      if ( !responseContainer ) {\n\
        jQuery.error( callbackName + \" was not called\" );\n\
      }\n\
      return responseContainer[ 0 ];\n\
    };\n\
\n\
    // force json dataType\n\
    s.dataTypes[ 0 ] = \"json\";\n\
\n\
    // Install callback\n\
    overwritten = window[ callbackName ];\n\
    window[ callbackName ] = function() {\n\
      responseContainer = arguments;\n\
    };\n\
\n\
    // Clean-up function (fires after converters)\n\
    jqXHR.always(function() {\n\
      // Restore preexisting value\n\
      window[ callbackName ] = overwritten;\n\
\n\
      // Save back as free\n\
      if ( s[ callbackName ] ) {\n\
        // make sure that re-using the options doesn't screw things around\n\
        s.jsonpCallback = originalSettings.jsonpCallback;\n\
\n\
        // save the callback name for future use\n\
        oldCallbacks.push( callbackName );\n\
      }\n\
\n\
      // Call if it was a function and we have a response\n\
      if ( responseContainer && jQuery.isFunction( overwritten ) ) {\n\
        overwritten( responseContainer[ 0 ] );\n\
      }\n\
\n\
      responseContainer = overwritten = undefined;\n\
    });\n\
\n\
    // Delegate to script\n\
    return \"script\";\n\
  }\n\
});\n\
\n\
\n\
\n\
\n\
// data: string of html\n\
// context (optional): If specified, the fragment will be created in this context, defaults to document\n\
// keepScripts (optional): If true, will include scripts passed in the html string\n\
jQuery.parseHTML = function( data, context, keepScripts ) {\n\
  if ( !data || typeof data !== \"string\" ) {\n\
    return null;\n\
  }\n\
  if ( typeof context === \"boolean\" ) {\n\
    keepScripts = context;\n\
    context = false;\n\
  }\n\
  context = context || document;\n\
\n\
  var parsed = rsingleTag.exec( data ),\n\
    scripts = !keepScripts && [];\n\
\n\
  // Single tag\n\
  if ( parsed ) {\n\
    return [ context.createElement( parsed[1] ) ];\n\
  }\n\
\n\
  parsed = jQuery.buildFragment( [ data ], context, scripts );\n\
\n\
  if ( scripts && scripts.length ) {\n\
    jQuery( scripts ).remove();\n\
  }\n\
\n\
  return jQuery.merge( [], parsed.childNodes );\n\
};\n\
\n\
\n\
// Keep a copy of the old load method\n\
var _load = jQuery.fn.load;\n\
\n\
/**\n\
 * Load a url into a page\n\
 */\n\
jQuery.fn.load = function( url, params, callback ) {\n\
  if ( typeof url !== \"string\" && _load ) {\n\
    return _load.apply( this, arguments );\n\
  }\n\
\n\
  var selector, response, type,\n\
    self = this,\n\
    off = url.indexOf(\" \");\n\
\n\
  if ( off >= 0 ) {\n\
    selector = jQuery.trim( url.slice( off, url.length ) );\n\
    url = url.slice( 0, off );\n\
  }\n\
\n\
  // If it's a function\n\
  if ( jQuery.isFunction( params ) ) {\n\
\n\
    // We assume that it's the callback\n\
    callback = params;\n\
    params = undefined;\n\
\n\
  // Otherwise, build a param string\n\
  } else if ( params && typeof params === \"object\" ) {\n\
    type = \"POST\";\n\
  }\n\
\n\
  // If we have elements to modify, make the request\n\
  if ( self.length > 0 ) {\n\
    jQuery.ajax({\n\
      url: url,\n\
\n\
      // if \"type\" variable is undefined, then \"GET\" method will be used\n\
      type: type,\n\
      dataType: \"html\",\n\
      data: params\n\
    }).done(function( responseText ) {\n\
\n\
      // Save response for use in complete callback\n\
      response = arguments;\n\
\n\
      self.html( selector ?\n\
\n\
        // If a selector was specified, locate the right elements in a dummy div\n\
        // Exclude scripts to avoid IE 'Permission Denied' errors\n\
        jQuery(\"<div>\").append( jQuery.parseHTML( responseText ) ).find( selector ) :\n\
\n\
        // Otherwise use the full result\n\
        responseText );\n\
\n\
    }).complete( callback && function( jqXHR, status ) {\n\
      self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );\n\
    });\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
\n\
\n\
\n\
jQuery.expr.filters.animated = function( elem ) {\n\
  return jQuery.grep(jQuery.timers, function( fn ) {\n\
    return elem === fn.elem;\n\
  }).length;\n\
};\n\
\n\
\n\
\n\
\n\
\n\
var docElem = window.document.documentElement;\n\
\n\
/**\n\
 * Gets a window from an element\n\
 */\n\
function getWindow( elem ) {\n\
  return jQuery.isWindow( elem ) ?\n\
    elem :\n\
    elem.nodeType === 9 ?\n\
      elem.defaultView || elem.parentWindow :\n\
      false;\n\
}\n\
\n\
jQuery.offset = {\n\
  setOffset: function( elem, options, i ) {\n\
    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,\n\
      position = jQuery.css( elem, \"position\" ),\n\
      curElem = jQuery( elem ),\n\
      props = {};\n\
\n\
    // set position first, in-case top/left are set even on static elem\n\
    if ( position === \"static\" ) {\n\
      elem.style.position = \"relative\";\n\
    }\n\
\n\
    curOffset = curElem.offset();\n\
    curCSSTop = jQuery.css( elem, \"top\" );\n\
    curCSSLeft = jQuery.css( elem, \"left\" );\n\
    calculatePosition = ( position === \"absolute\" || position === \"fixed\" ) &&\n\
      jQuery.inArray(\"auto\", [ curCSSTop, curCSSLeft ] ) > -1;\n\
\n\
    // need to be able to calculate position if either top or left is auto and position is either absolute or fixed\n\
    if ( calculatePosition ) {\n\
      curPosition = curElem.position();\n\
      curTop = curPosition.top;\n\
      curLeft = curPosition.left;\n\
    } else {\n\
      curTop = parseFloat( curCSSTop ) || 0;\n\
      curLeft = parseFloat( curCSSLeft ) || 0;\n\
    }\n\
\n\
    if ( jQuery.isFunction( options ) ) {\n\
      options = options.call( elem, i, curOffset );\n\
    }\n\
\n\
    if ( options.top != null ) {\n\
      props.top = ( options.top - curOffset.top ) + curTop;\n\
    }\n\
    if ( options.left != null ) {\n\
      props.left = ( options.left - curOffset.left ) + curLeft;\n\
    }\n\
\n\
    if ( \"using\" in options ) {\n\
      options.using.call( elem, props );\n\
    } else {\n\
      curElem.css( props );\n\
    }\n\
  }\n\
};\n\
\n\
jQuery.fn.extend({\n\
  offset: function( options ) {\n\
    if ( arguments.length ) {\n\
      return options === undefined ?\n\
        this :\n\
        this.each(function( i ) {\n\
          jQuery.offset.setOffset( this, options, i );\n\
        });\n\
    }\n\
\n\
    var docElem, win,\n\
      box = { top: 0, left: 0 },\n\
      elem = this[ 0 ],\n\
      doc = elem && elem.ownerDocument;\n\
\n\
    if ( !doc ) {\n\
      return;\n\
    }\n\
\n\
    docElem = doc.documentElement;\n\
\n\
    // Make sure it's not a disconnected DOM node\n\
    if ( !jQuery.contains( docElem, elem ) ) {\n\
      return box;\n\
    }\n\
\n\
    // If we don't have gBCR, just use 0,0 rather than error\n\
    // BlackBerry 5, iOS 3 (original iPhone)\n\
    if ( typeof elem.getBoundingClientRect !== strundefined ) {\n\
      box = elem.getBoundingClientRect();\n\
    }\n\
    win = getWindow( doc );\n\
    return {\n\
      top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),\n\
      left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )\n\
    };\n\
  },\n\
\n\
  position: function() {\n\
    if ( !this[ 0 ] ) {\n\
      return;\n\
    }\n\
\n\
    var offsetParent, offset,\n\
      parentOffset = { top: 0, left: 0 },\n\
      elem = this[ 0 ];\n\
\n\
    // fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent\n\
    if ( jQuery.css( elem, \"position\" ) === \"fixed\" ) {\n\
      // we assume that getBoundingClientRect is available when computed position is fixed\n\
      offset = elem.getBoundingClientRect();\n\
    } else {\n\
      // Get *real* offsetParent\n\
      offsetParent = this.offsetParent();\n\
\n\
      // Get correct offsets\n\
      offset = this.offset();\n\
      if ( !jQuery.nodeName( offsetParent[ 0 ], \"html\" ) ) {\n\
        parentOffset = offsetParent.offset();\n\
      }\n\
\n\
      // Add offsetParent borders\n\
      parentOffset.top  += jQuery.css( offsetParent[ 0 ], \"borderTopWidth\", true );\n\
      parentOffset.left += jQuery.css( offsetParent[ 0 ], \"borderLeftWidth\", true );\n\
    }\n\
\n\
    // Subtract parent offsets and element margins\n\
    // note: when an element has margin: auto the offsetLeft and marginLeft\n\
    // are the same in Safari causing offset.left to incorrectly be 0\n\
    return {\n\
      top:  offset.top  - parentOffset.top - jQuery.css( elem, \"marginTop\", true ),\n\
      left: offset.left - parentOffset.left - jQuery.css( elem, \"marginLeft\", true)\n\
    };\n\
  },\n\
\n\
  offsetParent: function() {\n\
    return this.map(function() {\n\
      var offsetParent = this.offsetParent || docElem;\n\
\n\
      while ( offsetParent && ( !jQuery.nodeName( offsetParent, \"html\" ) && jQuery.css( offsetParent, \"position\" ) === \"static\" ) ) {\n\
        offsetParent = offsetParent.offsetParent;\n\
      }\n\
      return offsetParent || docElem;\n\
    });\n\
  }\n\
});\n\
\n\
// Create scrollLeft and scrollTop methods\n\
jQuery.each( { scrollLeft: \"pageXOffset\", scrollTop: \"pageYOffset\" }, function( method, prop ) {\n\
  var top = /Y/.test( prop );\n\
\n\
  jQuery.fn[ method ] = function( val ) {\n\
    return access( this, function( elem, method, val ) {\n\
      var win = getWindow( elem );\n\
\n\
      if ( val === undefined ) {\n\
        return win ? (prop in win) ? win[ prop ] :\n\
          win.document.documentElement[ method ] :\n\
          elem[ method ];\n\
      }\n\
\n\
      if ( win ) {\n\
        win.scrollTo(\n\
          !top ? val : jQuery( win ).scrollLeft(),\n\
          top ? val : jQuery( win ).scrollTop()\n\
        );\n\
\n\
      } else {\n\
        elem[ method ] = val;\n\
      }\n\
    }, method, val, arguments.length, null );\n\
  };\n\
});\n\
\n\
// Add the top/left cssHooks using jQuery.fn.position\n\
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084\n\
// getComputedStyle returns percent when specified for top/left/bottom/right\n\
// rather than make the css module depend on the offset module, we just check for it here\n\
jQuery.each( [ \"top\", \"left\" ], function( i, prop ) {\n\
  jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,\n\
    function( elem, computed ) {\n\
      if ( computed ) {\n\
        computed = curCSS( elem, prop );\n\
        // if curCSS returns percentage, fallback to offset\n\
        return rnumnonpx.test( computed ) ?\n\
          jQuery( elem ).position()[ prop ] + \"px\" :\n\
          computed;\n\
      }\n\
    }\n\
  );\n\
});\n\
\n\
\n\
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods\n\
jQuery.each( { Height: \"height\", Width: \"width\" }, function( name, type ) {\n\
  jQuery.each( { padding: \"inner\" + name, content: type, \"\": \"outer\" + name }, function( defaultExtra, funcName ) {\n\
    // margin is only for outerHeight, outerWidth\n\
    jQuery.fn[ funcName ] = function( margin, value ) {\n\
      var chainable = arguments.length && ( defaultExtra || typeof margin !== \"boolean\" ),\n\
        extra = defaultExtra || ( margin === true || value === true ? \"margin\" : \"border\" );\n\
\n\
      return access( this, function( elem, type, value ) {\n\
        var doc;\n\
\n\
        if ( jQuery.isWindow( elem ) ) {\n\
          // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there\n\
          // isn't a whole lot we can do. See pull request at this URL for discussion:\n\
          // https://github.com/jquery/jquery/pull/764\n\
          return elem.document.documentElement[ \"client\" + name ];\n\
        }\n\
\n\
        // Get document width or height\n\
        if ( elem.nodeType === 9 ) {\n\
          doc = elem.documentElement;\n\
\n\
          // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest\n\
          // unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.\n\
          return Math.max(\n\
            elem.body[ \"scroll\" + name ], doc[ \"scroll\" + name ],\n\
            elem.body[ \"offset\" + name ], doc[ \"offset\" + name ],\n\
            doc[ \"client\" + name ]\n\
          );\n\
        }\n\
\n\
        return value === undefined ?\n\
          // Get width or height on the element, requesting but not forcing parseFloat\n\
          jQuery.css( elem, type, extra ) :\n\
\n\
          // Set width or height on the element\n\
          jQuery.style( elem, type, value, extra );\n\
      }, type, chainable ? margin : undefined, chainable, null );\n\
    };\n\
  });\n\
});\n\
\n\
\n\
// The number of elements contained in the matched element set\n\
jQuery.fn.size = function() {\n\
  return this.length;\n\
};\n\
\n\
jQuery.fn.andSelf = jQuery.fn.addBack;\n\
\n\
\n\
\n\
\n\
// Register as a named AMD module, since jQuery can be concatenated with other\n\
// files that may use define, but not via a proper concatenation script that\n\
// understands anonymous AMD modules. A named AMD is safest and most robust\n\
// way to register. Lowercase jquery is used because AMD module names are\n\
// derived from file names, and jQuery is normally delivered in a lowercase\n\
// file name. Do this after creating the global so that if an AMD module wants\n\
// to call noConflict to hide this version of jQuery, it will work.\n\
\n\
// Note that for maximum portability, libraries that are not jQuery should\n\
// declare themselves as anonymous modules, and avoid setting a global if an\n\
// AMD loader is present. jQuery is a special case. For more information, see\n\
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon\n\
\n\
if ( typeof define === \"function\" && define.amd ) {\n\
  define( \"jquery\", [], function() {\n\
    return jQuery;\n\
  });\n\
}\n\
\n\
\n\
\n\
\n\
var\n\
  // Map over jQuery in case of overwrite\n\
  _jQuery = window.jQuery,\n\
\n\
  // Map over the $ in case of overwrite\n\
  _$ = window.$;\n\
\n\
jQuery.noConflict = function( deep ) {\n\
  if ( window.$ === jQuery ) {\n\
    window.$ = _$;\n\
  }\n\
\n\
  if ( deep && window.jQuery === jQuery ) {\n\
    window.jQuery = _jQuery;\n\
  }\n\
\n\
  return jQuery;\n\
};\n\
\n\
// Expose jQuery and $ identifiers, even in\n\
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)\n\
// and CommonJS for browser emulators (#13566)\n\
if ( typeof noGlobal === strundefined ) {\n\
  window.jQuery = window.$ = jQuery;\n\
}\n\
\n\
\n\
\n\
\n\
return jQuery;\n\
\n\
}));\n\
\n\
//# sourceURL=components/component/jquery/1.0.0/index.js"
));

require.modules["component-jquery"] = require.modules["component~jquery@1.0.0"];
require.modules["component~jquery"] = require.modules["component~jquery@1.0.0"];
require.modules["jquery"] = require.modules["component~jquery@1.0.0"];


require.register("yyolk~jquery-fracs@master", Function("exports, module",
"/*! jQuery.fracs 0.11 - //larsjung.de/fracs - MIT License */\n\
\n\
(function (window, document, $) {\n\
'use strict';\n\
/*jslint browser: true, confusion: true, nomen: true, regexp: true, vars: true, white: true */\n\
/*global jQuery */\n\
\n\
    // Some often used references.\n\
  var $window = $(window),\n\
    $document = $(document),\n\
    extend = $.extend,\n\
    isFn = $.isFunction,\n\
    slice = [].slice,\n\
    mathMax = Math.max,\n\
    mathMin = Math.min,\n\
    mathRound = Math.round,\n\
    isTypeOf = function (obj, type) {\n\
\n\
      return typeof obj === type;\n\
    },\n\
    isInstanceOf = function (obj, type) {\n\
\n\
      return obj instanceof type;\n\
    },\n\
    isHTMLElement = function (obj) {\n\
\n\
      return obj && obj.nodeType;\n\
    },\n\
    getHTMLElement = function (obj) {\n\
\n\
      return isHTMLElement(obj) ? obj : (isInstanceOf(obj, $) ? obj[0] : undefined);\n\
    },\n\
    reduce = function (elements, fn, current) {\n\
\n\
      $.each(elements, function (idx, element) {\n\
\n\
        current = fn.call(element, current, idx, element);\n\
      });\n\
      return current;\n\
    },\n\
    getId = (function () {\n\
\n\
      var ids = {},\n\
        nextId = 1;\n\
\n\
      return function (element) {\n\
\n\
        if (!element) {\n\
          return 0;\n\
        }\n\
        if (!ids[element]) {\n\
          ids[element] = nextId;\n\
          nextId += 1;\n\
        }\n\
        return ids[element];\n\
      };\n\
    }()),\n\
    equal = function (obj1, obj2, props) {\n\
\n\
      var i, l, prop;\n\
\n\
      if (obj1 === obj2) {\n\
        return true;\n\
      }\n\
      if (!obj1 || !obj2 || obj1.constructor !== obj2.constructor) {\n\
        return false;\n\
      }\n\
      for (i = 0, l = props.length; i < l; i += 1) {\n\
        prop = props[i];\n\
        if (obj1[prop] && isFn(obj1[prop].equals) && !obj1[prop].equals(obj2[prop])) {\n\
          return false;\n\
        }\n\
        if (obj1[prop] !== obj2[prop]) {\n\
          return false;\n\
        }\n\
      }\n\
      return true;\n\
    };\n\
\n\
\n\
\n\
\n\
\n\
  // Objects\n\
  // =======\n\
\n\
  // Rect\n\
  // ----\n\
  // Holds the position and dimensions of a rectangle. The position might be\n\
  // relative to document, viewport or element space.\n\
  var Rect = function (left, top, width, height) {\n\
\n\
    // Top left corner of the rectangle rounded to integers.\n\
    this.left = mathRound(left);\n\
    this.top = mathRound(top);\n\
\n\
    // Dimensions rounded to integers.\n\
    this.width = mathRound(width);\n\
    this.height = mathRound(height);\n\
\n\
    // Bottom right corner of the rectangle.\n\
    this.right = this.left + this.width;\n\
    this.bottom = this.top + this.height;\n\
  };\n\
\n\
  // ### Prototype\n\
  extend(Rect.prototype, {\n\
\n\
    // Checks if this instance equals `that` in position and dimensions.\n\
    equals: function (that) {\n\
\n\
      return equal(this, that, ['left', 'top', 'width', 'height']);\n\
    },\n\
\n\
    // Returns the area of this rectangle.\n\
    area: function () {\n\
\n\
      return this.width * this.height;\n\
    },\n\
\n\
    // Returns a new `Rect` representig this rect relative to `rect`.\n\
    relativeTo: function (rect) {\n\
\n\
      return new Rect(this.left - rect.left, this.top - rect.top, this.width, this.height);\n\
    },\n\
\n\
    // Returns a new rectangle representing the intersection of this\n\
    // instance and `rect`. If there is no intersection the return value\n\
    // is `null`.\n\
    intersection: function (rect) {\n\
\n\
      if (!isInstanceOf(rect, Rect)) {\n\
        return null;\n\
      }\n\
\n\
      var left = mathMax(this.left, rect.left),\n\
        right = mathMin(this.right, rect.right),\n\
        top = mathMax(this.top, rect.top),\n\
        bottom = mathMin(this.bottom, rect.bottom),\n\
        width = right - left,\n\
        height = bottom - top;\n\
\n\
      return (width >= 0 && height >= 0) ? new Rect(left, top, width, height) : null;\n\
    },\n\
\n\
    // Returns a new rectangle representing the smallest rectangle\n\
    // containing this instance and `rect`.\n\
    envelope: function (rect) {\n\
\n\
      if (!isInstanceOf(rect, Rect)) {\n\
        return this;\n\
      }\n\
\n\
      var left = mathMin(this.left, rect.left),\n\
        right = mathMax(this.right, rect.right),\n\
        top = mathMin(this.top, rect.top),\n\
        bottom = mathMax(this.bottom, rect.bottom),\n\
        width = right - left,\n\
        height = bottom - top;\n\
\n\
      return new Rect(left, top, width, height);\n\
    }\n\
  });\n\
\n\
  // ### Static methods\n\
  extend(Rect, {\n\
\n\
    // Returns a new instance of `Rect` representing the content of the\n\
    // specified element. Since the coordinates are in content space the\n\
    // `left` and `top` values are always set to `0`. If `inDocSpace` is\n\
    // `true` the rect gets returned in document space.\n\
    ofContent: function (element, inContentSpace) {\n\
\n\
      if (!element || element === document || element === window) {\n\
        return new Rect(0, 0, $document.width(), $document.height());\n\
      }\n\
\n\
      if (inContentSpace) {\n\
        return new Rect(0, 0, element.scrollWidth, element.scrollHeight);\n\
      } else {\n\
        return new Rect(element.offsetLeft - element.scrollLeft, element.offsetTop - element.scrollTop, element.scrollWidth, element.scrollHeight);\n\
      }\n\
    },\n\
\n\
    // Returns a new instance of `Rect` representing the viewport of the\n\
    // specified element. If `inDocSpace` is `true` the rect gets returned\n\
    // in document space instead of content space.\n\
    ofViewport: function (element, inContentSpace) {\n\
\n\
      if (!element || element === document || element === window) {\n\
        return new Rect($window.scrollLeft(), $window.scrollTop(), $window.width(), $window.height());\n\
      }\n\
\n\
      if (inContentSpace) {\n\
        return new Rect(element.scrollLeft, element.scrollTop, element.clientWidth, element.clientHeight);\n\
      } else {\n\
        return new Rect(element.offsetLeft, element.offsetTop, element.clientWidth, element.clientHeight);\n\
      }\n\
    },\n\
\n\
    // Returns a new instance of `Rect` representing a given\n\
    // `HTMLElement`. The dimensions respect padding and border widths. If\n\
    // the element is invisible (as determined by jQuery) the return value\n\
    // is null.\n\
    ofElement: function (element) {\n\
\n\
      var $element = $(element);\n\
      if (!$element.is(':visible')) {\n\
        return null;\n\
      }\n\
\n\
      var offset = $element.offset();\n\
      return new Rect(offset.left, offset.top, $element.outerWidth(), $element.outerHeight());\n\
    }\n\
  });\n\
\n\
\n\
\n\
  // Fractions\n\
  // ---------\n\
  // The heart of the library. Creates and holds the\n\
  // fractions data for the two specified rects. `viewport` defaults to\n\
  // `Rect.ofViewport()`.\n\
  var Fractions = function (visible, viewport, possible, rects) {\n\
\n\
    this.visible = visible || 0;\n\
    this.viewport = viewport || 0;\n\
    this.possible = possible || 0;\n\
    this.rects = (rects && extend({}, rects)) || null;\n\
  };\n\
\n\
  // ### Prototype\n\
  extend(Fractions.prototype, {\n\
\n\
    // Checks if this instance equals `that` in all attributes.\n\
    equals: function (that) {\n\
\n\
      return this.fracsEqual(that) && this.rectsEqual(that);\n\
    },\n\
\n\
    // Checks if this instance equals `that` in all fraction attributes.\n\
    fracsEqual: function (that) {\n\
\n\
      return equal(this, that, ['visible', 'viewport', 'possible']);\n\
    },\n\
\n\
    // Checks if this instance equals `that` in all rectangle attributes.\n\
    rectsEqual: function (that) {\n\
\n\
      return equal(this.rects, that.rects, ['document', 'element', 'viewport']);\n\
    }\n\
  });\n\
\n\
  // ### Static methods\n\
  extend(Fractions, {\n\
\n\
    of: function (rect, viewport) {\n\
\n\
      var intersection, intersectionArea, possibleArea;\n\
\n\
      rect = (isHTMLElement(rect) && Rect.ofElement(rect)) || rect;\n\
      viewport = (isHTMLElement(viewport) && Rect.ofViewport(viewport)) || viewport || Rect.ofViewport();\n\
\n\
      intersection = rect.intersection(viewport);\n\
      if (!intersection) {\n\
        return new Fractions();\n\
      }\n\
\n\
      intersectionArea = intersection.area();\n\
      possibleArea = mathMin(rect.width, viewport.width) * mathMin(rect.height, viewport.height);\n\
      return new Fractions(\n\
        intersectionArea / rect.area(),\n\
        intersectionArea / viewport.area(),\n\
        intersectionArea / possibleArea,\n\
        {\n\
          document: intersection,\n\
          element: intersection.relativeTo(rect),\n\
          viewport: intersection.relativeTo(viewport)\n\
        }\n\
      );\n\
    }\n\
  });\n\
\n\
\n\
\n\
  // Group\n\
  // -----\n\
  var Group = function (elements, viewport) {\n\
\n\
    this.els = elements;\n\
    this.viewport = viewport;\n\
  };\n\
\n\
  // ### Helpers\n\
\n\
    // Accepted values for `property` parameters below.\n\
  var rectProps = ['width', 'height', 'left', 'right', 'top', 'bottom'],\n\
    fracsProps = ['possible', 'visible', 'viewport'],\n\
\n\
    // Returns the specified `property` for `HTMLElement element` or `0`\n\
    // if `property` is invalid.\n\
    getValue = function (element, viewport, property) {\n\
\n\
      var obj;\n\
\n\
      if ($.inArray(property, rectProps) >= 0) {\n\
        obj = Rect.ofElement(element);\n\
      } else if ($.inArray(property, fracsProps) >= 0) {\n\
        obj = Fractions.of(element, viewport);\n\
      }\n\
      return obj ? obj[property] : 0;\n\
    },\n\
\n\
    // Sorting functions.\n\
    sortAscending = function (entry1, entry2) {\n\
\n\
      return entry1.val - entry2.val;\n\
    },\n\
    sortDescending = function (entry1, entry2) {\n\
\n\
      return entry2.val - entry1.val;\n\
    };\n\
\n\
  // ### Prototype\n\
  extend(Group.prototype, {\n\
\n\
    // Returns a sorted list of objects `{el: HTMLElement, val: Number}`\n\
    // for the specified `property`. `descending` defaults to `false`.\n\
    sorted: function (property, descending) {\n\
\n\
      var viewport = this.viewport;\n\
\n\
      return $.map(this.els, function (element) {\n\
\n\
            return {\n\
              el: element,\n\
              val: getValue(element, viewport, property)\n\
            };\n\
          })\n\
          .sort(descending ? sortDescending : sortAscending);\n\
    },\n\
\n\
    // Returns the first element of the sorted list returned by `sorted` above,\n\
    // or `null` if this list is empty.\n\
    best: function (property, descending) {\n\
\n\
      return this.els.length ? this.sorted(property, descending)[0] : null;\n\
    }\n\
  });\n\
\n\
\n\
\n\
  // ScrollState\n\
  // -----------\n\
  var ScrollState = function (element) {\n\
\n\
    var content = Rect.ofContent(element, true),\n\
      viewport = Rect.ofViewport(element, true),\n\
      w = content.width - viewport.width,\n\
      h = content.height - viewport.height;\n\
\n\
    this.content = content;\n\
    this.viewport = viewport;\n\
    this.width = w <= 0 ? null : viewport.left / w;\n\
    this.height = h <= 0 ? null : viewport.top / h;\n\
    this.left = viewport.left;\n\
    this.top = viewport.top;\n\
    this.right = content.right - viewport.right;\n\
    this.bottom = content.bottom - viewport.bottom;\n\
  };\n\
\n\
  // ### Prototype\n\
  extend(ScrollState.prototype, {\n\
\n\
    // Checks if this instance equals `that`.\n\
    equals: function (that) {\n\
\n\
      return equal(this, that, ['width', 'height', 'left', 'top', 'right', 'bottom', 'content', 'viewport']);\n\
    }\n\
  });\n\
\n\
\n\
\n\
  // Viewport\n\
  // --------\n\
  var Viewport = function (element) {\n\
\n\
    this.el = element || window;\n\
  };\n\
\n\
  // ### Prototype\n\
  extend(Viewport.prototype, {\n\
\n\
    // Checks if this instance equals `that`.\n\
    equals: function (that) {\n\
\n\
      return equal(this, that, ['el']);\n\
    },\n\
\n\
    scrollState: function () {\n\
\n\
      return new ScrollState(this.el);\n\
    },\n\
\n\
    scrollTo: function (left, top, duration) {\n\
\n\
      var $el = this.el === window ? $('html,body') : $(this.el);\n\
\n\
      left = left || 0;\n\
      top = top || 0;\n\
      duration = isNaN(duration) ? 1000 : duration;\n\
\n\
      $el.stop(true).animate({scrollLeft: left, scrollTop: top}, duration);\n\
    },\n\
\n\
    scroll: function (left, top, duration) {\n\
\n\
      var $el = this.el === window ? $window : $(this.el);\n\
\n\
      left = left || 0;\n\
      top = top || 0;\n\
\n\
      this.scrollTo($el.scrollLeft() + left, $el.scrollTop() + top, duration);\n\
    },\n\
\n\
    scrollToRect: function (rect, paddingLeft, paddingTop, duration) {\n\
\n\
      paddingLeft = paddingLeft || 0;\n\
      paddingTop = paddingTop || 0;\n\
\n\
      this.scrollTo(rect.left - paddingLeft, rect.top - paddingTop, duration);\n\
    },\n\
\n\
    scrollToElement: function (element, paddingLeft, paddingTop, duration) {\n\
\n\
      var rect = Rect.ofElement(element).relativeTo(Rect.ofContent(this.el));\n\
\n\
      this.scrollToRect(rect, paddingLeft, paddingTop, duration);\n\
    }\n\
  });\n\
\n\
\n\
\n\
\n\
\n\
  // Callbacks\n\
  // =========\n\
\n\
  // callbacks mix-in\n\
  // ----------------\n\
  // Expects `context: HTMLElement` and `updatedValue: function`.\n\
  var callbacksMixIn = {\n\
\n\
    // Initial setup.\n\
    init: function () {\n\
\n\
      this.callbacks = $.Callbacks('memory unique');\n\
      this.currVal = null;\n\
      this.prevVal = null;\n\
\n\
      // A proxy to make `check` bindable to events.\n\
      this.checkProxy = $.proxy(this.check, this);\n\
\n\
      this.autoCheck();\n\
    },\n\
\n\
    // Adds a new callback function.\n\
    bind: function (callback) {\n\
\n\
      this.callbacks.add(callback);\n\
    },\n\
\n\
    // Removes a previously added callback function.\n\
    unbind: function (callback) {\n\
\n\
      if (callback) {\n\
        this.callbacks.remove(callback);\n\
      } else {\n\
        this.callbacks.empty();\n\
      }\n\
    },\n\
\n\
    // Triggers all callbacks with the current values.\n\
    trigger: function () {\n\
\n\
      this.callbacks.fireWith(this.context, [this.currVal, this.prevVal]);\n\
    },\n\
\n\
    // Checks if value changed, updates attributes `currVal` and\n\
    // `prevVal` accordingly and triggers the callbacks. Returns\n\
    // `true` if value changed, otherwise `false`.\n\
    check: function (event) {\n\
\n\
      var value = this.updatedValue(event);\n\
\n\
      if (value === undefined) {\n\
        return false;\n\
      }\n\
\n\
      this.prevVal = this.currVal;\n\
      this.currVal = value;\n\
      this.trigger();\n\
      return true;\n\
    },\n\
\n\
    // Auto-check configuration.\n\
    $autoTarget: $window,\n\
    autoEvents: 'load resize scroll',\n\
\n\
    // Enables/disables automated checking for changes on the specified `window`\n\
    // events.\n\
    autoCheck: function (on) {\n\
\n\
      this.$autoTarget[on === false ? 'off' : 'on'](this.autoEvents, this.checkProxy);\n\
    }\n\
  };\n\
\n\
\n\
\n\
  // FracsCallbacks\n\
  // --------------\n\
  var FracsCallbacks = function (element, viewport) {\n\
\n\
    this.context = element;\n\
    this.viewport = viewport;\n\
    this.init();\n\
  };\n\
\n\
  // ### Prototype\n\
  extend(FracsCallbacks.prototype, callbacksMixIn, {\n\
    updatedValue: function () {\n\
\n\
      var value = Fractions.of(this.context, this.viewport);\n\
\n\
      if (!this.currVal || !this.currVal.equals(value)) {\n\
        return value;\n\
      }\n\
    }\n\
  });\n\
\n\
\n\
\n\
  // GroupCallbacks\n\
  // --------------\n\
  var GroupCallbacks = function (elements, viewport, property, descending) {\n\
\n\
    this.context = new Group(elements, viewport);\n\
    this.property = property;\n\
    this.descending = descending;\n\
    this.init();\n\
  };\n\
\n\
  // ### Prototype\n\
  extend(GroupCallbacks.prototype, callbacksMixIn, {\n\
    updatedValue: function () {\n\
\n\
      var best = this.context.best(this.property, this.descending);\n\
\n\
      if (best) {\n\
        best = best.val > 0 ? best.el : null;\n\
        if (this.currVal !== best) {\n\
          return best;\n\
        }\n\
      }\n\
    }\n\
  });\n\
\n\
\n\
\n\
  // ScrollStateCallbacks\n\
  // --------------------\n\
  var ScrollStateCallbacks = function (element) {\n\
\n\
    if (!element || element === window || element === document) {\n\
      this.context = window;\n\
    } else {\n\
      this.context = element;\n\
      this.$autoTarget = $(element);\n\
    }\n\
    this.init();\n\
  };\n\
\n\
  // ### Prototype\n\
  extend(ScrollStateCallbacks.prototype, callbacksMixIn, {\n\
    updatedValue: function () {\n\
\n\
      var value = new ScrollState(this.context);\n\
\n\
      if (!this.currVal || !this.currVal.equals(value)) {\n\
        return value;\n\
      }\n\
    }\n\
  });\n\
\n\
\n\
\n\
\n\
\n\
  // modplug 0.7\n\
  // ===========\n\
\n\
  // Use <http://larsjung.de/modplug> to attach the plug-in to jQuery.\n\
  var modplug = function (namespace, options) {\n\
\n\
      // Save the initial settings.\n\
    var settings = extend({}, options),\n\
\n\
      // Helper function to apply default methods.\n\
      applyMethod = function (obj, args, methodName, methods) {\n\
\n\
        // If `methodName` is a function apply it to get the actual\n\
        // method name.\n\
        methodName = isFn(methodName) ? methodName.apply(obj, args) : methodName;\n\
\n\
        // If method exists then apply it and return the result ...\n\
        if (isFn(methods[methodName])) {\n\
          return methods[methodName].apply(obj, args);\n\
        }\n\
\n\
        // ... otherwise raise an error.\n\
        $.error('Method \"' + methodName + '\" does not exist on jQuery.' + namespace);\n\
      },\n\
\n\
      // This function gets exposed as `$.<namespace>`.\n\
      statics = function () {\n\
\n\
        // Try to apply a default method.\n\
        return applyMethod(this, slice.call(arguments), settings.defaultStatic, statics);\n\
      },\n\
\n\
      // This function gets exposed as `$(selector).<namespace>`.\n\
      methods = function (method) {\n\
\n\
        // If `method` exists then apply it ...\n\
        if (isFn(methods[method])) {\n\
          return methods[method].apply(this, slice.call(arguments, 1));\n\
        }\n\
\n\
        // ... otherwise try to apply a default method.\n\
        return applyMethod(this, slice.call(arguments), settings.defaultMethod, methods);\n\
      },\n\
\n\
      // Adds/overwrites plug-in methods. This function gets exposed as\n\
      // `$.<namespace>.modplug` to make the plug-in extendable.\n\
      plug = function (options) {\n\
\n\
        if (options) {\n\
          extend(statics, options.statics);\n\
          extend(methods, options.methods);\n\
        }\n\
\n\
        // Make sure that `$.<namespace>.modplug` points to this\n\
        // function after adding new methods.\n\
        statics.modplug = plug;\n\
      };\n\
\n\
    // Save objects or methods previously registered to the desired\n\
    // namespace. They are available via `$.<namespace>.modplug.prev`.\n\
    plug.prev = {\n\
      statics: $[namespace],\n\
      methods: $.fn[namespace]\n\
    };\n\
\n\
    // Init the plug-in by adding the specified statics and methods.\n\
    plug(options);\n\
\n\
    // Register the plug-in.\n\
    $[namespace] = statics;\n\
    $.fn[namespace] = methods;\n\
  };\n\
\n\
\n\
\n\
\n\
\n\
  // Register the plug-in\n\
  // ===================\n\
\n\
    // The namespace used to register the plug-in and to attach data to\n\
    // elements.\n\
  var namespace = 'fracs';\n\
\n\
  // The methods are sorted in alphabetical order. All methods that do not\n\
  // provide a return value will return `this` to enable method chaining.\n\
  modplug(namespace, {\n\
\n\
    // Static methods\n\
    // --------------\n\
    // These methods are accessible via `$.fracs.<methodname>`.\n\
    statics: {\n\
\n\
      // Build version.\n\
      version: '0.11',\n\
\n\
      // Publish object constructors (for testing).\n\
      Rect: Rect,\n\
      Fractions: Fractions,\n\
      Group: Group,\n\
      ScrollState: ScrollState,\n\
      Viewport: Viewport,\n\
      FracsCallbacks: FracsCallbacks,\n\
      GroupCallbacks: GroupCallbacks,\n\
      ScrollStateCallbacks: ScrollStateCallbacks,\n\
\n\
      // ### fracs\n\
      // This is the **default method**. So instead of calling\n\
      // `$.fracs.fracs(...)` simply call `$.fracs(...)`.\n\
      //\n\
      // Returns the fractions for a given `Rect` and `viewport`,\n\
      // viewport defaults to `$.fracs.viewport()`.\n\
      //\n\
      //      $.fracs(rect: Rect, [viewport: Rect]): Fractions\n\
      fracs: function (rect, viewport) {\n\
\n\
        return Fractions.of(rect, viewport);\n\
      }\n\
    },\n\
\n\
    // Instance methods\n\
    // ----------------\n\
    // These methods are accessible via `$(selector).fracs('<methodname>', ...)`.\n\
    methods: {\n\
\n\
      // ### 'content'\n\
      // Returns the content rect of the first selected element in content space.\n\
      // If no element is selected it returns the document rect.\n\
      //\n\
      //      .fracs('content'): Rect\n\
      content: function (inContentSpace) {\n\
\n\
        return this.length ? Rect.ofContent(this[0], inContentSpace) : null;\n\
      },\n\
\n\
      // ### 'envelope'\n\
      // Returns the smallest rectangle that containes all selected elements.\n\
      //\n\
      //      .fracs('envelope'): Rect\n\
      envelope: function () {\n\
\n\
        return reduce(this, function (current) {\n\
\n\
          var rect = Rect.ofElement(this);\n\
          return current ? current.envelope(rect) : rect;\n\
        });\n\
      },\n\
\n\
      // ### 'fracs'\n\
      // This is the **default method**. So the first parameter `'fracs'`\n\
      // can be omitted.\n\
      //\n\
      // Returns the fractions for the first selected element.\n\
      //\n\
      //      .fracs(): Fractions\n\
      //\n\
      // Binds a callback function that will be invoked if fractions have changed\n\
      // after a `window resize` or `window scroll` event.\n\
      //\n\
      //      .fracs(callback(fracs: Fractions, prevFracs: Fractions)): jQuery\n\
      //\n\
      // Unbinds the specified callback function.\n\
      //\n\
      //      .fracs('unbind', callback): jQuery\n\
      //\n\
      // Unbinds all callback functions.\n\
      //\n\
      //      .fracs('unbind'): jQuery\n\
      //\n\
      // Checks if fractions changed and if so invokes all bound callback functions.\n\
      //\n\
      //      .fracs('check'): jQuery\n\
      fracs: function (action, callback, viewport) {\n\
\n\
        if (!isTypeOf(action, 'string')) {\n\
          viewport = callback;\n\
          callback = action;\n\
          action = null;\n\
        }\n\
        if (!isFn(callback)) {\n\
          viewport = callback;\n\
          callback = null;\n\
        }\n\
        viewport = getHTMLElement(viewport);\n\
\n\
        var ns = namespace + '.fracs.' + getId(viewport);\n\
\n\
        if (action === 'unbind') {\n\
          return this.each(function () {\n\
\n\
            var cbs = $(this).data(ns);\n\
\n\
            if (cbs) {\n\
              cbs.unbind(callback);\n\
            }\n\
          });\n\
        } else if (action === 'check') {\n\
          return this.each(function () {\n\
\n\
            var cbs = $(this).data(ns);\n\
\n\
            if (cbs) {\n\
              cbs.check();\n\
            }\n\
          });\n\
        } else if (isFn(callback)) {\n\
          return this.each(function () {\n\
\n\
            var $this = $(this),\n\
              cbs = $this.data(ns);\n\
\n\
            if (!cbs) {\n\
              cbs = new FracsCallbacks(this, viewport);\n\
              $this.data(ns, cbs);\n\
            }\n\
            cbs.bind(callback);\n\
          });\n\
        }\n\
\n\
        return this.length ? Fractions.of(this[0], viewport) : null;\n\
      },\n\
\n\
      // ### 'intersection'\n\
      // Returns the greatest rectangle that is contained in all selected elements.\n\
      //\n\
      //      .fracs('intersection'): Rect\n\
      intersection: function () {\n\
\n\
        return reduce(this, function (current) {\n\
\n\
          var rect = Rect.ofElement(this);\n\
          return current ? current.intersection(rect) : rect;\n\
        });\n\
      },\n\
\n\
      // ### 'max'\n\
      // Reduces the set of selected elements to those with the maximum value\n\
      // of the specified property.\n\
      // Valid values for property are `possible`, `visible`, `viewport`,\n\
      // `width`, `height`, `left`, `right`, `top`, `bottom`.\n\
      //\n\
      //      .fracs('max', property: String): jQuery\n\
      //\n\
      // Binds a callback function to the set of selected elements that gets\n\
      // triggert whenever the element with the highest value of the specified\n\
      // property changes.\n\
      //\n\
      //      .fracs('max', property: String, callback(best: Element, prevBest: Element)): jQuery\n\
      max: function (property, callback, viewport) {\n\
\n\
        if (!isFn(callback)) {\n\
          viewport = callback;\n\
          callback = null;\n\
        }\n\
        viewport = getHTMLElement(viewport);\n\
\n\
        if (callback) {\n\
          new GroupCallbacks(this, viewport, property, true).bind(callback);\n\
          return this;\n\
        }\n\
\n\
        return this.pushStack(new Group(this, viewport).best(property, true).el);\n\
      },\n\
\n\
      // ### 'min'\n\
      // Reduces the set of selected elements to those with the minimum value\n\
      // of the specified property.\n\
      // Valid values for property are `possible`, `visible`, `viewport`,\n\
      // `width`, `height`, `left`, `right`, `top`, `bottom`.\n\
      //\n\
      //      .fracs('min', property: String): jQuery\n\
      //\n\
      // Binds a callback function to the set of selected elements that gets\n\
      // triggert whenever the element with the lowest value of the specified\n\
      // property changes.\n\
      //\n\
      //      .fracs('min', property: String, callback(best: Element, prevBest: Element)): jQuery\n\
      min: function (property, callback, viewport) {\n\
\n\
        if (!isFn(callback)) {\n\
          viewport = callback;\n\
          callback = null;\n\
        }\n\
        viewport = getHTMLElement(viewport);\n\
\n\
        if (callback) {\n\
          new GroupCallbacks(this, viewport, property).bind(callback);\n\
          return this;\n\
        }\n\
\n\
        return this.pushStack(new Group(this, viewport).best(property).el);\n\
      },\n\
\n\
      // ### 'rect'\n\
      // Returns the dimensions for the first selected element in document space.\n\
      //\n\
      //      .fracs('rect'): Rect\n\
      rect: function () {\n\
\n\
        return this.length ? Rect.ofElement(this[0]) : null;\n\
      },\n\
\n\
      // ### 'scrollState'\n\
      // Returns the current scroll state for the first selected element.\n\
      //\n\
      //      .fracs('scrollState'): ScrollState\n\
      //\n\
      // Binds a callback function that will be invoked if scroll state has changed\n\
      // after a `resize` or `scroll` event.\n\
      //\n\
      //      .fracs('scrollState', callback(scrollState: scrollState, prevScrollState: scrollState)): jQuery\n\
      //\n\
      // Unbinds the specified callback function.\n\
      //\n\
      //      .fracs('scrollState', 'unbind', callback): jQuery\n\
      //\n\
      // Unbinds all callback functions.\n\
      //\n\
      //      .fracs('scrollState', 'unbind'): jQuery\n\
      //\n\
      // Checks if scroll state changed and if so invokes all bound callback functions.\n\
      //\n\
      //      .fracs('scrollState', 'check'): jQuery\n\
      scrollState: function (action, callback) {\n\
\n\
        var ns = namespace + '.scrollState';\n\
\n\
        if (!isTypeOf(action, 'string')) {\n\
          callback = action;\n\
          action = null;\n\
        }\n\
\n\
        if (action === 'unbind') {\n\
          return this.each(function () {\n\
\n\
            var cbs = $(this).data(ns);\n\
\n\
            if (cbs) {\n\
              cbs.unbind(callback);\n\
            }\n\
          });\n\
        } else if (action === 'check') {\n\
          return this.each(function () {\n\
\n\
            var cbs = $(this).data(ns);\n\
\n\
            if (cbs) {\n\
              cbs.check();\n\
            }\n\
          });\n\
        } else if (isFn(callback)) {\n\
          return this.each(function () {\n\
\n\
            var $this = $(this),\n\
              cbs = $this.data(ns);\n\
\n\
            if (!cbs) {\n\
              cbs = new ScrollStateCallbacks(this);\n\
              $this.data(ns, cbs);\n\
            }\n\
            cbs.bind(callback);\n\
          });\n\
        }\n\
\n\
        return this.length ? new ScrollState(this[0]) : null;\n\
      },\n\
\n\
      // ### 'scroll'\n\
      // Scrolls the selected elements relative to its current position,\n\
      // `padding` defaults to `0`, `duration` to `1000`.\n\
      //\n\
      //      .fracs('scroll', element: HTMLElement/jQuery, [paddingLeft: int,] [paddingTop: int,] [duration: int]): jQuery\n\
      scroll: function (left, top, duration) {\n\
\n\
        return this.each(function () {\n\
\n\
          new Viewport(this).scroll(left, top, duration);\n\
        });\n\
      },\n\
\n\
      // ### 'scrollTo'\n\
      // Scrolls the selected elements to the specified element or an absolute position,\n\
      // `padding` defaults to `0`, `duration` to `1000`.\n\
      //\n\
      //      .fracs('scrollTo', element: HTMLElement/jQuery, [paddingLeft: int,] [paddingTop: int,] [duration: int]): jQuery\n\
      //      .fracs('scrollTo', [left: int,] [top: int,] [duration: int]): jQuery\n\
      scrollTo: function (element, paddingLeft, paddingTop, duration) {\n\
\n\
        if ($.isNumeric(element)) {\n\
          duration = paddingTop;\n\
          paddingTop = paddingLeft;\n\
          paddingLeft = element;\n\
          element = null;\n\
        }\n\
\n\
        element = getHTMLElement(element);\n\
\n\
        return this.each(function () {\n\
\n\
          if (element) {\n\
            new Viewport(this).scrollToElement(element, paddingLeft, paddingTop, duration);\n\
          } else {\n\
            new Viewport(this).scrollTo(paddingLeft, paddingTop, duration);\n\
          }\n\
        });\n\
      },\n\
\n\
      // ### 'scrollToThis'\n\
      // Scrolls the viewport (window) to the first selected element in the specified time,\n\
      // `padding` defaults to `0`, `duration` to `1000`.\n\
      //\n\
      //      .fracs('scrollToThis', [paddingLeft: int,] [paddingTop: int,] [duration: int,] [viewport: HTMLElement/jQuery]): jQuery\n\
      scrollToThis: function (paddingLeft, paddingTop, duration, viewport) {\n\
\n\
        viewport = new Viewport(getHTMLElement(viewport));\n\
\n\
        viewport.scrollToElement(this[0], paddingLeft, paddingTop, duration);\n\
        return this;\n\
      },\n\
\n\
      // ### 'softLink'\n\
      // Converts all selected page intern links `<a href=\"#...\">` into soft links.\n\
      // Uses `scrollTo` to scroll to the location.\n\
      //\n\
      //      .fracs('softLink', [paddingLeft: int,] [paddingTop: int,] [duration: int,] [viewport: HTMLElement/jQuery]): jQuery\n\
      softLink: function (paddingLeft, paddingTop, duration, viewport) {\n\
\n\
        viewport = new Viewport(getHTMLElement(viewport));\n\
\n\
        return this.filter('a[href^=#]').each(function () {\n\
          var $a = $(this);\n\
          $a.on('click', function () {\n\
            viewport.scrollToElement($($a.attr('href'))[0], paddingLeft, paddingTop, duration);\n\
          });\n\
        });\n\
      },\n\
\n\
      // ### 'sort'\n\
      // Sorts the set of selected elements by the specified property.\n\
      // Valid values for property are `possible`, `visible`, `viewport`,\n\
      // `width`, `height`, `left`, `right`, `top`, `bottom`. The default\n\
      // sort order is descending.\n\
      //\n\
      //      .fracs('sort', property: String, [ascending: boolean]): jQuery\n\
      sort: function (property, ascending, viewport) {\n\
\n\
        if (!isTypeOf(ascending, 'boolean')) {\n\
          viewport = ascending;\n\
          ascending = null;\n\
        }\n\
        viewport = getHTMLElement(viewport);\n\
\n\
        return this.pushStack($.map(new Group(this, viewport).sorted(property, !ascending), function (entry) {\n\
          return entry.el;\n\
        }));\n\
      },\n\
\n\
      // ### 'viewport'\n\
      // Returns the current viewport of the first selected element in content space.\n\
      // If no element is selected it returns the document's viewport.\n\
      //\n\
      //      .fracs('viewport'): Rect\n\
      viewport: function (inContentSpace) {\n\
\n\
        return this.length ? Rect.ofViewport(this[0], inContentSpace) : null;\n\
      }\n\
    },\n\
\n\
    // Defaults\n\
    // --------\n\
    defaultStatic: 'fracs',\n\
    defaultMethod: 'fracs'\n\
  });\n\
\n\
}(window, document, jQuery));\n\
/*! jQuery.outline 0.11 - //larsjung.de/fracs - MIT License */\n\
\n\
(function (window, $) {\n\
'use strict';\n\
/*jslint browser: true, confusion: true, vars: true, white: true */\n\
/*global jQuery */\n\
\n\
    // Some often used references.\n\
  var $window = $(window),\n\
    extend = $.extend,\n\
\n\
    fracs = $.fracs,\n\
    Rect = fracs.Rect,\n\
    Viewport = fracs.Viewport;\n\
\n\
\n\
\n\
\n\
  // Outline\n\
  // -------\n\
\n\
  var defaults = {\n\
      crop: false,\n\
      duration: 0,\n\
      focusWidth: 0.5,\n\
      focusHeight: 0.5,\n\
      autoFocus: true,\n\
      styles: [{\n\
        selector: 'header,footer,section,article',\n\
        fillStyle: 'rgb(230,230,230)'\n\
      }, {\n\
        selector: 'h1,h2,h3,h4',\n\
        fillStyle: 'rgb(255,144,55)'\n\
      }],\n\
      viewportStyle: {\n\
        fillStyle: 'rgba(255,144,55,0.3)'\n\
      },\n\
      viewportDragStyle: {\n\
        fillStyle: 'rgba(255,144,55,0.5)'\n\
      },\n\
      invertViewport: false\n\
    };\n\
\n\
  // Quick and dirty.\n\
  var Outline = function (canvas, options, viewport) {\n\
\n\
    if (!canvas || !$.isFunction(canvas.getContext)) {\n\
      return null;\n\
    }\n\
\n\
    var context = canvas.getContext('2d');\n\
    if (!context) {\n\
      return null;\n\
    }\n\
\n\
    viewport = viewport || window;\n\
\n\
    var settings = extend({}, defaults, options),\n\
\n\
      $canvas = $(canvas),\n\
      width = $canvas.attr('width'),\n\
      height = $canvas.attr('height'),\n\
\n\
      $viewport = $(viewport),\n\
      viewportObj = new Viewport(viewport),\n\
      find = viewport === window ? function (selector) {\n\
        return $(selector);\n\
      } : function (selector) {\n\
        return $viewport.find(selector);\n\
      },\n\
\n\
      drag = false,\n\
\n\
      currentContentRect,\n\
      currentViewportRect,\n\
      currentScale,\n\
      focusWidth,\n\
      focusHeight,\n\
\n\
      drawRect = function (rect, strokeWidth, strokeStyle, fillStyle, invert) {\n\
\n\
        if (!rect || !(strokeStyle || fillStyle)) {\n\
          return;\n\
        }\n\
\n\
        if (fillStyle) {\n\
          context.beginPath();\n\
          if (invert) {\n\
            context.rect(0, 0, currentContentRect.width, rect.top);\n\
            context.rect(0, rect.top, rect.left, rect.height);\n\
            context.rect(rect.right, rect.top, currentContentRect.width - rect.right, rect.height);\n\
            context.rect(0, rect.bottom, currentContentRect.width, currentContentRect.height - rect.bottom);\n\
          } else {\n\
            context.rect(rect.left, rect.top, rect.width, rect.height);\n\
          }\n\
          context.fillStyle = fillStyle;\n\
          context.fill();\n\
        }\n\
        if (strokeStyle) {\n\
          context.beginPath();\n\
          context.rect(rect.left, rect.top, rect.width, rect.height);\n\
          context.lineWidth = currentScale ? Math.max(strokeWidth, 0.2 / currentScale) : strokeWidth;\n\
          context.strokeStyle = strokeStyle;\n\
          context.stroke();\n\
        }\n\
      },\n\
      drawElement = function (element, strokeWidth, strokeStyle, fillStyle) {\n\
\n\
        var $element = $(element),\n\
          rect = Rect.ofElement(element);\n\
\n\
        if (!rect || rect.width <= 0 || rect.height <= 0 || $element.css('visibility') === 'hidden') {\n\
          return;\n\
        }\n\
\n\
        rect = rect.relativeTo(currentContentRect);\n\
        strokeWidth = strokeWidth === 'auto' ? parseInt($element.css('border-top-width'), 10) : strokeWidth;\n\
        strokeStyle = strokeStyle === 'auto' ? $element.css('border-top-color') : strokeStyle;\n\
        fillStyle = fillStyle === 'auto' ? $element.css('background-color') : fillStyle;\n\
        drawRect(rect, strokeWidth, strokeStyle, fillStyle);\n\
      },\n\
      applyStyles = function () {\n\
\n\
        $.each(settings.styles, function (idx, style) {\n\
          find(style.selector).each(function () {\n\
            drawElement(this, style.strokeWidth, style.strokeStyle, style.fillStyle);\n\
          });\n\
        });\n\
      },\n\
      drawViewport = function () {\n\
\n\
        var style = drag && settings.viewportDragStyle ? settings.viewportDragStyle : settings.viewportStyle;\n\
\n\
        drawRect(currentViewportRect, style.strokeWidth, style.strokeStyle, style.fillStyle, settings.invertViewport);\n\
      },\n\
      draw = function () {\n\
\n\
        currentContentRect = Rect.ofContent(viewport);\n\
        currentViewportRect = Rect.ofViewport(viewport, true);\n\
        currentScale = Math.min(width / currentContentRect.width, height / currentContentRect.height);\n\
\n\
        if (settings.crop) {\n\
          $canvas.attr('width', currentContentRect.width * currentScale).attr('height', currentContentRect.height * currentScale);\n\
        }\n\
\n\
        context.setTransform(1, 0, 0, 1, 0, 0);\n\
        context.clearRect(0, 0, $canvas.width(), $canvas.height());\n\
\n\
        context.scale(currentScale, currentScale);\n\
        applyStyles();\n\
        drawViewport();\n\
      },\n\
      onDrag = function (event) {\n\
\n\
        var r = Rect.ofElement(canvas),\n\
          x = (event.pageX - r.left) / currentScale - currentViewportRect.width * focusWidth,\n\
          y = (event.pageY - r.top) / currentScale - currentViewportRect.height * focusHeight;\n\
\n\
        viewportObj.scrollTo(x, y, settings.duration);\n\
      },\n\
      onDragEnd = function (event) {\n\
\n\
        drag = false;\n\
        event.preventDefault();\n\
\n\
        $canvas.css('cursor', 'pointer').removeClass('dragOn');\n\
        $('body').css('cursor', 'auto');\n\
        $window.off('mousemove', onDrag);\n\
        draw();\n\
      },\n\
      onDragStart = function (event) {\n\
\n\
        var r;\n\
        if (settings.autoFocus) {\n\
          r = Rect.ofElement(canvas);\n\
          focusWidth = (((event.pageX - r.left) / currentScale) - currentViewportRect.left) / currentViewportRect.width;\n\
          focusHeight = (((event.pageY - r.top) / currentScale) - currentViewportRect.top) / currentViewportRect.height;\n\
        }\n\
        if (!settings.autoFocus || focusWidth < 0 || focusWidth > 1 || focusHeight < 0 || focusHeight > 1) {\n\
          focusWidth = settings.focusWidth;\n\
          focusHeight = settings.focusHeight;\n\
        }\n\
\n\
        drag = true;\n\
        event.preventDefault();\n\
\n\
        $canvas.css('cursor', 'crosshair').addClass('dragOn');\n\
        $('body').css('cursor', 'crosshair');\n\
        $window.on('mousemove', onDrag).one('mouseup', onDragEnd);\n\
        onDrag(event);\n\
      },\n\
      init = function () {\n\
\n\
        $canvas.css('cursor', 'pointer').mousedown(onDragStart);\n\
        $viewport.on('load resize scroll', draw);\n\
        draw();\n\
      };\n\
\n\
    init();\n\
\n\
    this.redraw = draw;\n\
  };\n\
\n\
\n\
\n\
\n\
\n\
  // Register the plug-in\n\
  // ===================\n\
\n\
    // The namespace used to register the plug-in and to attach\n\
    // data to elements.\n\
  var namespace = 'fracs.outline';\n\
\n\
  // The methods are sorted in alphabetical order. All methods that do\n\
  // not provide a return value will return `this` to enable method chaining.\n\
  fracs.modplug({\n\
\n\
    // Static methods\n\
    // --------------\n\
    // These methods are accessible via `$.outline.<methodname>`.\n\
    statics: {\n\
\n\
      // Publish object constructors (for testing).\n\
      Outline: Outline\n\
    },\n\
\n\
    // Instance methods\n\
    // ----------------\n\
    // These methods are accessible via `$(selector).outline('<methodname>', ...)`.\n\
    methods: {\n\
\n\
      // ### 'outline'\n\
      // Generates a document outline in a selected canvas. Will be redrawn on every\n\
      // 'window resize` and `window scroll` event.\n\
      //\n\
      //      .outline([options: OutlineOptions]): jQuery\n\
      outline: function (action, options, viewport) {\n\
\n\
        if (typeof action !== 'string') {\n\
          viewport = options;\n\
          options = action;\n\
          action = null;\n\
        }\n\
        if (viewport instanceof $) {\n\
          viewport = viewport[0];\n\
        }\n\
\n\
        if (action === 'redraw') {\n\
          return this.each(function () {\n\
\n\
            var outline = $(this).data(namespace);\n\
            if (outline) {\n\
              outline.redraw();\n\
            }\n\
          });\n\
        }\n\
\n\
        return this.each(function () {\n\
\n\
          var outline = $(this).data(namespace);\n\
          if (!outline) {\n\
            outline = new Outline(this, options, viewport);\n\
            if (outline) {\n\
              $(this).data(namespace, outline);\n\
            }\n\
          }\n\
        });\n\
      }\n\
    }\n\
  });\n\
\n\
}(window, jQuery));\n\
\n\
//# sourceURL=components/yyolk/jquery-fracs/master/index.js"
));

require.modules["yyolk-jquery-fracs"] = require.modules["yyolk~jquery-fracs@master"];
require.modules["yyolk~jquery-fracs"] = require.modules["yyolk~jquery-fracs@master"];
require.modules["jquery-fracs"] = require.modules["yyolk~jquery-fracs@master"];


require.register("component~indexof@0.0.3", Function("exports, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};\n\
//# sourceURL=components/component/indexof/0.0.3/index.js"
));

require.modules["component-indexof"] = require.modules["component~indexof@0.0.3"];
require.modules["component~indexof"] = require.modules["component~indexof@0.0.3"];
require.modules["indexof"] = require.modules["component~indexof@0.0.3"];


require.register("component~classes@1.2.1", Function("exports, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('component~indexof@0.0.3');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`, can force state via `force`.\n\
 *\n\
 * For browsers that support classList, but do not support `force` yet,\n\
 * the mistake will be detected and corrected.\n\
 *\n\
 * @param {String} name\n\
 * @param {Boolean} force\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name, force){\n\
  // classList\n\
  if (this.list) {\n\
    if (\"undefined\" !== typeof force) {\n\
      if (force !== this.list.toggle(name, force)) {\n\
        this.list.toggle(name); // toggle again to correct\n\
      }\n\
    } else {\n\
      this.list.toggle(name);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (\"undefined\" !== typeof force) {\n\
    if (!force) {\n\
      this.remove(name);\n\
    } else {\n\
      this.add(name);\n\
    }\n\
  } else {\n\
    if (this.has(name)) {\n\
      this.remove(name);\n\
    } else {\n\
      this.add(name);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
\n\
//# sourceURL=components/component/classes/1.2.1/index.js"
));

require.modules["component-classes"] = require.modules["component~classes@1.2.1"];
require.modules["component~classes"] = require.modules["component~classes@1.2.1"];
require.modules["classes"] = require.modules["component~classes@1.2.1"];


require.register("component~classes@1.2.3", Function("exports, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('component~indexof@0.0.3');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el || !el.nodeType) {\n\
    throw new Error('A DOM element reference is required');\n\
  }\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`, can force state via `force`.\n\
 *\n\
 * For browsers that support classList, but do not support `force` yet,\n\
 * the mistake will be detected and corrected.\n\
 *\n\
 * @param {String} name\n\
 * @param {Boolean} force\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name, force){\n\
  // classList\n\
  if (this.list) {\n\
    if (\"undefined\" !== typeof force) {\n\
      if (force !== this.list.toggle(name, force)) {\n\
        this.list.toggle(name); // toggle again to correct\n\
      }\n\
    } else {\n\
      this.list.toggle(name);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (\"undefined\" !== typeof force) {\n\
    if (!force) {\n\
      this.remove(name);\n\
    } else {\n\
      this.add(name);\n\
    }\n\
  } else {\n\
    if (this.has(name)) {\n\
      this.remove(name);\n\
    } else {\n\
      this.add(name);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
\n\
//# sourceURL=components/component/classes/1.2.3/index.js"
));

require.modules["component-classes"] = require.modules["component~classes@1.2.3"];
require.modules["component~classes"] = require.modules["component~classes@1.2.3"];
require.modules["classes"] = require.modules["component~classes@1.2.3"];


require.register("component~filter@0.0.1", Function("exports, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var classes = require('component~classes@1.2.3');\n\
\n\
/**\n\
 * Filter `el`'s children with the given `fn(el, i)`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, fn){\n\
  for (var i = 0; i < el.children.length; ++i) {\n\
    var child = el.children[i];\n\
    if (fn(child, i)) {\n\
      classes(child).remove('hide');\n\
    } else {\n\
      classes(child).add('hide');\n\
    }\n\
  }\n\
};\n\
//# sourceURL=components/component/filter/0.0.1/index.js"
));

require.modules["component-filter"] = require.modules["component~filter@0.0.1"];
require.modules["component~filter"] = require.modules["component~filter@0.0.1"];
require.modules["filter"] = require.modules["component~filter@0.0.1"];


require.register("component~emitter@1.1.3", Function("exports, module",
"\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  on.fn = fn;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var cb;\n\
  for (var i = 0; i < callbacks.length; i++) {\n\
    cb = callbacks[i];\n\
    if (cb === fn || cb.fn === fn) {\n\
      callbacks.splice(i, 1);\n\
      break;\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
\n\
//# sourceURL=components/component/emitter/1.1.3/index.js"
));

require.modules["component-emitter"] = require.modules["component~emitter@1.1.3"];
require.modules["component~emitter"] = require.modules["component~emitter@1.1.3"];
require.modules["emitter"] = require.modules["component~emitter@1.1.3"];


require.register("component~query@0.0.3", Function("exports, module",
"function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
  return exports;\n\
};\n\
\n\
//# sourceURL=components/component/query/0.0.3/index.js"
));

require.modules["component-query"] = require.modules["component~query@0.0.3"];
require.modules["component~query"] = require.modules["component~query@0.0.3"];
require.modules["query"] = require.modules["component~query@0.0.3"];


require.register("component~event@0.1.4", Function("exports, module",
"var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',\n\
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',\n\
    prefix = bind !== 'addEventListener' ? 'on' : '';\n\
\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  el[bind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  el[unbind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};\n\
//# sourceURL=components/component/event/0.1.4/index.js"
));

require.modules["component-event"] = require.modules["component~event@0.1.4"];
require.modules["component~event"] = require.modules["component~event@0.1.4"];
require.modules["event"] = require.modules["component~event@0.1.4"];


require.register("component~matches-selector@0.1.5", Function("exports, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('component~query@0.0.3');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matches\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (!el || el.nodeType !== 1) return false;\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
\n\
//# sourceURL=components/component/matches-selector/0.1.5/index.js"
));

require.modules["component-matches-selector"] = require.modules["component~matches-selector@0.1.5"];
require.modules["component~matches-selector"] = require.modules["component~matches-selector@0.1.5"];
require.modules["matches-selector"] = require.modules["component~matches-selector@0.1.5"];


require.register("component~closest@0.1.4", Function("exports, module",
"var matches = require('component~matches-selector@0.1.5')\n\
\n\
module.exports = function (element, selector, checkYoSelf, root) {\n\
  element = checkYoSelf ? {parentNode: element} : element\n\
\n\
  root = root || document\n\
\n\
  // Make sure `element !== document` and `element != null`\n\
  // otherwise we get an illegal invocation\n\
  while ((element = element.parentNode) && element !== document) {\n\
    if (matches(element, selector))\n\
      return element\n\
    // After `matches` on the edge case that\n\
    // the selector matches the root\n\
    // (when the root is not the document)\n\
    if (element === root)\n\
      return\n\
  }\n\
}\n\
\n\
//# sourceURL=components/component/closest/0.1.4/index.js"
));

require.modules["component-closest"] = require.modules["component~closest@0.1.4"];
require.modules["component~closest"] = require.modules["component~closest@0.1.4"];
require.modules["closest"] = require.modules["component~closest@0.1.4"];


require.register("component~delegate@0.2.3", Function("exports, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var closest = require('component~closest@0.1.4')\n\
  , event = require('component~event@0.1.4');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    var target = e.target || e.srcElement;\n\
    e.delegateTarget = closest(target, selector, true, el);\n\
    if (e.delegateTarget) fn.call(el, e);\n\
  }, capture);\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
\n\
//# sourceURL=components/component/delegate/0.2.3/index.js"
));

require.modules["component-delegate"] = require.modules["component~delegate@0.2.3"];
require.modules["component~delegate"] = require.modules["component~delegate@0.2.3"];
require.modules["delegate"] = require.modules["component~delegate@0.2.3"];


require.register("component~events@1.0.9", Function("exports, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var events = require('component~event@0.1.4');\n\
var delegate = require('component~delegate@0.2.3');\n\
\n\
/**\n\
 * Expose `Events`.\n\
 */\n\
\n\
module.exports = Events;\n\
\n\
/**\n\
 * Initialize an `Events` with the given\n\
 * `el` object which events will be bound to,\n\
 * and the `obj` which will receive method calls.\n\
 *\n\
 * @param {Object} el\n\
 * @param {Object} obj\n\
 * @api public\n\
 */\n\
\n\
function Events(el, obj) {\n\
  if (!(this instanceof Events)) return new Events(el, obj);\n\
  if (!el) throw new Error('element required');\n\
  if (!obj) throw new Error('object required');\n\
  this.el = el;\n\
  this.obj = obj;\n\
  this._events = {};\n\
}\n\
\n\
/**\n\
 * Subscription helper.\n\
 */\n\
\n\
Events.prototype.sub = function(event, method, cb){\n\
  this._events[event] = this._events[event] || {};\n\
  this._events[event][method] = cb;\n\
};\n\
\n\
/**\n\
 * Bind to `event` with optional `method` name.\n\
 * When `method` is undefined it becomes `event`\n\
 * with the \"on\" prefix.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Direct event handling:\n\
 *\n\
 *    events.bind('click') // implies \"onclick\"\n\
 *    events.bind('click', 'remove')\n\
 *    events.bind('click', 'sort', 'asc')\n\
 *\n\
 *  Delegated event handling:\n\
 *\n\
 *    events.bind('click li > a')\n\
 *    events.bind('click li > a', 'remove')\n\
 *    events.bind('click a.sort-ascending', 'sort', 'asc')\n\
 *    events.bind('click a.sort-descending', 'sort', 'desc')\n\
 *\n\
 * @param {String} event\n\
 * @param {String|function} [method]\n\
 * @return {Function} callback\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.bind = function(event, method){\n\
  var e = parse(event);\n\
  var el = this.el;\n\
  var obj = this.obj;\n\
  var name = e.name;\n\
  var method = method || 'on' + name;\n\
  var args = [].slice.call(arguments, 2);\n\
\n\
  // callback\n\
  function cb(){\n\
    var a = [].slice.call(arguments).concat(args);\n\
    obj[method].apply(obj, a);\n\
  }\n\
\n\
  // bind\n\
  if (e.selector) {\n\
    cb = delegate.bind(el, e.selector, name, cb);\n\
  } else {\n\
    events.bind(el, name, cb);\n\
  }\n\
\n\
  // subscription for unbinding\n\
  this.sub(name, method, cb);\n\
\n\
  return cb;\n\
};\n\
\n\
/**\n\
 * Unbind a single binding, all bindings for `event`,\n\
 * or all bindings within the manager.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Unbind direct handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * Unbind delegate handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * @param {String|Function} [event]\n\
 * @param {String|Function} [method]\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.unbind = function(event, method){\n\
  if (0 == arguments.length) return this.unbindAll();\n\
  if (1 == arguments.length) return this.unbindAllOf(event);\n\
\n\
  // no bindings for this event\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  // no bindings for this method\n\
  var cb = bindings[method];\n\
  if (!cb) return;\n\
\n\
  events.unbind(this.el, event, cb);\n\
};\n\
\n\
/**\n\
 * Unbind all events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAll = function(){\n\
  for (var event in this._events) {\n\
    this.unbindAllOf(event);\n\
  }\n\
};\n\
\n\
/**\n\
 * Unbind all events for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAllOf = function(event){\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  for (var method in bindings) {\n\
    this.unbind(event, method);\n\
  }\n\
};\n\
\n\
/**\n\
 * Parse `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parse(event) {\n\
  var parts = event.split(/ +/);\n\
  return {\n\
    name: parts.shift(),\n\
    selector: parts.join(' ')\n\
  }\n\
}\n\
\n\
//# sourceURL=components/component/events/1.0.9/index.js"
));

require.modules["component-events"] = require.modules["component~events@1.0.9"];
require.modules["component~events"] = require.modules["component~events@1.0.9"];
require.modules["events"] = require.modules["component~events@1.0.9"];


require.register("component~bind@1.0.0", Function("exports, module",
"/**\n\
 * Slice reference.\n\
 */\n\
\n\
var slice = [].slice;\n\
\n\
/**\n\
 * Bind `obj` to `fn`.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function|String} fn or string\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  if ('string' == typeof fn) fn = obj[fn];\n\
  if ('function' != typeof fn) throw new Error('bind() requires a function');\n\
  var args = slice.call(arguments, 2);\n\
  return function(){\n\
    return fn.apply(obj, args.concat(slice.call(arguments)));\n\
  }\n\
};\n\
\n\
//# sourceURL=components/component/bind/1.0.0/index.js"
));

require.modules["component-bind"] = require.modules["component~bind@1.0.0"];
require.modules["component~bind"] = require.modules["component~bind@1.0.0"];
require.modules["bind"] = require.modules["component~bind@1.0.0"];


require.register("component~domify@1.3.0", Function("exports, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
map.td =\n\
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];\n\
\n\
map.option =\n\
map.optgroup = [1, '<select multiple=\"multiple\">', '</select>'];\n\
\n\
map.thead =\n\
map.tbody =\n\
map.colgroup =\n\
map.caption =\n\
map.tfoot = [1, '<table>', '</table>'];\n\
\n\
map.text =\n\
map.circle =\n\
map.ellipse =\n\
map.line =\n\
map.path =\n\
map.polygon =\n\
map.polyline =\n\
map.rect = [1, '<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">','</svg>'];\n\
\n\
/**\n\
 * Parse `html` and return a DOM Node instance, which could be a TextNode,\n\
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment\n\
 * instance, depending on the contents of the `html` string.\n\
 *\n\
 * @param {String} html - HTML string to \"domify\"\n\
 * @param {Document} doc - The `document` instance to create the Node for\n\
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance\n\
 * @api private\n\
 */\n\
\n\
function parse(html, doc) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  // default to the global `document` object\n\
  if (!doc) doc = document;\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return doc.createTextNode(html);\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = doc.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = doc.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // one element\n\
  if (el.firstChild == el.lastChild) {\n\
    return el.removeChild(el.firstChild);\n\
  }\n\
\n\
  // several elements\n\
  var fragment = doc.createDocumentFragment();\n\
  while (el.firstChild) {\n\
    fragment.appendChild(el.removeChild(el.firstChild));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
\n\
//# sourceURL=components/component/domify/1.3.0/index.js"
));

require.modules["component-domify"] = require.modules["component~domify@1.3.0"];
require.modules["component~domify"] = require.modules["component~domify@1.3.0"];
require.modules["domify"] = require.modules["component~domify@1.3.0"];


require.register("ianstormtaylor~to-no-case@0.1.0", Function("exports, module",
"\n\
/**\n\
 * Expose `toNoCase`.\n\
 */\n\
\n\
module.exports = toNoCase;\n\
\n\
\n\
/**\n\
 * Test whether a string is camel-case.\n\
 */\n\
\n\
var hasSpace = /\\s/;\n\
var hasCamel = /[a-z][A-Z]/;\n\
var hasSeparator = /[\\W_]/;\n\
\n\
\n\
/**\n\
 * Remove any starting case from a `string`, like camel or snake, but keep\n\
 * spaces and punctuation that may be important otherwise.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
function toNoCase (string) {\n\
  if (hasSpace.test(string)) return string.toLowerCase();\n\
\n\
  if (hasSeparator.test(string)) string = unseparate(string);\n\
  if (hasCamel.test(string)) string = uncamelize(string);\n\
  return string.toLowerCase();\n\
}\n\
\n\
\n\
/**\n\
 * Separator splitter.\n\
 */\n\
\n\
var separatorSplitter = /[\\W_]+(.|$)/g;\n\
\n\
\n\
/**\n\
 * Un-separate a `string`.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
function unseparate (string) {\n\
  return string.replace(separatorSplitter, function (m, next) {\n\
    return next ? ' ' + next : '';\n\
  });\n\
}\n\
\n\
\n\
/**\n\
 * Camelcase splitter.\n\
 */\n\
\n\
var camelSplitter = /(.)([A-Z]+)/g;\n\
\n\
\n\
/**\n\
 * Un-camelcase a `string`.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
function uncamelize (string) {\n\
  return string.replace(camelSplitter, function (m, previous, uppers) {\n\
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');\n\
  });\n\
}\n\
//# sourceURL=components/ianstormtaylor/to-no-case/0.1.0/index.js"
));

require.modules["ianstormtaylor-to-no-case"] = require.modules["ianstormtaylor~to-no-case@0.1.0"];
require.modules["ianstormtaylor~to-no-case"] = require.modules["ianstormtaylor~to-no-case@0.1.0"];
require.modules["to-no-case"] = require.modules["ianstormtaylor~to-no-case@0.1.0"];


require.register("ianstormtaylor~to-space-case@0.1.2", Function("exports, module",
"\n\
var clean = require('ianstormtaylor~to-no-case@0.1.0');\n\
\n\
\n\
/**\n\
 * Expose `toSpaceCase`.\n\
 */\n\
\n\
module.exports = toSpaceCase;\n\
\n\
\n\
/**\n\
 * Convert a `string` to space case.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
\n\
function toSpaceCase (string) {\n\
  return clean(string).replace(/[\\W_]+(.|$)/g, function (matches, match) {\n\
    return match ? ' ' + match : '';\n\
  });\n\
}\n\
//# sourceURL=components/ianstormtaylor/to-space-case/0.1.2/index.js"
));

require.modules["ianstormtaylor-to-space-case"] = require.modules["ianstormtaylor~to-space-case@0.1.2"];
require.modules["ianstormtaylor~to-space-case"] = require.modules["ianstormtaylor~to-space-case@0.1.2"];
require.modules["to-space-case"] = require.modules["ianstormtaylor~to-space-case@0.1.2"];


require.register("ianstormtaylor~to-camel-case@0.2.1", Function("exports, module",
"\n\
var toSpace = require('ianstormtaylor~to-space-case@0.1.2');\n\
\n\
\n\
/**\n\
 * Expose `toCamelCase`.\n\
 */\n\
\n\
module.exports = toCamelCase;\n\
\n\
\n\
/**\n\
 * Convert a `string` to camel case.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
\n\
function toCamelCase (string) {\n\
  return toSpace(string).replace(/\\s(\\w)/g, function (matches, letter) {\n\
    return letter.toUpperCase();\n\
  });\n\
}\n\
//# sourceURL=components/ianstormtaylor/to-camel-case/0.2.1/index.js"
));

require.modules["ianstormtaylor-to-camel-case"] = require.modules["ianstormtaylor~to-camel-case@0.2.1"];
require.modules["ianstormtaylor~to-camel-case"] = require.modules["ianstormtaylor~to-camel-case@0.2.1"];
require.modules["to-camel-case"] = require.modules["ianstormtaylor~to-camel-case@0.2.1"];


require.register("component~type@1.0.0", Function("exports, module",
"\n\
/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Function]': return 'function';\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object String]': return 'string';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val && val.nodeType === 1) return 'element';\n\
  if (val === Object(val)) return 'object';\n\
\n\
  return typeof val;\n\
};\n\
\n\
//# sourceURL=components/component/type/1.0.0/index.js"
));

require.modules["component-type"] = require.modules["component~type@1.0.0"];
require.modules["component~type"] = require.modules["component~type@1.0.0"];
require.modules["type"] = require.modules["component~type@1.0.0"];


require.register("component~props@1.1.2", Function("exports, module",
"/**\n\
 * Global Names\n\
 */\n\
\n\
var globals = /\\b(this|Array|Date|Object|Math|JSON)\\b/g;\n\
\n\
/**\n\
 * Return immediate identifiers parsed from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @param {String|Function} map function or prefix\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str, fn){\n\
  var p = unique(props(str));\n\
  if (fn && 'string' == typeof fn) fn = prefixed(fn);\n\
  if (fn) return map(str, p, fn);\n\
  return p;\n\
};\n\
\n\
/**\n\
 * Return immediate identifiers in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function props(str) {\n\
  return str\n\
    .replace(/\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n\
    .replace(globals, '')\n\
    .match(/[$a-zA-Z_]\\w*/g)\n\
    || [];\n\
}\n\
\n\
/**\n\
 * Return `str` with `props` mapped with `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Array} props\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function map(str, props, fn) {\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  return str.replace(re, function(_){\n\
    if ('(' == _[_.length - 1]) return fn(_);\n\
    if (!~props.indexOf(_)) return _;\n\
    return fn(_);\n\
  });\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Map with prefix `str`.\n\
 */\n\
\n\
function prefixed(str) {\n\
  return function(_){\n\
    return str + _;\n\
  };\n\
}\n\
\n\
//# sourceURL=components/component/props/1.1.2/index.js"
));

require.modules["component-props"] = require.modules["component~props@1.1.2"];
require.modules["component~props"] = require.modules["component~props@1.1.2"];
require.modules["props"] = require.modules["component~props@1.1.2"];


require.register("component~to-function@2.0.5", Function("exports, module",
"\n\
/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var expr;\n\
try {\n\
  expr = require('component~props@1.1.2');\n\
} catch(e) {\n\
  expr = require('component~props@1.1.2');\n\
}\n\
\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  };\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  };\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\" or \"age > 18 && age < 36\"\n\
  return new Function('_', 'return ' + get(str));\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {};\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key]);\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  };\n\
}\n\
\n\
/**\n\
 * Built the getter function. Supports getter style functions\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function get(str) {\n\
  var props = expr(str);\n\
  if (!props.length) return '_.' + str;\n\
\n\
  var val, i, prop;\n\
  for (i = 0; i < props.length; i++) {\n\
    prop = props[i];\n\
    val = '_.' + prop;\n\
    val = \"('function' == typeof \" + val + \" ? \" + val + \"() : \" + val + \")\";\n\
\n\
    // mimic negative lookbehind to avoid problems with nested properties\n\
    str = stripNested(prop, str, val);\n\
  }\n\
\n\
  return str;\n\
}\n\
\n\
/**\n\
 * Mimic negative lookbehind to avoid problems with nested properties.\n\
 *\n\
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript\n\
 *\n\
 * @param {String} prop\n\
 * @param {String} str\n\
 * @param {String} val\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function stripNested (prop, str, val) {\n\
  return str.replace(new RegExp('(\\\\.)?' + prop, 'g'), function($0, $1) {\n\
    return $1 ? $0 : val;\n\
  });\n\
}\n\
\n\
//# sourceURL=components/component/to-function/2.0.5/index.js"
));

require.modules["component-to-function"] = require.modules["component~to-function@2.0.5"];
require.modules["component~to-function"] = require.modules["component~to-function@2.0.5"];
require.modules["to-function"] = require.modules["component~to-function@2.0.5"];


require.register("component~each@0.2.5", Function("exports, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
try {\n\
  var type = require('component~type@1.0.0');\n\
} catch (err) {\n\
  var type = require('component~type@1.0.0');\n\
}\n\
\n\
var toFunction = require('component~to-function@2.0.5');\n\
\n\
/**\n\
 * HOP reference.\n\
 */\n\
\n\
var has = Object.prototype.hasOwnProperty;\n\
\n\
/**\n\
 * Iterate the given `obj` and invoke `fn(val, i)`\n\
 * in optional context `ctx`.\n\
 *\n\
 * @param {String|Array|Object} obj\n\
 * @param {Function} fn\n\
 * @param {Object} [ctx]\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn, ctx){\n\
  fn = toFunction(fn);\n\
  ctx = ctx || this;\n\
  switch (type(obj)) {\n\
    case 'array':\n\
      return array(obj, fn, ctx);\n\
    case 'object':\n\
      if ('number' == typeof obj.length) return array(obj, fn, ctx);\n\
      return object(obj, fn, ctx);\n\
    case 'string':\n\
      return string(obj, fn, ctx);\n\
  }\n\
};\n\
\n\
/**\n\
 * Iterate string chars.\n\
 *\n\
 * @param {String} obj\n\
 * @param {Function} fn\n\
 * @param {Object} ctx\n\
 * @api private\n\
 */\n\
\n\
function string(obj, fn, ctx) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn.call(ctx, obj.charAt(i), i);\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate object keys.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function} fn\n\
 * @param {Object} ctx\n\
 * @api private\n\
 */\n\
\n\
function object(obj, fn, ctx) {\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      fn.call(ctx, key, obj[key]);\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate array-ish.\n\
 *\n\
 * @param {Array|Object} obj\n\
 * @param {Function} fn\n\
 * @param {Object} ctx\n\
 * @api private\n\
 */\n\
\n\
function array(obj, fn, ctx) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn.call(ctx, obj[i], i);\n\
  }\n\
}\n\
\n\
//# sourceURL=components/component/each/0.2.5/index.js"
));

require.modules["component-each"] = require.modules["component~each@0.2.5"];
require.modules["component~each"] = require.modules["component~each@0.2.5"];
require.modules["each"] = require.modules["component~each@0.2.5"];


require.register("component~within-document@0.0.1", Function("exports, module",
"\n\
/**\n\
 * Check if `el` is within the document.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
module.exports = function(el) {\n\
  var node = el;\n\
  while (node = node.parentNode) {\n\
    if (node == document) return true;\n\
  }\n\
  return false;\n\
};\n\
//# sourceURL=components/component/within-document/0.0.1/index.js"
));

require.modules["component-within-document"] = require.modules["component~within-document@0.0.1"];
require.modules["component~within-document"] = require.modules["component~within-document@0.0.1"];
require.modules["within-document"] = require.modules["component~within-document@0.0.1"];


require.register("guille~ms.js@0.6.1", Function("exports, module",
"/**\n\
 * Helpers.\n\
 */\n\
\n\
var s = 1000;\n\
var m = s * 60;\n\
var h = m * 60;\n\
var d = h * 24;\n\
var y = d * 365.25;\n\
\n\
/**\n\
 * Parse or format the given `val`.\n\
 *\n\
 * Options:\n\
 *\n\
 *  - `long` verbose formatting [false]\n\
 *\n\
 * @param {String|Number} val\n\
 * @param {Object} options\n\
 * @return {String|Number}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val, options){\n\
  options = options || {};\n\
  if ('string' == typeof val) return parse(val);\n\
  return options.long\n\
    ? long(val)\n\
    : short(val);\n\
};\n\
\n\
/**\n\
 * Parse the given `str` and return milliseconds.\n\
 *\n\
 * @param {String} str\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
function parse(str) {\n\
  var match = /^((?:\\d+)?\\.?\\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);\n\
  if (!match) return;\n\
  var n = parseFloat(match[1]);\n\
  var type = (match[2] || 'ms').toLowerCase();\n\
  switch (type) {\n\
    case 'years':\n\
    case 'year':\n\
    case 'y':\n\
      return n * y;\n\
    case 'days':\n\
    case 'day':\n\
    case 'd':\n\
      return n * d;\n\
    case 'hours':\n\
    case 'hour':\n\
    case 'h':\n\
      return n * h;\n\
    case 'minutes':\n\
    case 'minute':\n\
    case 'm':\n\
      return n * m;\n\
    case 'seconds':\n\
    case 'second':\n\
    case 's':\n\
      return n * s;\n\
    case 'ms':\n\
      return n;\n\
  }\n\
}\n\
\n\
/**\n\
 * Short format for `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function short(ms) {\n\
  if (ms >= d) return Math.round(ms / d) + 'd';\n\
  if (ms >= h) return Math.round(ms / h) + 'h';\n\
  if (ms >= m) return Math.round(ms / m) + 'm';\n\
  if (ms >= s) return Math.round(ms / s) + 's';\n\
  return ms + 'ms';\n\
}\n\
\n\
/**\n\
 * Long format for `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function long(ms) {\n\
  return plural(ms, d, 'day')\n\
    || plural(ms, h, 'hour')\n\
    || plural(ms, m, 'minute')\n\
    || plural(ms, s, 'second')\n\
    || ms + ' ms';\n\
}\n\
\n\
/**\n\
 * Pluralization helper.\n\
 */\n\
\n\
function plural(ms, n, name) {\n\
  if (ms < n) return;\n\
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;\n\
  return Math.ceil(ms / n) + ' ' + name + 's';\n\
}\n\
\n\
//# sourceURL=components/guille/ms.js/0.6.1/index.js"
));

require.modules["guille-ms.js"] = require.modules["guille~ms.js@0.6.1"];
require.modules["guille~ms.js"] = require.modules["guille~ms.js@0.6.1"];
require.modules["ms.js"] = require.modules["guille~ms.js@0.6.1"];


require.register("visionmedia~debug@2.1.0", Function("exports, module",
"\n\
/**\n\
 * This is the web browser implementation of `debug()`.\n\
 *\n\
 * Expose `debug()` as the module.\n\
 */\n\
\n\
exports = module.exports = require('visionmedia~debug@2.1.0/debug.js');\n\
exports.log = log;\n\
exports.formatArgs = formatArgs;\n\
exports.save = save;\n\
exports.load = load;\n\
exports.useColors = useColors;\n\
\n\
/**\n\
 * Colors.\n\
 */\n\
\n\
exports.colors = [\n\
  'lightseagreen',\n\
  'forestgreen',\n\
  'goldenrod',\n\
  'dodgerblue',\n\
  'darkorchid',\n\
  'crimson'\n\
];\n\
\n\
/**\n\
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,\n\
 * and the Firebug extension (any Firefox version) are known\n\
 * to support \"%c\" CSS customizations.\n\
 *\n\
 * TODO: add a `localStorage` variable to explicitly enable/disable colors\n\
 */\n\
\n\
function useColors() {\n\
  // is webkit? http://stackoverflow.com/a/16459606/376773\n\
  return ('WebkitAppearance' in document.documentElement.style) ||\n\
    // is firebug? http://stackoverflow.com/a/398120/376773\n\
    (window.console && (console.firebug || (console.exception && console.table))) ||\n\
    // is firefox >= v31?\n\
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages\n\
    (navigator.userAgent.toLowerCase().match(/firefox\\/(\\d+)/) && parseInt(RegExp.$1, 10) >= 31);\n\
}\n\
\n\
/**\n\
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.\n\
 */\n\
\n\
exports.formatters.j = function(v) {\n\
  return JSON.stringify(v);\n\
};\n\
\n\
\n\
/**\n\
 * Colorize log arguments if enabled.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function formatArgs() {\n\
  var args = arguments;\n\
  var useColors = this.useColors;\n\
\n\
  args[0] = (useColors ? '%c' : '')\n\
    + this.namespace\n\
    + (useColors ? ' %c' : ' ')\n\
    + args[0]\n\
    + (useColors ? '%c ' : ' ')\n\
    + '+' + exports.humanize(this.diff);\n\
\n\
  if (!useColors) return args;\n\
\n\
  var c = 'color: ' + this.color;\n\
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));\n\
\n\
  // the final \"%c\" is somewhat tricky, because there could be other\n\
  // arguments passed either before or after the %c, so we need to\n\
  // figure out the correct index to insert the CSS into\n\
  var index = 0;\n\
  var lastC = 0;\n\
  args[0].replace(/%[a-z%]/g, function(match) {\n\
    if ('%%' === match) return;\n\
    index++;\n\
    if ('%c' === match) {\n\
      // we only are interested in the *last* %c\n\
      // (the user may have provided their own)\n\
      lastC = index;\n\
    }\n\
  });\n\
\n\
  args.splice(lastC, 0, c);\n\
  return args;\n\
}\n\
\n\
/**\n\
 * Invokes `console.log()` when available.\n\
 * No-op when `console.log` is not a \"function\".\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function log() {\n\
  // This hackery is required for IE8,\n\
  // where the `console.log` function doesn't have 'apply'\n\
  return 'object' == typeof console\n\
    && 'function' == typeof console.log\n\
    && Function.prototype.apply.call(console.log, console, arguments);\n\
}\n\
\n\
/**\n\
 * Save `namespaces`.\n\
 *\n\
 * @param {String} namespaces\n\
 * @api private\n\
 */\n\
\n\
function save(namespaces) {\n\
  try {\n\
    if (null == namespaces) {\n\
      localStorage.removeItem('debug');\n\
    } else {\n\
      localStorage.debug = namespaces;\n\
    }\n\
  } catch(e) {}\n\
}\n\
\n\
/**\n\
 * Load `namespaces`.\n\
 *\n\
 * @return {String} returns the previously persisted debug modes\n\
 * @api private\n\
 */\n\
\n\
function load() {\n\
  var r;\n\
  try {\n\
    r = localStorage.debug;\n\
  } catch(e) {}\n\
  return r;\n\
}\n\
\n\
/**\n\
 * Enable namespaces listed in `localStorage.debug` initially.\n\
 */\n\
\n\
exports.enable(load());\n\
\n\
//# sourceURL=components/visionmedia/debug/2.1.0/browser.js"
));

require.register("visionmedia~debug@2.1.0/debug.js", Function("exports, module",
"\n\
/**\n\
 * This is the common logic for both the Node.js and web browser\n\
 * implementations of `debug()`.\n\
 *\n\
 * Expose `debug()` as the module.\n\
 */\n\
\n\
exports = module.exports = debug;\n\
exports.coerce = coerce;\n\
exports.disable = disable;\n\
exports.enable = enable;\n\
exports.enabled = enabled;\n\
exports.humanize = require('guille~ms.js@0.6.1');\n\
\n\
/**\n\
 * The currently active debug mode names, and names to skip.\n\
 */\n\
\n\
exports.names = [];\n\
exports.skips = [];\n\
\n\
/**\n\
 * Map of special \"%n\" handling functions, for the debug \"format\" argument.\n\
 *\n\
 * Valid key names are a single, lowercased letter, i.e. \"n\".\n\
 */\n\
\n\
exports.formatters = {};\n\
\n\
/**\n\
 * Previously assigned color.\n\
 */\n\
\n\
var prevColor = 0;\n\
\n\
/**\n\
 * Previous log timestamp.\n\
 */\n\
\n\
var prevTime;\n\
\n\
/**\n\
 * Select a color.\n\
 *\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
function selectColor() {\n\
  return exports.colors[prevColor++ % exports.colors.length];\n\
}\n\
\n\
/**\n\
 * Create a debugger with the given `namespace`.\n\
 *\n\
 * @param {String} namespace\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
function debug(namespace) {\n\
\n\
  // define the `disabled` version\n\
  function disabled() {\n\
  }\n\
  disabled.enabled = false;\n\
\n\
  // define the `enabled` version\n\
  function enabled() {\n\
\n\
    var self = enabled;\n\
\n\
    // set `diff` timestamp\n\
    var curr = +new Date();\n\
    var ms = curr - (prevTime || curr);\n\
    self.diff = ms;\n\
    self.prev = prevTime;\n\
    self.curr = curr;\n\
    prevTime = curr;\n\
\n\
    // add the `color` if not set\n\
    if (null == self.useColors) self.useColors = exports.useColors();\n\
    if (null == self.color && self.useColors) self.color = selectColor();\n\
\n\
    var args = Array.prototype.slice.call(arguments);\n\
\n\
    args[0] = exports.coerce(args[0]);\n\
\n\
    if ('string' !== typeof args[0]) {\n\
      // anything else let's inspect with %o\n\
      args = ['%o'].concat(args);\n\
    }\n\
\n\
    // apply any `formatters` transformations\n\
    var index = 0;\n\
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {\n\
      // if we encounter an escaped % then don't increase the array index\n\
      if (match === '%%') return match;\n\
      index++;\n\
      var formatter = exports.formatters[format];\n\
      if ('function' === typeof formatter) {\n\
        var val = args[index];\n\
        match = formatter.call(self, val);\n\
\n\
        // now we need to remove `args[index]` since it's inlined in the `format`\n\
        args.splice(index, 1);\n\
        index--;\n\
      }\n\
      return match;\n\
    });\n\
\n\
    if ('function' === typeof exports.formatArgs) {\n\
      args = exports.formatArgs.apply(self, args);\n\
    }\n\
    var logFn = enabled.log || exports.log || console.log.bind(console);\n\
    logFn.apply(self, args);\n\
  }\n\
  enabled.enabled = true;\n\
\n\
  var fn = exports.enabled(namespace) ? enabled : disabled;\n\
\n\
  fn.namespace = namespace;\n\
\n\
  return fn;\n\
}\n\
\n\
/**\n\
 * Enables a debug mode by namespaces. This can include modes\n\
 * separated by a colon and wildcards.\n\
 *\n\
 * @param {String} namespaces\n\
 * @api public\n\
 */\n\
\n\
function enable(namespaces) {\n\
  exports.save(namespaces);\n\
\n\
  var split = (namespaces || '').split(/[\\s,]+/);\n\
  var len = split.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    if (!split[i]) continue; // ignore empty strings\n\
    namespaces = split[i].replace(/\\*/g, '.*?');\n\
    if (namespaces[0] === '-') {\n\
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));\n\
    } else {\n\
      exports.names.push(new RegExp('^' + namespaces + '$'));\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Disable debug output.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function disable() {\n\
  exports.enable('');\n\
}\n\
\n\
/**\n\
 * Returns true if the given mode name is enabled, false otherwise.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function enabled(name) {\n\
  var i, len;\n\
  for (i = 0, len = exports.skips.length; i < len; i++) {\n\
    if (exports.skips[i].test(name)) {\n\
      return false;\n\
    }\n\
  }\n\
  for (i = 0, len = exports.names.length; i < len; i++) {\n\
    if (exports.names[i].test(name)) {\n\
      return true;\n\
    }\n\
  }\n\
  return false;\n\
}\n\
\n\
/**\n\
 * Coerce `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
function coerce(val) {\n\
  if (val instanceof Error) return val.stack || val.message;\n\
  return val;\n\
}\n\
\n\
//# sourceURL=components/visionmedia/debug/2.1.0/debug.js"
));

require.modules["visionmedia-debug"] = require.modules["visionmedia~debug@2.1.0"];
require.modules["visionmedia~debug"] = require.modules["visionmedia~debug@2.1.0"];
require.modules["debug"] = require.modules["visionmedia~debug@2.1.0"];


require.register("component~css@0.0.6", Function("exports, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var debug = require('visionmedia~debug@2.1.0')('css');\n\
var set = require('component~css@0.0.6/lib/style.js');\n\
var get = require('component~css@0.0.6/lib/css.js');\n\
\n\
/**\n\
 * Expose `css`\n\
 */\n\
\n\
module.exports = css;\n\
\n\
/**\n\
 * Get and set css values\n\
 *\n\
 * @param {Element} el\n\
 * @param {String|Object} prop\n\
 * @param {Mixed} val\n\
 * @return {Element} el\n\
 * @api public\n\
 */\n\
\n\
function css(el, prop, val) {\n\
  if (!el) return;\n\
\n\
  if (undefined !== val) {\n\
    var obj = {};\n\
    obj[prop] = val;\n\
    debug('setting styles %j', obj);\n\
    return setStyles(el, obj);\n\
  }\n\
\n\
  if ('object' == typeof prop) {\n\
    debug('setting styles %j', prop);\n\
    return setStyles(el, prop);\n\
  }\n\
\n\
  debug('getting %s', prop);\n\
  return get(el, prop);\n\
}\n\
\n\
/**\n\
 * Set the styles on an element\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} props\n\
 * @return {Element} el\n\
 */\n\
\n\
function setStyles(el, props) {\n\
  for (var prop in props) {\n\
    set(el, prop, props[prop]);\n\
  }\n\
\n\
  return el;\n\
}\n\
\n\
//# sourceURL=components/component/css/0.0.6/index.js"
));

require.register("component~css@0.0.6/lib/css.js", Function("exports, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var debug = require('visionmedia~debug@2.1.0')('css:css');\n\
var camelcase = require('ianstormtaylor~to-camel-case@0.2.1');\n\
var computed = require('component~css@0.0.6/lib/computed.js');\n\
var property = require('component~css@0.0.6/lib/prop.js');\n\
\n\
/**\n\
 * Expose `css`\n\
 */\n\
\n\
module.exports = css;\n\
\n\
/**\n\
 * CSS Normal Transforms\n\
 */\n\
\n\
var cssNormalTransform = {\n\
  letterSpacing: 0,\n\
  fontWeight: 400\n\
};\n\
\n\
/**\n\
 * Get a CSS value\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Mixed} extra\n\
 * @param {Array} styles\n\
 * @return {String}\n\
 */\n\
\n\
function css(el, prop, extra, styles) {\n\
  var hooks = require('component~css@0.0.6/lib/hooks.js');\n\
  var orig = camelcase(prop);\n\
  var style = el.style;\n\
  var val;\n\
\n\
  prop = property(prop, style);\n\
  var hook = hooks[prop] || hooks[orig];\n\
\n\
  // If a hook was provided get the computed value from there\n\
  if (hook && hook.get) {\n\
    debug('get hook provided. use that');\n\
    val = hook.get(el, true, extra);\n\
  }\n\
\n\
  // Otherwise, if a way to get the computed value exists, use that\n\
  if (undefined == val) {\n\
    debug('fetch the computed value of %s', prop);\n\
    val = computed(el, prop);\n\
  }\n\
\n\
  if ('normal' == val && cssNormalTransform[prop]) {\n\
    val = cssNormalTransform[prop];\n\
    debug('normal => %s', val);\n\
  }\n\
\n\
  // Return, converting to number if forced or a qualifier was provided and val looks numeric\n\
  if ('' == extra || extra) {\n\
    debug('converting value: %s into a number', val);\n\
    var num = parseFloat(val);\n\
    return true === extra || isNumeric(num) ? num || 0 : val;\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
/**\n\
 * Is Numeric\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Boolean}\n\
 */\n\
\n\
function isNumeric(obj) {\n\
  return !isNan(parseFloat(obj)) && isFinite(obj);\n\
}\n\
\n\
//# sourceURL=components/component/css/0.0.6/lib/css.js"
));

require.register("component~css@0.0.6/lib/prop.js", Function("exports, module",
"/**\n\
 * Module dependencies\n\
 */\n\
\n\
var debug = require('visionmedia~debug@2.1.0')('css:prop');\n\
var camelcase = require('ianstormtaylor~to-camel-case@0.2.1');\n\
var vendor = require('component~css@0.0.6/lib/vendor.js');\n\
\n\
/**\n\
 * Export `prop`\n\
 */\n\
\n\
module.exports = prop;\n\
\n\
/**\n\
 * Normalize Properties\n\
 */\n\
\n\
var cssProps = {\n\
  'float': 'cssFloat' in document.documentElement.style ? 'cssFloat' : 'styleFloat'\n\
};\n\
\n\
/**\n\
 * Get the vendor prefixed property\n\
 *\n\
 * @param {String} prop\n\
 * @param {String} style\n\
 * @return {String} prop\n\
 * @api private\n\
 */\n\
\n\
function prop(prop, style) {\n\
  prop = cssProps[prop] || (cssProps[prop] = vendor(prop, style));\n\
  debug('transform property: %s => %s', prop, style);\n\
  return prop;\n\
}\n\
\n\
//# sourceURL=components/component/css/0.0.6/lib/prop.js"
));

require.register("component~css@0.0.6/lib/swap.js", Function("exports, module",
"/**\n\
 * Export `swap`\n\
 */\n\
\n\
module.exports = swap;\n\
\n\
/**\n\
 * Initialize `swap`\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} options\n\
 * @param {Function} fn\n\
 * @param {Array} args\n\
 * @return {Mixed}\n\
 */\n\
\n\
function swap(el, options, fn, args) {\n\
  // Remember the old values, and insert the new ones\n\
  for (var key in options) {\n\
    old[key] = el.style[key];\n\
    el.style[key] = options[key];\n\
  }\n\
\n\
  ret = fn.apply(el, args || []);\n\
\n\
  // Revert the old values\n\
  for (key in options) {\n\
    el.style[key] = old[key];\n\
  }\n\
\n\
  return ret;\n\
}\n\
\n\
//# sourceURL=components/component/css/0.0.6/lib/swap.js"
));

require.register("component~css@0.0.6/lib/style.js", Function("exports, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var debug = require('visionmedia~debug@2.1.0')('css:style');\n\
var camelcase = require('ianstormtaylor~to-camel-case@0.2.1');\n\
var support = require('component~css@0.0.6/lib/support.js');\n\
var property = require('component~css@0.0.6/lib/prop.js');\n\
var hooks = require('component~css@0.0.6/lib/hooks.js');\n\
\n\
/**\n\
 * Expose `style`\n\
 */\n\
\n\
module.exports = style;\n\
\n\
/**\n\
 * Possibly-unitless properties\n\
 *\n\
 * Don't automatically add 'px' to these properties\n\
 */\n\
\n\
var cssNumber = {\n\
  \"columnCount\": true,\n\
  \"fillOpacity\": true,\n\
  \"fontWeight\": true,\n\
  \"lineHeight\": true,\n\
  \"opacity\": true,\n\
  \"order\": true,\n\
  \"orphans\": true,\n\
  \"widows\": true,\n\
  \"zIndex\": true,\n\
  \"zoom\": true\n\
};\n\
\n\
/**\n\
 * Set a css value\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @param {Mixed} extra\n\
 */\n\
\n\
function style(el, prop, val, extra) {\n\
  // Don't set styles on text and comment nodes\n\
  if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style ) return;\n\
\n\
  var orig = camelcase(prop);\n\
  var style = el.style;\n\
  var type = typeof val;\n\
\n\
  if (!val) return get(el, prop, orig, extra);\n\
\n\
  prop = property(prop, style);\n\
\n\
  var hook = hooks[prop] || hooks[orig];\n\
\n\
  // If a number was passed in, add 'px' to the (except for certain CSS properties)\n\
  if ('number' == type && !cssNumber[orig]) {\n\
    debug('adding \"px\" to end of number');\n\
    val += 'px';\n\
  }\n\
\n\
  // Fixes jQuery #8908, it can be done more correctly by specifying setters in cssHooks,\n\
  // but it would mean to define eight (for every problematic property) identical functions\n\
  if (!support.clearCloneStyle && '' === val && 0 === prop.indexOf('background')) {\n\
    debug('set property (%s) value to \"inherit\"', prop);\n\
    style[prop] = 'inherit';\n\
  }\n\
\n\
  // If a hook was provided, use that value, otherwise just set the specified value\n\
  if (!hook || !hook.set || undefined !== (val = hook.set(el, val, extra))) {\n\
    // Support: Chrome, Safari\n\
    // Setting style to blank string required to delete \"style: x !important;\"\n\
    debug('set hook defined. setting property (%s) to %s', prop, val);\n\
    style[prop] = '';\n\
    style[prop] = val;\n\
  }\n\
\n\
}\n\
\n\
/**\n\
 * Get the style\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {String} orig\n\
 * @param {Mixed} extra\n\
 * @return {String}\n\
 */\n\
\n\
function get(el, prop, orig, extra) {\n\
  var style = el.style;\n\
  var hook = hooks[prop] || hooks[orig];\n\
  var ret;\n\
\n\
  if (hook && hook.get && undefined !== (ret = hook.get(el, false, extra))) {\n\
    debug('get hook defined, returning: %s', ret);\n\
    return ret;\n\
  }\n\
\n\
  ret = style[prop];\n\
  debug('getting %s', ret);\n\
  return ret;\n\
}\n\
\n\
//# sourceURL=components/component/css/0.0.6/lib/style.js"
));

require.register("component~css@0.0.6/lib/hooks.js", Function("exports, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var each = require('component~each@0.2.5');\n\
var css = require('component~css@0.0.6/lib/css.js');\n\
var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };\n\
var pnum = (/[+-]?(?:\\d*\\.|)\\d+(?:[eE][+-]?\\d+|)/).source;\n\
var rnumnonpx = new RegExp( '^(' + pnum + ')(?!px)[a-z%]+$', 'i');\n\
var rnumsplit = new RegExp( '^(' + pnum + ')(.*)$', 'i');\n\
var rdisplayswap = /^(none|table(?!-c[ea]).+)/;\n\
var styles = require('component~css@0.0.6/lib/styles.js');\n\
var support = require('component~css@0.0.6/lib/support.js');\n\
var swap = require('component~css@0.0.6/lib/swap.js');\n\
var computed = require('component~css@0.0.6/lib/computed.js');\n\
var cssExpand = [ \"Top\", \"Right\", \"Bottom\", \"Left\" ];\n\
\n\
/**\n\
 * Height & Width\n\
 */\n\
\n\
each(['width', 'height'], function(name) {\n\
  exports[name] = {};\n\
\n\
  exports[name].get = function(el, compute, extra) {\n\
    if (!compute) return;\n\
    // certain elements can have dimension info if we invisibly show them\n\
    // however, it must have a current display style that would benefit from this\n\
    return 0 == el.offsetWidth && rdisplayswap.test(css(el, 'display'))\n\
      ? swap(el, cssShow, function() { return getWidthOrHeight(el, name, extra); })\n\
      : getWidthOrHeight(el, name, extra);\n\
  }\n\
\n\
  exports[name].set = function(el, val, extra) {\n\
    var styles = extra && styles(el);\n\
    return setPositiveNumber(el, val, extra\n\
      ? augmentWidthOrHeight(el, name, extra, 'border-box' == css(el, 'boxSizing', false, styles), styles)\n\
      : 0\n\
    );\n\
  };\n\
\n\
});\n\
\n\
/**\n\
 * Opacity\n\
 */\n\
\n\
exports.opacity = {};\n\
exports.opacity.get = function(el, compute) {\n\
  if (!compute) return;\n\
  var ret = computed(el, 'opacity');\n\
  return '' == ret ? '1' : ret;\n\
}\n\
\n\
/**\n\
 * Utility: Set Positive Number\n\
 *\n\
 * @param {Element} el\n\
 * @param {Mixed} val\n\
 * @param {Number} subtract\n\
 * @return {Number}\n\
 */\n\
\n\
function setPositiveNumber(el, val, subtract) {\n\
  var matches = rnumsplit.exec(val);\n\
  return matches ?\n\
    // Guard against undefined 'subtract', e.g., when used as in cssHooks\n\
    Math.max(0, matches[1]) + (matches[2] || 'px') :\n\
    val;\n\
}\n\
\n\
/**\n\
 * Utility: Get the width or height\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Mixed} extra\n\
 * @return {String}\n\
 */\n\
\n\
function getWidthOrHeight(el, prop, extra) {\n\
  // Start with offset property, which is equivalent to the border-box value\n\
  var valueIsBorderBox = true;\n\
  var val = prop === 'width' ? el.offsetWidth : el.offsetHeight;\n\
  var styles = computed(el);\n\
  var isBorderBox = support.boxSizing && css(el, 'boxSizing') === 'border-box';\n\
\n\
  // some non-html elements return undefined for offsetWidth, so check for null/undefined\n\
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285\n\
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668\n\
  if (val <= 0 || val == null) {\n\
    // Fall back to computed then uncomputed css if necessary\n\
    val = computed(el, prop, styles);\n\
\n\
    if (val < 0 || val == null) {\n\
      val = el.style[prop];\n\
    }\n\
\n\
    // Computed unit is not pixels. Stop here and return.\n\
    if (rnumnonpx.test(val)) {\n\
      return val;\n\
    }\n\
\n\
    // we need the check for style in case a browser which returns unreliable values\n\
    // for getComputedStyle silently falls back to the reliable el.style\n\
    valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === el.style[prop]);\n\
\n\
    // Normalize ', auto, and prepare for extra\n\
    val = parseFloat(val) || 0;\n\
  }\n\
\n\
  // use the active box-sizing model to add/subtract irrelevant styles\n\
  extra = extra || (isBorderBox ? 'border' : 'content');\n\
  val += augmentWidthOrHeight(el, prop, extra, valueIsBorderBox, styles);\n\
  return val + 'px';\n\
}\n\
\n\
/**\n\
 * Utility: Augment the width or the height\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Mixed} extra\n\
 * @param {Boolean} isBorderBox\n\
 * @param {Array} styles\n\
 */\n\
\n\
function augmentWidthOrHeight(el, prop, extra, isBorderBox, styles) {\n\
  // If we already have the right measurement, avoid augmentation,\n\
  // Otherwise initialize for horizontal or vertical properties\n\
  var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : 'width' == prop ? 1 : 0;\n\
  var val = 0;\n\
\n\
  for (; i < 4; i += 2) {\n\
    // both box models exclude margin, so add it if we want it\n\
    if (extra === 'margin') {\n\
      val += css(el, extra + cssExpand[i], true, styles);\n\
    }\n\
\n\
    if (isBorderBox) {\n\
      // border-box includes padding, so remove it if we want content\n\
      if (extra === 'content') {\n\
        val -= css(el, 'padding' + cssExpand[i], true, styles);\n\
      }\n\
\n\
      // at this point, extra isn't border nor margin, so remove border\n\
      if (extra !== 'margin') {\n\
        val -= css(el, 'border' + cssExpand[i] + 'Width', true, styles);\n\
      }\n\
    } else {\n\
      // at this point, extra isn't content, so add padding\n\
      val += css(el, 'padding' + cssExpand[i], true, styles);\n\
\n\
      // at this point, extra isn't content nor padding, so add border\n\
      if (extra !== 'padding') {\n\
        val += css(el, 'border' + cssExpand[i] + 'Width', true, styles);\n\
      }\n\
    }\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
//# sourceURL=components/component/css/0.0.6/lib/hooks.js"
));

require.register("component~css@0.0.6/lib/styles.js", Function("exports, module",
"/**\n\
 * Expose `styles`\n\
 */\n\
\n\
module.exports = styles;\n\
\n\
/**\n\
 * Get all the styles\n\
 *\n\
 * @param {Element} el\n\
 * @return {Array}\n\
 */\n\
\n\
function styles(el) {\n\
  if (window.getComputedStyle) {\n\
    return el.ownerDocument.defaultView.getComputedStyle(el, null);\n\
  } else {\n\
    return el.currentStyle;\n\
  }\n\
}\n\
\n\
//# sourceURL=components/component/css/0.0.6/lib/styles.js"
));

require.register("component~css@0.0.6/lib/vendor.js", Function("exports, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var prefixes = ['Webkit', 'O', 'Moz', 'ms'];\n\
\n\
/**\n\
 * Expose `vendor`\n\
 */\n\
\n\
module.exports = vendor;\n\
\n\
/**\n\
 * Get the vendor prefix for a given property\n\
 *\n\
 * @param {String} prop\n\
 * @param {Object} style\n\
 * @return {String}\n\
 */\n\
\n\
function vendor(prop, style) {\n\
  // shortcut for names that are not vendor prefixed\n\
  if (style[prop]) return prop;\n\
\n\
  // check for vendor prefixed names\n\
  var capName = prop[0].toUpperCase() + prop.slice(1);\n\
  var original = prop;\n\
  var i = prefixes.length;\n\
\n\
  while (i--) {\n\
    prop = prefixes[i] + capName;\n\
    if (prop in style) return prop;\n\
  }\n\
\n\
  return original;\n\
}\n\
\n\
//# sourceURL=components/component/css/0.0.6/lib/vendor.js"
));

require.register("component~css@0.0.6/lib/support.js", Function("exports, module",
"/**\n\
 * Support values\n\
 */\n\
\n\
var reliableMarginRight;\n\
var boxSizingReliableVal;\n\
var pixelPositionVal;\n\
var clearCloneStyle;\n\
\n\
/**\n\
 * Container setup\n\
 */\n\
\n\
var docElem = document.documentElement;\n\
var container = document.createElement('div');\n\
var div = document.createElement('div');\n\
\n\
/**\n\
 * Clear clone style\n\
 */\n\
\n\
div.style.backgroundClip = 'content-box';\n\
div.cloneNode(true).style.backgroundClip = '';\n\
exports.clearCloneStyle = div.style.backgroundClip === 'content-box';\n\
\n\
container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';\n\
container.appendChild(div);\n\
\n\
/**\n\
 * Pixel position\n\
 *\n\
 * Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084\n\
 * getComputedStyle returns percent when specified for top/left/bottom/right\n\
 * rather than make the css module depend on the offset module, we just check for it here\n\
 */\n\
\n\
exports.pixelPosition = function() {\n\
  if (undefined == pixelPositionVal) computePixelPositionAndBoxSizingReliable();\n\
  return pixelPositionVal;\n\
}\n\
\n\
/**\n\
 * Reliable box sizing\n\
 */\n\
\n\
exports.boxSizingReliable = function() {\n\
  if (undefined == boxSizingReliableVal) computePixelPositionAndBoxSizingReliable();\n\
  return boxSizingReliableVal;\n\
}\n\
\n\
/**\n\
 * Reliable margin right\n\
 *\n\
 * Support: Android 2.3\n\
 * Check if div with explicit width and no margin-right incorrectly\n\
 * gets computed margin-right based on width of container. (#3333)\n\
 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
 * This support function is only executed once so no memoizing is needed.\n\
 *\n\
 * @return {Boolean}\n\
 */\n\
\n\
exports.reliableMarginRight = function() {\n\
  var ret;\n\
  var marginDiv = div.appendChild(document.createElement(\"div\" ));\n\
\n\
  marginDiv.style.cssText = div.style.cssText = divReset;\n\
  marginDiv.style.marginRight = marginDiv.style.width = \"0\";\n\
  div.style.width = \"1px\";\n\
  docElem.appendChild(container);\n\
\n\
  ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);\n\
\n\
  docElem.removeChild(container);\n\
\n\
  // Clean up the div for other support tests.\n\
  div.innerHTML = \"\";\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Executing both pixelPosition & boxSizingReliable tests require only one layout\n\
 * so they're executed at the same time to save the second computation.\n\
 */\n\
\n\
function computePixelPositionAndBoxSizingReliable() {\n\
  // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).\n\
  div.style.cssText = \"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;\" +\n\
    \"box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;\" +\n\
    \"position:absolute;top:1%\";\n\
  docElem.appendChild(container);\n\
\n\
  var divStyle = window.getComputedStyle(div, null);\n\
  pixelPositionVal = divStyle.top !== \"1%\";\n\
  boxSizingReliableVal = divStyle.width === \"4px\";\n\
\n\
  docElem.removeChild(container);\n\
}\n\
\n\
\n\
\n\
//# sourceURL=components/component/css/0.0.6/lib/support.js"
));

require.register("component~css@0.0.6/lib/computed.js", Function("exports, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var debug = require('visionmedia~debug@2.1.0')('css:computed');\n\
var withinDocument = require('component~within-document@0.0.1');\n\
var styles = require('component~css@0.0.6/lib/styles.js');\n\
\n\
/**\n\
 * Expose `computed`\n\
 */\n\
\n\
module.exports = computed;\n\
\n\
/**\n\
 * Get the computed style\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Array} precomputed (optional)\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function computed(el, prop, precomputed) {\n\
  var computed = precomputed || styles(el);\n\
  var ret;\n\
  \n\
  if (!computed) return;\n\
\n\
  if (computed.getPropertyValue) {\n\
    ret = computed.getPropertyValue(prop) || computed[prop];\n\
  } else {\n\
    ret = computed[prop];\n\
  }\n\
\n\
  if ('' === ret && !withinDocument(el)) {\n\
    debug('element not within document, try finding from style attribute');\n\
    var style = require('component~css@0.0.6/lib/style.js');\n\
    ret = style(el, prop);\n\
  }\n\
\n\
  debug('computed value of %s: %s', prop, ret);\n\
\n\
  // Support: IE\n\
  // IE returns zIndex value as an integer.\n\
  return undefined === ret ? ret : ret + '';\n\
}\n\
\n\
//# sourceURL=components/component/css/0.0.6/lib/computed.js"
));

require.modules["component-css"] = require.modules["component~css@0.0.6"];
require.modules["component~css"] = require.modules["component~css@0.0.6"];
require.modules["css"] = require.modules["component~css@0.0.6"];


require.register("component~get-document@0.1.0", Function("exports, module",
"\n\
/**\n\
 * Module exports.\n\
 */\n\
\n\
module.exports = getDocument;\n\
\n\
// defined by w3c\n\
var DOCUMENT_NODE = 9;\n\
\n\
/**\n\
 * Returns the `document` object associated with the given `node`, which may be\n\
 * a DOM element, the Window object, a Selection, a Range. Basically any DOM\n\
 * object that references the Document in some way, this function will find it.\n\
 *\n\
 * @param {Mixed} node - DOM node, selection, or range in which to find the `document` object\n\
 * @return {Document} the `document` object associated with `node`\n\
 * @public\n\
 */\n\
\n\
function getDocument(node) {\n\
  if (node.nodeType === DOCUMENT_NODE) {\n\
    return node;\n\
\n\
  } else if (typeof node.ownerDocument != 'undefined' &&\n\
      node.ownerDocument.nodeType === DOCUMENT_NODE) {\n\
    return node.ownerDocument;\n\
\n\
  } else if (typeof node.document != 'undefined' &&\n\
      node.document.nodeType === DOCUMENT_NODE) {\n\
    return node.document;\n\
\n\
  } else if (node.parentNode) {\n\
    return getDocument(node.parentNode);\n\
\n\
  // Range support\n\
  } else if (node.commonAncestorContainer) {\n\
    return getDocument(node.commonAncestorContainer);\n\
\n\
  } else if (node.startContainer) {\n\
    return getDocument(node.startContainer);\n\
\n\
  // Selection support\n\
  } else if (node.baseNode) {\n\
    return getDocument(node.baseNode);\n\
  }\n\
}\n\
\n\
//# sourceURL=components/component/get-document/0.1.0/index.js"
));

require.modules["component-get-document"] = require.modules["component~get-document@0.1.0"];
require.modules["component~get-document"] = require.modules["component~get-document@0.1.0"];
require.modules["get-document"] = require.modules["component~get-document@0.1.0"];


require.register("ded~domready@v1.0.7", Function("exports, module",
"/*!\n\
  * domready (c) Dustin Diaz 2014 - License MIT\n\
  */\n\
!function (name, definition) {\n\
\n\
  if (typeof module != 'undefined') module.exports = definition()\n\
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)\n\
  else this[name] = definition()\n\
\n\
}('domready', function () {\n\
\n\
  var fns = [], listener\n\
    , doc = document\n\
    , hack = doc.documentElement.doScroll\n\
    , domContentLoaded = 'DOMContentLoaded'\n\
    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)\n\
\n\
\n\
  if (!loaded)\n\
  doc.addEventListener(domContentLoaded, listener = function () {\n\
    doc.removeEventListener(domContentLoaded, listener)\n\
    loaded = 1\n\
    while (listener = fns.shift()) listener()\n\
  })\n\
\n\
  return function (fn) {\n\
    loaded ? fn() : fns.push(fn)\n\
  }\n\
\n\
});\n\
\n\
//# sourceURL=components/ded/domready/v1.0.7/ready.js"
));

require.modules["ded-domready"] = require.modules["ded~domready@v1.0.7"];
require.modules["ded~domready"] = require.modules["ded~domready@v1.0.7"];
require.modules["domready"] = require.modules["ded~domready@v1.0.7"];


require.register("detects~dom-support@master", Function("exports, module",
"var domready = require('ded~domready@v1.0.7')\n\
\n\
module.exports = (function() {\n\
\n\
\tvar support,\n\
\t\tall,\n\
\t\ta,\n\
\t\tselect,\n\
\t\topt,\n\
\t\tinput,\n\
\t\tfragment,\n\
\t\teventName,\n\
\t\ti,\n\
\t\tisSupported,\n\
\t\tclickFn,\n\
\t\tdiv = document.createElement(\"div\");\n\
\n\
\t// Setup\n\
\tdiv.setAttribute( \"className\", \"t\" );\n\
\tdiv.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\
\n\
\t// Support tests won't run in some limited or non-browser environments\n\
\tall = div.getElementsByTagName(\"*\");\n\
\ta = div.getElementsByTagName(\"a\")[ 0 ];\n\
\tif ( !all || !a || !all.length ) {\n\
\t\treturn {};\n\
\t}\n\
\n\
\t// First batch of tests\n\
\tselect = document.createElement(\"select\");\n\
\topt = select.appendChild( document.createElement(\"option\") );\n\
\tinput = div.getElementsByTagName(\"input\")[ 0 ];\n\
\n\
\ta.style.cssText = \"top:1px;float:left;opacity:.5\";\n\
\tsupport = {\n\
\t\t// IE strips leading whitespace when .innerHTML is used\n\
\t\tleadingWhitespace: ( div.firstChild.nodeType === 3 ),\n\
\n\
\t\t// Make sure that tbody elements aren't automatically inserted\n\
\t\t// IE will insert them into empty tables\n\
\t\ttbody: !div.getElementsByTagName(\"tbody\").length,\n\
\n\
\t\t// Make sure that link elements get serialized correctly by innerHTML\n\
\t\t// This requires a wrapper element in IE\n\
\t\thtmlSerialize: !!div.getElementsByTagName(\"link\").length,\n\
\n\
\t\t// Get the style information from getAttribute\n\
\t\t// (IE uses .cssText instead)\n\
\t\tstyle: /top/.test( a.getAttribute(\"style\") ),\n\
\n\
\t\t// Make sure that URLs aren't manipulated\n\
\t\t// (IE normalizes it by default)\n\
\t\threfNormalized: ( a.getAttribute(\"href\") === \"/a\" ),\n\
\n\
\t\t// Make sure that element opacity exists\n\
\t\t// (IE uses filter instead)\n\
\t\t// Use a regex to work around a WebKit issue. See #5145\n\
\t\topacity: /^0.5/.test( a.style.opacity ),\n\
\n\
\t\t// Verify style float existence\n\
\t\t// (IE uses styleFloat instead of cssFloat)\n\
\t\tcssFloat: !!a.style.cssFloat,\n\
\n\
\t\t// Make sure that if no value is specified for a checkbox\n\
\t\t// that it defaults to \"on\".\n\
\t\t// (WebKit defaults to \"\" instead)\n\
\t\tcheckOn: ( input.value === \"on\" ),\n\
\n\
\t\t// Make sure that a selected-by-default option has a working selected property.\n\
\t\t// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)\n\
\t\toptSelected: opt.selected,\n\
\n\
\t\t// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)\n\
\t\tgetSetAttribute: div.className !== \"t\",\n\
\n\
\t\t// Tests for enctype support on a form (#6743)\n\
\t\tenctype: !!document.createElement(\"form\").enctype,\n\
\n\
\t\t// Makes sure cloning an html5 element does not cause problems\n\
\t\t// Where outerHTML is undefined, this still works\n\
\t\thtml5Clone: document.createElement(\"nav\").cloneNode( true ).outerHTML !== \"<:nav></:nav>\",\n\
\n\
\t\t// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode\n\
\t\tboxModel: ( document.compatMode === \"CSS1Compat\" ),\n\
\n\
\t\t// Will be defined later\n\
\t\tsubmitBubbles: true,\n\
\t\tchangeBubbles: true,\n\
\t\tfocusinBubbles: false,\n\
\t\tdeleteExpando: true,\n\
\t\tnoCloneEvent: true,\n\
\t\tinlineBlockNeedsLayout: false,\n\
\t\tshrinkWrapBlocks: false,\n\
\t\treliableMarginRight: true,\n\
\t\tboxSizingReliable: true,\n\
\t\tpixelPosition: false\n\
\t};\n\
\n\
\t// Make sure checked status is properly cloned\n\
\tinput.checked = true;\n\
\tsupport.noCloneChecked = input.cloneNode( true ).checked;\n\
\n\
\t// Make sure that the options inside disabled selects aren't marked as disabled\n\
\t// (WebKit marks them as disabled)\n\
\tselect.disabled = true;\n\
\tsupport.optDisabled = !opt.disabled;\n\
\n\
\t// Test to see if it's possible to delete an expando from an element\n\
\t// Fails in Internet Explorer\n\
\ttry {\n\
\t\tdelete div.test;\n\
\t} catch( e ) {\n\
\t\tsupport.deleteExpando = false;\n\
\t}\n\
\n\
\tif ( !div.addEventListener && div.attachEvent && div.fireEvent ) {\n\
\t\tdiv.attachEvent( \"onclick\", clickFn = function() {\n\
\t\t\t// Cloning a node shouldn't copy over any\n\
\t\t\t// bound event handlers (IE does this)\n\
\t\t\tsupport.noCloneEvent = false;\n\
\t\t});\n\
\t\tdiv.cloneNode( true ).fireEvent(\"onclick\");\n\
\t\tdiv.detachEvent( \"onclick\", clickFn );\n\
\t}\n\
\n\
\t// Check if a radio maintains its value\n\
\t// after being appended to the DOM\n\
\tinput = document.createElement(\"input\");\n\
\tinput.value = \"t\";\n\
\tinput.setAttribute( \"type\", \"radio\" );\n\
\tsupport.radioValue = input.value === \"t\";\n\
\n\
\tinput.setAttribute( \"checked\", \"checked\" );\n\
\n\
\t// #11217 - WebKit loses check when the name is after the checked attribute\n\
\tinput.setAttribute( \"name\", \"t\" );\n\
\n\
\tdiv.appendChild( input );\n\
\tfragment = document.createDocumentFragment();\n\
\tfragment.appendChild( div.lastChild );\n\
\n\
\t// WebKit doesn't clone checked state correctly in fragments\n\
\tsupport.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;\n\
\n\
\t// Check if a disconnected checkbox will retain its checked\n\
\t// value of true after appended to the DOM (IE6/7)\n\
\tsupport.appendChecked = input.checked;\n\
\n\
\tfragment.removeChild( input );\n\
\tfragment.appendChild( div );\n\
\n\
\t// Technique from Juriy Zaytsev\n\
\t// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/\n\
\t// We only care about the case where non-standard event systems\n\
\t// are used, namely in IE. Short-circuiting here helps us to\n\
\t// avoid an eval call (in setAttribute) which can cause CSP\n\
\t// to go haywire. See: https://developer.mozilla.org/en/Security/CSP\n\
\tif ( !div.addEventListener ) {\n\
\t\tfor ( i in {\n\
\t\t\tsubmit: true,\n\
\t\t\tchange: true,\n\
\t\t\tfocusin: true\n\
\t\t}) {\n\
\t\t\teventName = \"on\" + i;\n\
\t\t\tisSupported = ( eventName in div );\n\
\t\t\tif ( !isSupported ) {\n\
\t\t\t\tdiv.setAttribute( eventName, \"return;\" );\n\
\t\t\t\tisSupported = ( typeof div[ eventName ] === \"function\" );\n\
\t\t\t}\n\
\t\t\tsupport[ i + \"Bubbles\" ] = isSupported;\n\
\t\t}\n\
\t}\n\
\n\
\t// Run tests that need a body at doc ready\n\
\tdomready(function() {\n\
\t\tvar container, div, tds, marginDiv,\n\
\t\t\tdivReset = \"padding:0;margin:0;border:0;display:block;overflow:hidden;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;\",\n\
\t\t\tbody = document.getElementsByTagName(\"body\")[0];\n\
\n\
\t\tif ( !body ) {\n\
\t\t\t// Return for frameset docs that don't have a body\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tcontainer = document.createElement(\"div\");\n\
\t\tcontainer.style.cssText = \"visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px\";\n\
\t\tbody.insertBefore( container, body.firstChild );\n\
\n\
\t\t// Construct the test element\n\
\t\tdiv = document.createElement(\"div\");\n\
\t\tcontainer.appendChild( div );\n\
\n\
    //Check if table cells still have offsetWidth/Height when they are set\n\
    //to display:none and there are still other visible table cells in a\n\
    //table row; if so, offsetWidth/Height are not reliable for use when\n\
    //determining if an element has been hidden directly using\n\
    //display:none (it is still safe to use offsets if a parent element is\n\
    //hidden; don safety goggles and see bug #4512 for more information).\n\
    //(only IE 8 fails this test)\n\
\t\tdiv.innerHTML = \"<table><tr><td></td><td>t</td></tr></table>\";\n\
\t\ttds = div.getElementsByTagName(\"td\");\n\
\t\ttds[ 0 ].style.cssText = \"padding:0;margin:0;border:0;display:none\";\n\
\t\tisSupported = ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\ttds[ 0 ].style.display = \"\";\n\
\t\ttds[ 1 ].style.display = \"none\";\n\
\n\
\t\t// Check if empty table cells still have offsetWidth/Height\n\
\t\t// (IE <= 8 fail this test)\n\
\t\tsupport.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\t// Check box-sizing and margin behavior\n\
\t\tdiv.innerHTML = \"\";\n\
\t\tdiv.style.cssText = \"box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;\";\n\
\t\tsupport.boxSizing = ( div.offsetWidth === 4 );\n\
\t\tsupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );\n\
\n\
\t\t// NOTE: To any future maintainer, we've window.getComputedStyle\n\
\t\t// because jsdom on node.js will break without it.\n\
\t\tif ( window.getComputedStyle ) {\n\
\t\t\tsupport.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== \"1%\";\n\
\t\t\tsupport.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: \"4px\" } ).width === \"4px\";\n\
\n\
\t\t\t// Check if div with explicit width and no margin-right incorrectly\n\
\t\t\t// gets computed margin-right based on width of container. For more\n\
\t\t\t// info see bug #3333\n\
\t\t\t// Fails in WebKit before Feb 2011 nightlies\n\
\t\t\t// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
\t\t\tmarginDiv = document.createElement(\"div\");\n\
\t\t\tmarginDiv.style.cssText = div.style.cssText = divReset;\n\
\t\t\tmarginDiv.style.marginRight = marginDiv.style.width = \"0\";\n\
\t\t\tdiv.style.width = \"1px\";\n\
\t\t\tdiv.appendChild( marginDiv );\n\
\t\t\tsupport.reliableMarginRight =\n\
\t\t\t\t!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );\n\
\t\t}\n\
\n\
\t\tif ( typeof div.style.zoom !== \"undefined\" ) {\n\
\t\t\t// Check if natively block-level elements act like inline-block\n\
\t\t\t// elements when setting their display to 'inline' and giving\n\
\t\t\t// them layout\n\
\t\t\t// (IE < 8 does this)\n\
\t\t\tdiv.innerHTML = \"\";\n\
\t\t\tdiv.style.cssText = divReset + \"width:1px;padding:1px;display:inline;zoom:1\";\n\
\t\t\tsupport.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );\n\
\n\
\t\t\t// Check if elements with layout shrink-wrap their children\n\
\t\t\t// (IE 6 does this)\n\
\t\t\tdiv.style.display = \"block\";\n\
\t\t\tdiv.style.overflow = \"visible\";\n\
\t\t\tdiv.innerHTML = \"<div></div>\";\n\
\t\t\tdiv.firstChild.style.width = \"5px\";\n\
\t\t\tsupport.shrinkWrapBlocks = ( div.offsetWidth !== 3 );\n\
\n\
\t\t\tcontainer.style.zoom = 1;\n\
\t\t}\n\
\n\
\t\t// Null elements to avoid leaks in IE\n\
\t\tbody.removeChild( container );\n\
\t\tcontainer = div = tds = marginDiv = null;\n\
\t});\n\
\n\
\t// Null elements to avoid leaks in IE\n\
\tfragment.removeChild( div );\n\
\tall = a = select = opt = input = fragment = div = null;\n\
\n\
\treturn support;\n\
})();\n\
\n\
//# sourceURL=components/detects/dom-support/master/index.js"
));

require.modules["detects-dom-support"] = require.modules["detects~dom-support@master"];
require.modules["detects~dom-support"] = require.modules["detects~dom-support@master"];
require.modules["dom-support"] = require.modules["detects~dom-support@master"];


require.register("component~within-element@0.1.0", Function("exports, module",
"\n\
/**\n\
 * Check if the DOM element `child` is within the given `parent` DOM element.\n\
 *\n\
 * @param {DOMElement|Range} child - the DOM element or Range to check if it's within `parent`\n\
 * @param {DOMElement} parent  - the parent node that `child` could be inside of\n\
 * @return {Boolean} True if `child` is within `parent`. False otherwise.\n\
 * @public\n\
 */\n\
\n\
module.exports = function within (child, parent) {\n\
  // don't throw if `child` is null\n\
  if (!child) return false;\n\
\n\
  // Range support\n\
  if (child.commonAncestorContainer) child = child.commonAncestorContainer;\n\
  else if (child.endContainer) child = child.endContainer;\n\
\n\
  // traverse up the `parentNode` properties until `parent` is found\n\
  var node = child;\n\
  while (node = node.parentNode) {\n\
    if (node == parent) return true;\n\
  }\n\
\n\
  return false;\n\
};\n\
\n\
//# sourceURL=components/component/within-element/0.1.0/index.js"
));

require.modules["component-within-element"] = require.modules["component~within-element@0.1.0"];
require.modules["component~within-element"] = require.modules["component~within-element@0.1.0"];
require.modules["within-element"] = require.modules["component~within-element@0.1.0"];


require.register("timoxley~offset@1.0.2", Function("exports, module",
"var support = require('detects~dom-support@master')\n\
var getDocument = require('component~get-document@0.1.0')\n\
var withinElement = require('component~within-element@0.1.0')\n\
\n\
/**\n\
 * Get offset of a DOM Element or Range within the document.\n\
 *\n\
 * @param {DOMElement|Range} el - the DOM element or Range instance to measure\n\
 * @return {Object} An object with `top` and `left` Number values\n\
 * @public\n\
 */\n\
\n\
module.exports = function offset(el) {\n\
  var doc = getDocument(el)\n\
  if (!doc) return\n\
\n\
  // Make sure it's not a disconnected DOM node\n\
  if (!withinElement(el, doc)) return\n\
\n\
  var body = doc.body\n\
  if (body === el) {\n\
    return bodyOffset(el)\n\
  }\n\
\n\
  var box = { top: 0, left: 0 }\n\
  if ( typeof el.getBoundingClientRect !== \"undefined\" ) {\n\
    // If we don't have gBCR, just use 0,0 rather than error\n\
    // BlackBerry 5, iOS 3 (original iPhone)\n\
    box = el.getBoundingClientRect()\n\
  }\n\
\n\
  var docEl = doc.documentElement\n\
  var clientTop  = docEl.clientTop  || body.clientTop  || 0\n\
  var clientLeft = docEl.clientLeft || body.clientLeft || 0\n\
  var scrollTop  = window.pageYOffset || docEl.scrollTop\n\
  var scrollLeft = window.pageXOffset || docEl.scrollLeft\n\
\n\
  return {\n\
    top: box.top  + scrollTop  - clientTop,\n\
    left: box.left + scrollLeft - clientLeft\n\
  }\n\
}\n\
\n\
function bodyOffset(body) {\n\
  var top = body.offsetTop\n\
  var left = body.offsetLeft\n\
\n\
  if (support.doesNotIncludeMarginInBodyOffset) {\n\
    top  += parseFloat(body.style.marginTop || 0)\n\
    left += parseFloat(body.style.marginLeft || 0)\n\
  }\n\
\n\
  return {\n\
    top: top,\n\
    left: left\n\
  }\n\
}\n\
\n\
//# sourceURL=components/timoxley/offset/1.0.2/index.js"
));

require.modules["timoxley-offset"] = require.modules["timoxley~offset@1.0.2"];
require.modules["timoxley~offset"] = require.modules["timoxley~offset@1.0.2"];
require.modules["offset"] = require.modules["timoxley~offset@1.0.2"];


require.register("component~tip@2.1.2", Function("exports, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var bind = require('component~bind@1.0.0');\n\
var Emitter = require('component~emitter@1.1.3');\n\
var events = require('component~events@1.0.9');\n\
var query = require('component~query@0.0.3');\n\
var domify = require('component~domify@1.3.0');\n\
var classes = require('component~classes@1.2.1');\n\
var css = require('component~css@0.0.6');\n\
var html = domify(require('component~tip@2.1.2/template.html'));\n\
var offset = require('timoxley~offset@1.0.2');\n\
\n\
/**\n\
 * Expose `Tip`.\n\
 */\n\
\n\
module.exports = Tip;\n\
\n\
/**\n\
 * Apply the average use-case of simply\n\
 * showing a tool-tip on `el` hover.\n\
 *\n\
 * Options:\n\
 *\n\
 *  - `delay` hide delay in milliseconds [0]\n\
 *  - `value` defaulting to the element's title attribute\n\
 *\n\
 * @param {Mixed} elem\n\
 * @param {Object|String} options or value\n\
 * @api public\n\
 */\n\
\n\
function tip(elem, options) {\n\
  if ('string' == typeof options) options = { value : options };\n\
  var els = ('string' == typeof elem) ? query.all(elem) : [elem];\n\
  for(var i = 0, el; el = els[i]; i++) {\n\
    var val = options.value || el.getAttribute('title');\n\
    var tip = new Tip(val, options);\n\
    el.setAttribute('title', '');\n\
    tip.cancelHideOnHover();\n\
    tip.attach(el);\n\
  }\n\
}\n\
\n\
/**\n\
 * Initialize a `Tip` with the given `content`.\n\
 *\n\
 * @param {Mixed} content\n\
 * @api public\n\
 */\n\
\n\
function Tip(content, options) {\n\
  options = options || {};\n\
  if (!(this instanceof Tip)) return tip(content, options);\n\
  Emitter.call(this);\n\
  this.classname = '';\n\
  this.delay = options.delay || 300;\n\
  this.el = html.cloneNode(true);\n\
  this.events = events(this.el, this);\n\
  this.classes = classes(this.el);\n\
  this.inner = query('.tip-inner', this.el);\n\
  this.message(content);\n\
  this.position('top');\n\
  if (Tip.effect) this.effect(Tip.effect);\n\
}\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(Tip.prototype);\n\
\n\
/**\n\
 * Set tip `content`.\n\
 *\n\
 * @param {String|jQuery|Element} content\n\
 * @return {Tip} self\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.message = function(content){\n\
  this.inner.innerHTML = content;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Attach to the given `el` with optional hide `delay`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Number} delay\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.attach = function(el){\n\
  var self = this;\n\
  this.target = el;\n\
  this.handleEvents = events(el, this);\n\
  this.handleEvents.bind('mouseover');\n\
  this.handleEvents.bind('mouseout');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * On mouse over\n\
 *\n\
 * @param {Event} e\n\
 * @return {Tip}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.onmouseover = function() {\n\
  this.show(this.target);\n\
  this.cancelHide();\n\
};\n\
\n\
/**\n\
 * On mouse out\n\
 *\n\
 * @param {Event} e\n\
 * @return {Tip}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.onmouseout = function() {\n\
  this.hide(this.delay);\n\
};\n\
\n\
/**\n\
 * Cancel hide on hover, hide with the given `delay`.\n\
 *\n\
 * @param {Number} delay\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.cancelHideOnHover = function(){\n\
  this.events.bind('mouseover', 'cancelHide');\n\
  this.events.bind('mouseout', 'hide');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the effect to `type`.\n\
 *\n\
 * @param {String} type\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.effect = function(type){\n\
  this._effect = type;\n\
  this.classes.add(type);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set position:\n\
 *\n\
 *  - `top`\n\
 *  - `top left`\n\
 *  - `top right`\n\
 *  - `bottom`\n\
 *  - `bottom left`\n\
 *  - `bottom right`\n\
 *  - `left`\n\
 *  - `right`\n\
 *\n\
 * @param {String} pos\n\
 * @param {Object} options\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.position = function(pos, options){\n\
  options = options || {};\n\
  this._position = pos;\n\
  this._auto = false != options.auto;\n\
  this.replaceClass(pos);\n\
  this.emit('reposition');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Show the tip attached to `el`.\n\
 *\n\
 * Emits \"show\" (el) event.\n\
 *\n\
 * @param {String|Element|Number} el or x\n\
 * @param {Number} [y]\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.show = function(el){\n\
  if ('string' == typeof el) el = query(el);\n\
\n\
  // show it\n\
  this.target = el;\n\
  document.body.appendChild(this.el);\n\
  this.classes.add('tip-' + this._position.replace(/\\s+/g, '-'));\n\
  this.classes.remove('tip-hide');\n\
\n\
  // x,y\n\
  if ('number' == typeof el) {\n\
    var x = arguments[0];\n\
    var y = arguments[1];\n\
    this.emit('show');\n\
    css(this.el, {\n\
      top: y,\n\
      left: x\n\
    });\n\
    return this;\n\
  }\n\
\n\
  // el\n\
  this.reposition();\n\
  this.emit('show', this.target);\n\
\n\
  if (!this.winEvents) {\n\
    this.winEvents = events(window, this);\n\
    this.winEvents.bind('resize', 'reposition');\n\
    this.winEvents.bind('scroll', 'reposition');\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Reposition the tip if necessary.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.reposition = function(){\n\
  var pos = this._position;\n\
  var off = this.offset(pos);\n\
  var newpos = this._auto && this.suggested(pos, off);\n\
  if (newpos) off = this.offset(pos = newpos);\n\
  this.replaceClass(pos);\n\
  this.emit('reposition');\n\
  css(this.el, off);\n\
};\n\
\n\
/**\n\
 * Compute the \"suggested\" position favouring `pos`.\n\
 * Returns undefined if no suggestion is made.\n\
 *\n\
 * @param {String} pos\n\
 * @param {Object} offset\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.suggested = function(pos, off){\n\
  var el = this.el;\n\
\n\
  var ew = el.clientWidth;\n\
  var eh = el.clientHeight;\n\
  var top = window.scrollY;\n\
  var left = window.scrollX;\n\
  var w = window.innerWidth;\n\
  var h = window.innerHeight;\n\
\n\
  // too low\n\
  if (off.top + eh > top + h) return 'top';\n\
\n\
  // too high\n\
  if (off.top < top) return 'bottom';\n\
\n\
  // too far to the right\n\
  if (off.left + ew > left + w) return 'left';\n\
\n\
  // too far to the left\n\
  if (off.left < left) return 'right';\n\
};\n\
\n\
/**\n\
 * Replace position class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.replaceClass = function(name){\n\
  name = name.split(' ').join('-');\n\
  var classname = this.classname + ' tip tip-' + name;\n\
  if (this._effect) classname += ' ' + this._effect;\n\
  this.el.setAttribute('class', classname);\n\
};\n\
\n\
/**\n\
 * Compute the offset for `.target`\n\
 * based on the given `pos`.\n\
 *\n\
 * @param {String} pos\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.offset = function(pos){\n\
  var pad = 15;\n\
\n\
  var tipDims = dimensions(this.el);\n\
  if (!tipDims) throw new Error('could not determine dimensions of Tip element');\n\
  var ew = tipDims.width;\n\
  var eh = tipDims.height;\n\
\n\
  var to = offset(this.target);\n\
  if (!to) throw new Error('could not determine page offset of `target`');\n\
\n\
  var dims = dimensions(this.target);\n\
  if (!dims) throw new Error('could not determine dimensions of `target`');\n\
  var tw = dims.width;\n\
  var th = dims.height;\n\
\n\
  switch (pos) {\n\
    case 'top':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - ew / 2\n\
      }\n\
    case 'bottom':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - ew / 2\n\
      }\n\
    case 'right':\n\
      return {\n\
        top: to.top + th / 2 - eh / 2,\n\
        left: to.left + tw\n\
      }\n\
    case 'left':\n\
      return {\n\
        top: to.top + th / 2 - eh / 2,\n\
        left: to.left - ew\n\
      }\n\
    case 'top left':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - ew + pad\n\
      }\n\
    case 'top right':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - pad\n\
      }\n\
    case 'bottom left':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - ew + pad\n\
      }\n\
    case 'bottom right':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - pad\n\
      }\n\
    default:\n\
      throw new Error('invalid position \"' + pos + '\"');\n\
  }\n\
};\n\
\n\
/**\n\
 * Cancel the `.hide()` timeout.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.cancelHide = function(){\n\
  clearTimeout(this._hide);\n\
};\n\
\n\
/**\n\
 * Hide the tip with optional `ms` delay.\n\
 *\n\
 * Emits \"hide\" event.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.hide = function(ms){\n\
  var self = this;\n\
\n\
  // duration\n\
  if (ms) {\n\
    this._hide = setTimeout(bind(this, this.hide), ms);\n\
    return this;\n\
  }\n\
\n\
  // hide\n\
  this.classes.add('tip-hide');\n\
  if (this._effect) {\n\
    setTimeout(bind(this, this.remove), 300);\n\
  } else {\n\
    self.remove();\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Hide the tip without potential animation.\n\
 *\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.remove = function(){\n\
  if (this.winEvents) {\n\
    this.winEvents.unbind();\n\
    this.winEvents = null;\n\
  }\n\
  this.emit('hide');\n\
\n\
  var parent = this.el.parentNode;\n\
  if (parent) parent.removeChild(this.el);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Returns an Object with `width` and `height` values which represent the\n\
 * dimensions of the given `node` which could be a DOM Element, Range, etc.\n\
 *\n\
 * TODO: extract this into a standalone module\n\
 *\n\
 * @private\n\
 */\n\
\n\
function dimensions(node) {\n\
  var dims;\n\
  var ow = node.offsetWidth;\n\
  var oh = node.offsetHeight;\n\
\n\
  // use `offsetWidth` and `offsetHeight` by default if available\n\
  if (ow != null && oh != null) {\n\
    dims = { width: ow, height: oh };\n\
  }\n\
\n\
  // fallback to `getBoundingClientRect()` if available\n\
  if ((!dims || (!dims.width && !dims.height)) &&\n\
      'function' == typeof node.getBoundingClientRect) {\n\
    dims = node.getBoundingClientRect();\n\
  }\n\
\n\
  return dims;\n\
}\n\
\n\
//# sourceURL=components/component/tip/2.1.2/index.js"
));

require.define("component~tip@2.1.2/template.html", "<div class=\"tip tip-hide\">\n  <div class=\"tip-arrow\"></div>\n  <div class=\"tip-inner\"></div>\n</div>");

require.modules["component-tip"] = require.modules["component~tip@2.1.2"];
require.modules["component~tip"] = require.modules["component~tip@2.1.2"];
require.modules["tip"] = require.modules["component~tip@2.1.2"];


require.register("omelette", Function("exports, module",
"/* Author:\n\
\n\
*/\n\
\n\
//# sourceURL=public/js/script.js"
));

require.modules["omelette"] = require.modules["omelette"];


require("omelette");
