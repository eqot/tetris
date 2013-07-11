'use strict';

function NetworkClient(onWelcome, onStart, onWinGame, onReceiveBlock, onReceiveDisturbBlock) {
	var socket = io.connect();
	socket.on('welcome', onWelcome);
	socket.on('start', onStart);
	socket.on('end', onWinGame);
	socket.on('block', onReceiveBlock);
	socket.on('disturbBlock', onReceiveDisturbBlock);
	this.socket = socket;
}

NetworkClient.prototype.disconnect = function() {
	this.socket.disconnect();
};

NetworkClient.prototype.requestBlock = function() {
	this.socket.emit("requestBlock", {});
};

NetworkClient.prototype.sendEraceBlockRowNum = function(rowNum) {
	this.socket.emit("erasedBlock", {row_num: rowNum}); 
};
