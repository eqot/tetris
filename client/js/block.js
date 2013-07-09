/* global Tile, TransformParam, BlockEvent */

'use strict';

var ROTATION_DEGREE = 90;
var ANIMATION_DURATION = '0.3s';

// | cos(theta) -sin(theta) |
// | sin(theta) cos(theta)  |
// theta = 0, 90, 180, 270 (deg)
var ROTATION_MATRIX_LIST = [[[1, 0], [0, 1]], [[0, -1], [1, 0]], [[-1, 0], [0, -1]], [[0, 1], [-1, 0]]];

function Block(blockType, tileSize, topMargin, columnNum) {
	console.log('block create');

	var blockParam = BLOCK_PARAM_LIST[blockType];
	this.blockParam = blockParam;
	this.tileSize = tileSize;
	this.topMargin = topMargin;

	this.transformParam = new TransformParam(columnNum - blockParam.range >> 1, 0, 0);
	this.createDom(blockParam);
	this.rotationCenterOffset = blockParam.range / 2.0;

	this.updateTransform();
	this.updateTransformOrigin();
}

Block.prototype.createDom = function(blockParam) {
	var $block = $('<div/>').addClass('block');
	$block.css('-webkit-transition', ANIMATION_DURATION);

	var tileNum = blockParam.placement.length;
	this.tileList = new Array(tileNum);
	for (var i = 0; i < tileNum; i++) {
		var tile = new Tile(blockParam.placement[i][0], blockParam.placement[i][1], blockParam.color,
							this.tileSize, this.topMargin);
		$block.append(tile.$tile);
		this.tileList[i] = tile;
	}

	this.$block = $block;
};

Block.prototype.removeDom = function() {
	this.$block.remove();
};

Block.prototype.setTileSize = function(tileSize) {
	this.tileSize = tileSize;
	for (var i = 0; i < this.tileList.length; i++) {
		this.tileList[i].setTileSize(tileSize);
	}
	this.updateTransformOrigin();
	this.updateTransform();
};

Block.prototype.move = function(blockEvent) {
	var transformParam = this.transformParam;
	transformParam.move(blockEvent);
	console.log('block update: x = ' + transformParam.x + ', y = ' + transformParam.y
				+ ', rotate = ' + transformParam.rotation);
	this.updateTransformOrigin();
	this.updateTransform();
};

Block.prototype.updateTransform = function() {
	this.$block.css('-webkit-transform', 'rotate(' + this.transformParam.rotation * ROTATION_DEGREE
					+ 'deg) translate(' + this.transformParam.x * this.tileSize + 'px, '
					+ (this.transformParam.y * this.tileSize + this.topMargin) + 'px)');
};

Block.prototype.updateTransformOrigin = function() {
	this.$block.css('-webkit-transform-origin', (this.transformParam.x + this.rotationCenterOffset) * this.tileSize
					+ 'px ' + ((this.transformParam.y + this.rotationCenterOffset) * this.tileSize + this.topMargin) + 'px');
};

function Tile(x, y, color, tileSize, topMargin) {
	this.x = x;
	this.y = y;
	this.createDom(tileSize, color);
	this.tileSize = tileSize;
	this.topMargin = topMargin;
	this.setTileSize(tileSize);
}

Tile.prototype.createDom = function(tileSize, color) {
	var $tile = $('<div/>').addClass('tile');
	this.$tile = $tile;
	$tile.css('background-color', color);
	$tile.css('-webkit-transition', ANIMATION_DURATION);
};

Tile.prototype.removeDom = function() {
	this.$tile.remove();
};

Tile.prototype.setTileSize = function(tileSize) {
	this.tileSize = tileSize
	this.$tile.css('width', tileSize);
	this.$tile.css('height', tileSize);
	this.updateTransform();
}

var ShiftDirection = {
	UP: 0,
	DOWN: 1,
};

Tile.prototype.shift = function(direction, distance) {
	switch (direction) {
	case ShiftDirection.UP:
		this.y -= distance;
		break;
	case ShiftDirection.DOWN:
		this.y += distance;
		break;
	default:
		break;
	}
	this.updateTransform();
};

Tile.prototype.updateTransform = function() {
	this.$tile.css('-webkit-transform', 'translate(' + this.x * this.tileSize + 'px, '
				   + (this.y * this.tileSize + this.topMargin) + 'px)');
};

function TransformParam(x, y, rotation) {
	this.x = x;
	this.y = y;
	this.rotation = rotation;
}

