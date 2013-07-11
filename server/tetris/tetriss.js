
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
app.set('port', process.env.PORT || 80);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '../../client')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', express.static(path.join(__dirname, '../../client/index.html')));  

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  process.setuid(80);
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
    console.log("requestBlock userId: " + userId + " current: " + current);
    if (userCount == MAX_USER_NUM) {
      socket.emit('block', { block_type: blocks[current++] });
    }
  });

  socket.on('blockStatus', function(data) {
    console.log("blockStaus userId: " + userId);
    if (userCount == MAX_USER_NUM) {
      var opponentSessionId = sessionIds[userId ^ 1];
      io.sockets.socket(opponentSessionId).emit('opponentBlockStatus', { block_status: data.block_status });
    }
  });

  socket.on('erasedBlock', function(data) {
    console.log("erasedBlock userId: " + userId + " row_num: " + data.row_num);
    if (userCount == MAX_USER_NUM) {
      var emptyColumn = Math.floor(Math.random() * WIDTH);
      var opponentSessionId = sessionIds[userId ^ 1];
      io.sockets.socket(opponentSessionId).emit('disturbBlock', { row_num: data.row_num, empty_column: emptyColumn });
    }
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

