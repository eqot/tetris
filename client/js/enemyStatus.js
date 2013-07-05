'use strict';

function EnemyStatus () {
	this.canvas = $('#enemyStatus');

	this.width = 100;
	this.height = 200;

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
EnemyStatus.prototype.render = function () {
	this.clear();

	// Render dummy block
	this.context.fillStyle = 'white';
	this.context.fillRect(20, 20, 25, 25);
};
