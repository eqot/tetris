/* global COLUMN_NUM, LEFT_EDGE_FLAG */

'use strict';

var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 200;
var ENEMY_TILE_SIZE = CANVAS_WIDTH / COLUMN_NUM;

function EnemyStatus () {
	this.canvas = $('#enemyStatus');

	this.width = CANVAS_WIDTH;
	this.height = CANVAS_HEIGHT;

	this.canvas.attr('width', this.width);
	this.canvas.attr('height', this.height);

	this.context = this.canvas[0].getContext('2d');
}

// Clear canvas
EnemyStatus.prototype.clear = function () {
	this.context.strokeStyle = 'white';
	this.context.fillStyle = 'black';

	this.context.fillRect(0, 0, this.width, this.height);
	this.context.strokeRect(0, 0, this.width, this.height);
};

// Render blocks in canvas
EnemyStatus.prototype.render = function (tileCollisionFlag) {
	this.clear();
	this.context.fillStyle = 'white';

	for (var y = 0; y < tileCollisionFlag.length; y++) {
		var lineCollisionFlag = tileCollisionFlag[y];
		for (var x = 0; x < COLUMN_NUM; x++) {
			if ((LEFT_EDGE_FLAG << x) & lineCollisionFlag) {
				this.context.fillRect(ENEMY_TILE_SIZE * x, ENEMY_TILE_SIZE * y, ENEMY_TILE_SIZE, ENEMY_TILE_SIZE);
			}
		}
	}
};
