
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var io = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = io.listen(server);

// all environments
app.set('port', process.env.PORT || 3001);

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
//  process.setuid(80);
});

var MAX_BLOCK_NUM = 1000;
var MAX_USER_NUM = 2;
var BLOCK_VARIETY = 7;
var WIDTH = 10;

var userCount = 0;

io.sockets.on('connection', function(socket) {
  console.log("connection sessionId; " + socket.id);
  socket.emit('connected');

  var blockIndex;
  var userId;
  var name;
  var roomNo;

  socket.on('init', function(data) {
    blockIndex = 0;

    userId = userCount++;
    console.log("init userId: " + userId);

    name = data.name;
    console.log("init name: " + name);

    roomNo = Math.floor(userId / 2);
    console.log("init roomNo: " + roomNo);

    socket.set('room', roomNo);
    socket.set('name', name);
    socket.join(roomNo);

    var sessionIds = io.sockets.manager.rooms['/' + roomNo];
    if (sessionIds && sessionIds.length === 2) {
      var blocks = new Array(MAX_BLOCK_NUM);
      for (var i = 0; i < blocks.length; i++) {
        blocks[i] = Math.floor(Math.random() * BLOCK_VARIETY);
      }

      for (var i = 0; i < sessionIds.length; i++) {
        io.sockets.socket(sessionIds[i]).set('blocks', blocks);
      }

      io.sockets.in(roomNo).emit('start');
    }
  });

  socket.on('requestBlock', function(data) {
    if (blockIndex < MAX_BLOCK_NUM) {
      var blocks;
      socket.get('blocks', function(err, _blocks) {
          blocks = _blocks;
      });
      if (blocks != null) {
        socket.emit('block', { block_type: blocks[blockIndex++] });
      }
    }
  });

  socket.on('blockStatus', function(data) {
    socket.broadcast.to(roomNo).emit('opponentBlockStatus', { block_status: data.block_status });
  });

  socket.on('erasedBlock', function(data) {
    var emptyColumn = Math.floor(Math.random() * WIDTH);
    socket.broadcast.to(roomNo).emit('disturbBlock', { row_num: data.row_num, empty_column: emptyColumn });
  });

  socket.on('disconnect', function() {
    socket.broadcast.to(roomNo).emit('end', { message: "You Win" });
    socket.leave(roomNo);

    var sessionIds = io.sockets.manager.rooms['/' + roomNo];
    if (sessionIds) {
      for (var i = 0; i < sessionIds.length; i++) {
        io.sockets.socket(sessionIds[i]).leave(roomNo);
      }
    }
  });
});
