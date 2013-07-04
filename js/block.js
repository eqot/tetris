
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
		var tile = new Tile();
		tile.createDom(this.tileSize, blockParam.placement[i][0], blockParam.placement[i][1], blockParam.color);
		$block.append(tile.$tile);
		this.tileList[i] = tile;
	}

	$('#blockArea').append($block);
	this.$block = $block;
}

Block.prototype.move = function(blockEvent) {
	var transformParam = this.transformParam;
	transformParam.move(blockEvent);
	console.log('block update: x = ' + transformParam.x + ', y = ' + transformParam.y
				+ ', rotate = ' + transformParam.rotation);
	this.updateTransformOrigin();
	this.updateTransform();
}

Block.prototype.updateTransform = function() {
	this.$block.css('-webkit-transform', 'rotate(' + this.transformParam.rotation * ROTATION_DEGREE
					+ 'deg) translate(' + this.transformParam.x * this.tileSize + 'px, '
					+ (this.transformParam.y * this.tileSize + this.topMargin) + 'px)');
}

Block.prototype.updateTransformOrigin = function() {
	this.$block.css('-webkit-transform-origin', (this.transformParam.x + this.rotationCenterOffset) * this.tileSize
					+ 'px ' + ((this.transformParam.y + this.rotationCenterOffset) * this.tileSize + this.topMargin) + 'px');
}

function Tile() {
	// used for shift block
	this.x = 0;
	this.y = 0;
}

Tile.prototype.createDom = function(tileSize, x, y, color) {
	var $tile = $('<div/>').addClass('tile');
	$tile.css('width', tileSize);
	$tile.css('height', tileSize);
	$tile.css('left', x * tileSize);
	$tile.css('top', y * tileSize);
	$tile.css('background-color', color);
	$tile.css('-webkit-transition', ANIMATION_DURATION);
	this.$tile = $tile;
}

Tile.prototype.removeDom = function() {
	this.$tile.remove();
}

Tile.prototype.setShiftDownOffset = function(rotationState) {
	var rotationMatrixNum = ROTATION_MATRIX_LIST.length;
	// inverse because coodinate rotation
	var inverseRotationState = (rotationMatrixNum - rotationState) % rotationMatrixNum;
	var coodinateRotationMatrix = ROTATION_MATRIX_LIST[inverseRotationState];
	// (0 1) * rotationMatrix
	this.shiftDownX = coodinateRotationMatrix[0][1];
	this.shiftDownY = coodinateRotationMatrix[1][1];
}

Tile.prototype.shiftDown = function(tileSize) {
	this.x += this.shiftDownX;
	this.y += this.shiftDownY;
	this.$tile.css('-webkit-transform', 'translate(' + this.x * tileSize + 'px, '
				   + this.y * tileSize + 'px)');
}

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
}

TransformParam.prototype.copy = function(blockEvent) {
	return new TransformParam(this.x, this.y, this.rotation);
}

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
}

function dumpCollisionFlag(collisionFlag, range) {
	for (var y = 0; y < range; y++) {
		var flag = collisionFlag[y];
		var displayStr = '';
		for (var x = 0; x < range; x++) {
			if ((flag & 0x01 << x) == 0) {
				displayStr += '□'
			} else {
				displayStr += '■'
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
