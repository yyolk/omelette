/* deps */

var http = require('http')
  , port = parseInt(process.env.PANCAKE_IO_PORT, 10) || process.env.PORT || 3000
  , app = require('./app');

// process title
process.title = 'Y O L K';




var server = http.createServer(app);

// Listen.
//

server.listen(port, function() {
  port = server.address().port;
  console.log('pancake %j server listening on port %d', app.settings.env, port);
});