TransformParam.prototype.move = function(blockEvent) {
	switch (blockEvent) {
	case BlockEvent.LEFT:
		this.x--;
		break;
	case BlockEvent.RIGHT:
		this.x++;
		break;
	case BlockEvent.DOWN:
		this.y++;
		break;
	case BlockEvent.ROTATE:
		this.rotation++;
		break;
	default:
		break;
	}
};

TransformParam.prototype.copy = function() {
	return new TransformParam(this.x, this.y, this.rotation);
};

function BlockParam(placement, color, range) {
	this.placement = placement;
	this.color = color;
	this.range = range;
	this.stateNum = ROTATION_MATRIX_LIST.length;

	console.log('block color = ' + color + ', range = ' + range);
	this.generateCollisionFlag();
}

BlockParam.prototype.generateCollisionFlag = function() {
	var range = this.range;
	var placement = this.placement;
	var tileNum = placement.length;
	var rotationStateNum = this.stateNum;
	var transformedVectorList = new Array(tileNum);

	for (var i = 0; i < tileNum; i++) {
		// transform coordinate to make rotation center as origin
		// (double to calculate as integer)
		var x = placement[i][0] * 2 + 1 - range;
		var y = placement[i][1] * 2 + 1 - range;
		transformedVectorList[i] = [x, y];
		//console.log('transformed pos: x = ' + x + ', y = ' + y);
	}

	var collisionFlagList = new Array(rotationStateNum);
	var tilePosSet = new Array(rotationStateNum);
	for (var i = 0; i < rotationStateNum; i++) {
		// initialize collisionFlag
		var collisionFlag = new Array(range);
		for (var j = 0; j < range; j++) {
			collisionFlag[j] = 0;
		}
		var tilePosList = new Array(tileNum);

		// multiply rotation matrix
		var matrix = ROTATION_MATRIX_LIST[i];
		for (var j = 0; j < tileNum; j++) {
			var transformedVector = transformedVectorList[j];
			var rotatedX = transformedVector[0] * matrix[0][0] + transformedVector[1] * matrix[0][1];
			var rotatedY = transformedVector[0] * matrix[1][0] + transformedVector[1] * matrix[1][1];
			// revert coordinate
			var x = (rotatedX + range - 1) / 2;
			var y = (rotatedY + range - 1) / 2;
			//console.log('rotate pos: x = ' + x + ', y = ' + y);
			collisionFlag[y] |= 0x01 << x;
			tilePosList[j] = [x, y];
		}
		collisionFlagList[i] = collisionFlag;
		tilePosSet[i] = tilePosList;
	}
	this.collisionFlagList = collisionFlagList;
	this.tilePosSet = tilePosSet;

	// for (var i = 0; i < ROTATION_MATRIX_LIST.length; i++) {
	// 	console.log('rotate: ' + (i * 90));
	// 	dumpCollisionFlag(collisionFlagList[i], range);
	// }
};

function dumpCollisionFlag(collisionFlag, range) {
	for (var y = 0; y < range; y++) {
		var flag = collisionFlag[y];
		var displayStr = '';
		for (var x = 0; x < range; x++) {
			if ((flag & 0x01 << x) === 0) {
				displayStr += '□';
			} else {
				displayStr += '■';
			}
		}
		console.log(displayStr);
	}
}

var BLOCK_PARAM_I = new BlockParam([[0, 1], [1, 1], [2, 1], [3, 1]], 'cyan', 4);
var BLOCK_PARAM_O = new BlockParam([[0, 0], [1, 0], [0, 1], [1, 1]], 'yellow', 2);
var BLOCK_PARAM_T = new BlockParam([[1, 0], [0, 1], [1, 1], [2, 1]], 'purple', 3);
var BLOCK_PARAM_J = new BlockParam([[0, 0], [0, 1], [1, 1], [2, 1]], 'blue', 3);
var BLOCK_PARAM_L = new BlockParam([[2, 0], [0, 1], [1, 1], [2, 1]], 'orange', 3);
var BLOCK_PARAM_S = new BlockParam([[1, 0], [2, 0], [0, 1], [1, 1]], 'green', 3);
var BLOCK_PARAM_Z = new BlockParam([[0, 0], [1, 0], [1, 1], [2, 1]], 'red', 3);

var BLOCK_PARAM_LIST = [BLOCK_PARAM_I, BLOCK_PARAM_O, BLOCK_PARAM_T, BLOCK_PARAM_J, BLOCK_PARAM_L, BLOCK_PARAM_S, BLOCK_PARAM_Z];
