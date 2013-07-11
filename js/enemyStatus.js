/* global COLUMN_NUM, LEFT_EDGE_FLAG */

'use strict';

function EnemyStatus () {
	this.canvas = $('#enemyStatus');
	this.context = this.canvas[0].getContext('2d');
}

EnemyStatus.prototype.setCanvasSize = function (size) {
	this.width = size;
	this.height = size * 2;
	this.tileSize = this.width / COLUMN_NUM;

	this.canvas.attr('width', this.width);
	this.canvas.attr('height', this.height);
	this.clear();
};

// Clear canvas
EnemyStatus.prototype.clear = function () {
	this.context.strokeStyle = 'white';
	this.context.fillStyle = 'black';

	this.context.fillRect(0, 0, this.width, this.height);
	this.context.strokeRect(0, 0, this.width, this.height);
};

// Render blocks in canvas
EnemyStatus.prototype.render = function (tileStatus) {
	this.clear();

	this.context.fillStyle = 'white';
	var tileSize = this.tileSize;
	for (var y = 0; y < tileStatus.length; y++) {
		var lineStatus = tileStatus[y];
		for (var x = 0; x < COLUMN_NUM; x++) {
			if ((LEFT_EDGE_FLAG << x) & lineStatus) {
				this.context.fillRect(tileSize * x, tileSize * y, tileSize, tileSize);
			}
		}
	}
};
