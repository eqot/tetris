/*global io */

'use strict';

function NetworkClient(onConnected, onStart, onWinGame, onReceiveBlock, onReceiveEnemyStatus,
					   onReceiveDisturbBlock) {
	if (typeof io === 'undefined') {
		this.onReceiveBlock = onReceiveBlock;

		setTimeout(onStart, 1000);

		return;
	}

	var socket = io.connect();
	socket.on('connected', onConnected);
	socket.on('start', onStart);
	socket.on('end', onWinGame);
	socket.on('block', onReceiveBlock);
	socket.on('opponentBlockStatus', onReceiveEnemyStatus);
	socket.on('disturbBlock', onReceiveDisturbBlock);
	this.socket = socket;
}

NetworkClient.prototype.init = function(name) {
	if (this.socket) {
		this.socket.emit('init', {name: name});
	}
};

NetworkClient.prototype.disconnect = function() {
	if (this.socket) {
		this.socket.disconnect();
	}
};

NetworkClient.prototype.requestBlock = function() {
	if (this.socket) {
		this.socket.emit('requestBlock', {});
	} else {
		this.onReceiveBlock({
			block_type: Math.floor(Math.random() * BLOCK_PARAM_LIST.length)
		});
	}
};

NetworkClient.prototype.sendStatus = function(tileStatus) {
	if (this.socket) {
		this.socket.emit('blockStatus', {block_status: tileStatus});
	}
};

NetworkClient.prototype.sendEraceBlockRowNum = function(rowNum) {
	if (this.socket) {
		this.socket.emit('erasedBlock', {row_num: rowNum});
	}
};
