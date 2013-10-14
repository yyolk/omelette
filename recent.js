var mdw = require('markdown-walker');
var path = require('path');

var walker = mdw('works/', {lastModified: new Date((new Date).getFullYear(), (new Date).getMonth()-2)});
files = [];
walker.on('modified', function(file, stat) {
  // files.push(''+file);
  console.log(path.basename(file, '.markdown'));
});