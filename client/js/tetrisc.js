var socket = io.connect();

socket.on('welcome', function (data) {
  console.log("acceptable: " + data.acceptable);
});

socket.on('start', function(data) {
  console.log("start");
});

socket.on('end', function(data) {
  console.log("end message: " + data.message);
});

socket.on('block', function (data) {
  createBlock(data.block_type);
});

socket.on('disturbBlock', function(data) {
  console.log("row_num: " + data.row_num + ", empty_column: " + data.empty_column);
});

function requestBlock() {
  socket.emit("requestBlock", {});
}

function sendEraceBlockRowNum(rowNum) {
  socket.emit("erasedBlock", {row_num: rowNum}); 
}

