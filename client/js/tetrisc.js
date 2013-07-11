'use strict';

function NetworkClient(onWelcome, onStart, onWinGame, onReceiveBlock, onReceiveEnemyStatus,
					   onReceiveDisturbBlock) {
	var socket = io.connect();
	socket.on('welcome', onWelcome);
	socket.on('start', onStart);
	socket.on('end', onWinGame);
	socket.on('block', onReceiveBlock);
	socket.on('opponentBlockStatus', onReceiveEnemyStatus);
	socket.on('disturbBlock', onReceiveDisturbBlock);
	this.socket = socket;
}

NetworkClient.prototype.disconnect = function() {
	this.socket.disconnect();
};

NetworkClient.prototype.requestBlock = function() {
	this.socket.emit('requestBlock', {});
};

NetworkClient.prototype.sendStatus = function(tileStatus) {
	this.socket.emit('blockStatus', {block_status: tileStatus}); 
};

NetworkClient.prototype.sendEraceBlockRowNum = function(rowNum) {
	this.socket.emit('erasedBlock', {row_num: rowNum}); 
};
