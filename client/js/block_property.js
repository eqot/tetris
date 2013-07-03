
function BlockProperty(placement, color, range) {
	this.placement = placement;
	this.color = color;
	this.range = range;
	this.stateNum = ROTATION_MATRIX_ARRAY.length;
	this.collisionFlag = this.generateCollisionFlag();

	console.log('block color = ' + color + ', range = ' + range);
	//this.dumpCollisionFlag();
}

// | cos(theta) -sin(theta) |
// | sin(theta) cos(theta)  |
// theta = 0, 90, 180, 270 (deg)
var ROTATION_MATRIX_ARRAY = [[[1, 0], [0, 1]], [[0, -1], [1, 0]], [[-1, 0], [0, -1]], [[0, 1], [-1, 0]]];

BlockProperty.prototype.generateCollisionFlag = function() {
	var range = this.range;
	var placement = this.placement;
	var squareNum = placement.length;
	var rotationStateNum = this.stateNum;
	var transformedVectorArray = new Array(squareNum);

	for (var i = 0; i < squareNum; i++) {
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
		for (var j = 0; j < squareNum; j++) {
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
	return collisionFlagArray;
}

BlockProperty.prototype.dumpCollisionFlag = function() {
	for (var i = 0; i < ROTATION_MATRIX_ARRAY.length; i++) {
		var collisionFlag = this.collisionFlag[i];
		console.log('rotate: ' + (i * 90));
		for (var y = 0; y < this.range; y++) {
			var flag = collisionFlag[y];
			var displayStr = '';
			for (var x = 0; x < this.range; x++) {
				if ((flag & 0x01 << x) == 0) {
					displayStr += '□'
				} else {
					displayStr += '■'
				}
			}
			console.log(displayStr);
		}
	}
}

var BLOCK_PROPERTY_I = new BlockProperty([[0, 1], [1, 1], [2, 1], [3, 1]], 'cyan', 4);
var BLOCK_PROPERTY_O = new BlockProperty([[0, 0], [1, 0], [0, 1], [1, 1]], 'yellow', 2);
var BLOCK_PROPERTY_T = new BlockProperty([[1, 0], [0, 1], [1, 1], [2, 1]], 'purple', 3);
var BLOCK_PROPERTY_J = new BlockProperty([[0, 0], [0, 1], [1, 1], [2, 1]], 'blue', 3);
var BLOCK_PROPERTY_L = new BlockProperty([[2, 0], [0, 1], [1, 1], [2, 1]], 'orange', 3);
var BLOCK_PROPERTY_S = new BlockProperty([[1, 0], [2, 0], [0, 1], [1, 1]], 'green', 3);
var BLOCK_PROPERTY_Z = new BlockProperty([[0, 0], [1, 0], [1, 1], [2, 1]], 'red', 3);

var BLOCK_PROPERTY_ARRAY = [BLOCK_PROPERTY_I, BLOCK_PROPERTY_O, BLOCK_PROPERTY_T, BLOCK_PROPERTY_J, BLOCK_PROPERTY_L, BLOCK_PROPERTY_S, BLOCK_PROPERTY_Z];

