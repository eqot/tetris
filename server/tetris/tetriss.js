
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var io = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = io.listen(server);

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var MAX_BLOCK_NUM = 1000;
var MAX_USER_NUM = 2;
var BLOCK_VARIETY = 7;
var WIDTH = 10;

var userCount = 0;
var sessionIds = new Array(MAX_USER_NUM);
var blocks = new Array(MAX_BLOCK_NUM);

io.sockets.on('connection', function(socket) {
  console.log("connection socketId; " + socket.id);
  if (userCount >= MAX_USER_NUM) {
    socket.emit('welcome', { acceptable: false });
    return ;
  }
  var userId = userCount++;
  console.log("connection userId: " + userId);
  sessionIds[userId] = socket.id;
  console.log("connection userCount: " + userCount);
  var current = 0;
  socket.emit('welcome', { acceptable: true });
  if (userCount == MAX_USER_NUM) {
    for (var i = 0; i < blocks.length; i++) {
      blocks[i] = Math.floor(Math.random() * BLOCK_VARIETY);
    }
    io.sockets.emit('start', { });
  }

  socket.on('requestBlock', function(data) {
    if (userCount == 2) {
      console.log("requestBlock current: " + current);
      socket.emit('block', { block_type: blocks[current++] });
    }
  });

  socket.on('erasedBlock', function(data) {
    console.log("erasedBlock row_num: " + data.row_num);
    var emptyColumn = Math.floor(Math.random() * WIDTH);
    var opponentSessionId = sessionIds[~userId];
    io.sockets.socket(opponentSessionId).emit('disturbBlock', { row_num: data.row_num, empty_column: emptyColumn });
  });

  socket.on('disconnect', function() {
    console.log("disconnect userId: " + userId);
    sessionIds[userId] = null;
    var opponentUserId = userId ^ 1;
    console.log("disconnect opponentUserId: " + opponentUserId);
    userCount = 0;
    var opponentSessionId = sessionIds[opponentUserId];
    console.log("disconnect opponentSessionId: " + opponentSessionId);
    if (opponentSessionId != null) {
      io.sockets.socket(opponentSessionId).emit('end', { message: "You Win" });
      io.sockets.socket(opponentSessionId).disconnect();
    }
  });
});

