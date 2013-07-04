
var ROTATION_DEGREE = 90;
var ANIMATION_DURATION = '0.3s';

function Block(blockType, tileSize, columnNum, topMargin) {
	console.log('block create');

	var param = BLOCK_PARAM_ARRAY[blockType];
	this.param = param;
	this.tileSize = tileSize;
	this.topMargin = topMargin;

	this.transform = new Transform(columnNum - param.range >> 1, 0, 0);
	this.createDom(param);
	this.rotationCenterOffset = param.range / 2.0;

	this.updateTransform();
	this.updateTransformOrigin();
}

Block.prototype.createDom = function(param) {
	this.$block = $('<div/>').addClass('block');
	this.$block.css('-webkit-transition', ANIMATION_DURATION);
	$('#blockArea').append(this.$block);
	for (var i = 0; i < param.placement.length; i++) {
		var $tile = $('<div/>').addClass('tile');
		$tile.css('width', this.tileSize);
		$tile.css('height', this.tileSize);
		$tile.css('left', param.placement[i][0] * this.tileSize);
		$tile.css('top', param.placement[i][1] * this.tileSize);
		$tile.css('background-color', param.color);
		this.$block.append($tile);
	}
}

Block.prototype.move = function(blockEvent) {
	var transform = this.transform;
	transform.move(blockEvent);
	console.log('block update: x = ' + transform.x + ', y = ' + transform.y
				+ ', rotate = ' + transform.rotation);
	this.updateTransformOrigin();
	this.updateTransform();
}

Block.prototype.updateTransform = function() {
	this.$block.css('-webkit-transform', 'rotate(' + this.transform.rotation * ROTATION_DEGREE
					+ 'deg) translate(' + this.transform.x * this.tileSize + 'px, '
					+ (this.transform.y * this.tileSize + this.topMargin) + 'px)');
					
}

Block.prototype.updateTransformOrigin = function() {
	this.$block.css('-webkit-transform-origin', (this.transform.x + this.rotationCenterOffset) * this.tileSize
					+ 'px ' + ((this.transform.y + this.rotationCenterOffset) * this.tileSize + this.topMargin) + 'px');
}

function Transform(x, y, rotation) {
	this.x = x;
	this.y = y;
	this.rotation = rotation;
}

Transform.prototype.move = function(blockEvent) {
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
		//this.rotation = (this.rotation + 1) % this.stateNum;
		this.rotation++;
		break;
	default:
		break;
	}
}

Transform.prototype.copy = function(blockEvent) {
	return new Transform(this.x, this.y, this.rotation);
}

function BlockParam(placement, color, range) {
	this.placement = placement;
	this.color = color;
	this.range = range;
	this.stateNum = ROTATION_MATRIX_ARRAY.length;

	console.log('block color = ' + color + ', range = ' + range);
	this.generateCollisionFlag();
}

// | cos(theta) -sin(theta) |
// | sin(theta) cos(theta)  |
// theta = 0, 90, 180, 270 (deg)
var ROTATION_MATRIX_ARRAY = [[[1, 0], [0, 1]], [[0, -1], [1, 0]], [[-1, 0], [0, -1]], [[0, 1], [-1, 0]]];

BlockParam.prototype.generateCollisionFlag = function() {
	var range = this.range;
	var placement = this.placement;
	var tileNum = placement.length;
	var rotationStateNum = this.stateNum;
	var transformedVectorArray = new Array(tileNum);

	for (var i = 0; i < tileNum; i++) {
		// transform coordinate to make rotation center as origin
		// (double to calculate as integer)
		var x = placement[i][0] * 2 + 1 - range;
		var y = placement[i][1] * 2 + 1 - range;
		transformedVectorArray[i] = [x, y];
		//console.log('transformed pos: x = ' + x + ', y = ' + y);
	}

	var collisionFlagArray = new Array(rotationStateNum);
	for (var i = 0; i < rotationStateNum; i++) {
		// initialize collisionFlag
		var collisionFlag = new Array(range);
		for (var j = 0; j < range; j++) {
			collisionFlag[j] = 0;
		}

		// multiply rotation matrix
		var matrix = ROTATION_MATRIX_ARRAY[i];
		for (var j = 0; j < tileNum; j++) {
			var transformedVector = transformedVectorArray[j];
			var rotatedX = transformedVector[0] * matrix[0][0] + transformedVector[1] * matrix[0][1];
			var rotatedY = transformedVector[0] * matrix[1][0] + transformedVector[1] * matrix[1][1];
			// revert coordinate
			var x = (rotatedX + range - 1) / 2;
			var y = (rotatedY + range - 1) / 2;
			//console.log('rotate pos: x = ' + x + ', y = ' + y);
			collisionFlag[y] |= 0x01 << x;
		}
		collisionFlagArray[i] = collisionFlag;
	}
	this.collisionFlagArray = collisionFlagArray;

	// for (var i = 0; i < ROTATION_MATRIX_ARRAY.length; i++) {
	// 	console.log('rotate: ' + (i * 90));
	// 	dumpCollisionFlag(collisionFlagArray[i], range);
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

var BLOCK_PARAM_ARRAY = [BLOCK_PARAM_I, BLOCK_PARAM_O, BLOCK_PARAM_T, BLOCK_PARAM_J, BLOCK_PARAM_L, BLOCK_PARAM_S, BLOCK_PARAM_Z];

