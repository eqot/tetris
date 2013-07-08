/* global Block */

'use strict';

var COLUMN_NUM = 10;
var WALL_RANGE = 4; // max block range
var LEFT_EDGE_FLAG = 0x01 << WALL_RANGE;
var LEFT_WALL_FLAG = LEFT_EDGE_FLAG - 1;
var RIGHT_WALL_FLAG = LEFT_WALL_FLAG << WALL_RANGE + COLUMN_NUM;
var WALL_FLAG = LEFT_WALL_FLAG | RIGHT_WALL_FLAG; // 111100...001111
var FULL_LINE_FLAG = (0x01 << WALL_RANGE * 2 + COLUMN_NUM) - 1;

var BlockEvent = {
	LEFT: 0,
	RIGHT: 1,
	DOWN: 2,
	ROTATE: 3,
	ADD: 4,
	PAUSE: 5
};

function Engine() {
	this.tileSize = $('#blockArea').width() / COLUMN_NUM;
	var blockAreaHeight = $('#blockArea').height();
	var rowNum = blockAreaHeight / this.tileSize | 0;
	this.rowNum = rowNum;
	this.topMargin = blockAreaHeight - this.tileSize * rowNum;
	console.log('tileSize = ' + this.tileSize + ', rowNum = ' + rowNum
				+ ', topMargin = ' + this.topMargin);

	// initialize existing block flag
	this.existingTileCollisionFlag = new Array(rowNum + 1);
	this.existingTileList = new Array(rowNum);
	for (var i = 0; i < rowNum; i++) {
		this.existingTileCollisionFlag[i] = WALL_FLAG;
		this.existingTileList[i] = [];
	}
	this.existingTileCollisionFlag[rowNum] = FULL_LINE_FLAG; // last line
	this.currentBlock = null;

	this.insertLineVacantIndex = Math.floor( Math.random() * COLUMN_NUM);
}

Engine.prototype.createBlock = function(blockType) {
	this.currentBlock = new Block(blockType, this.tileSize, this.topMargin, COLUMN_NUM);
};

Engine.prototype.moveBlock = function(blockEvent) {
	if (this.currentBlock == null) {
		return;
	}

	if (this.collisionCheck(blockEvent)) {
		this.currentBlock.move(blockEvent);
	} else if (blockEvent === BlockEvent.DOWN) {
		this.fixBlock();
	}
};

Engine.prototype.collisionCheck = function(blockEvent) {
	var transformParam = this.currentBlock.transformParam.copy();
	transformParam.move(blockEvent);
	var x = transformParam.x + WALL_RANGE;
	var y = transformParam.y;

	var blockParam = this.currentBlock.blockParam;
	var currentBlockCollisionFlag = blockParam.collisionFlagList[transformParam.rotation % blockParam.stateNum];
	//dumpCollisionFlag(currentBlockCollisionFlag, blockParam.range);

	for (var i = 0; i < blockParam.range; i++) {
		var checkResult = (currentBlockCollisionFlag[i] << x) & this.existingTileCollisionFlag[y + i];
		if (checkResult !== 0) {
			return false;
		}
	}
	return true;
};

Engine.prototype.fixBlock = function() {
	console.log('fixBlock');
	var currentBlock = this.currentBlock;
	var transformParam = currentBlock.transformParam;
	var x = transformParam.x + WALL_RANGE;
	var y = transformParam.y;

	var blockParam = currentBlock.blockParam;
	var stateNum = blockParam.stateNum;
	var rotationState = transformParam.rotation % stateNum;
	var currentBlockCollisionFlag = blockParam.collisionFlagList[rotationState];

	var fullLineIndexList = [];
	for (var i = 0; i < blockParam.range; i++) {
		var lineIndex = y + i;
		if (lineIndex >= this.rowNum) {
			break;
		}
		this.existingTileCollisionFlag[lineIndex] |= currentBlockCollisionFlag[i] << x;
		if (this.existingTileCollisionFlag[lineIndex] === FULL_LINE_FLAG) {
			fullLineIndexList.push(lineIndex);
		}
	}

	var tilePosList = blockParam.tilePosSet[rotationState];
	for (var i = 0; i < currentBlock.tileList.length; i++) {
		var tile = currentBlock.tileList[i];
		tile.setRotationState(rotationState);
		var tilePosY = tilePosList[i][1];
		this.existingTileList[y + tilePosY].push(tile);
	}

	this.deleteLines(fullLineIndexList);
	this.currentBlock = null;
};

Engine.prototype.deleteLines = function(indexList) {
	var deleteLineNum = indexList.length;
	for (var i = deleteLineNum - 1; i >= 0; i--) { // begin with large index
		var deleteLineIndex = indexList[i];
		console.log('deleteLine: index = ' + deleteLineIndex);

		// remove tiles
		var tileList = this.existingTileList[deleteLineIndex];
		for (var j = 0; j < tileList.length; j++) {
			tileList[j].removeDom();
		}

		// shift down existing tiles
		for (var j = 0; j < deleteLineIndex; j++) {
			var tileList = this.existingTileList[j];
			for (var k = 0; k < tileList.length; k++) {
				tileList[k].shift(ShiftDirection.DOWN, this.tileSize);
			}
		}

		// update existing tile status
		this.existingTileCollisionFlag.splice(deleteLineIndex, 1);
		this.existingTileList.splice(deleteLineIndex, 1);
	}

	// add empty lines
	for (var i = 0; i < deleteLineNum; i++) {
		this.existingTileCollisionFlag.unshift(WALL_FLAG);
		this.existingTileList.unshift([]);
	}
};

Engine.prototype.insertLines = function(insertLineNum) {
	// shift up existing tiles
	for (var i = 0; i < this.rowNum; i++) {
		var tileList = this.existingTileList[i];
		for (var j = 0; j < tileList.length; j++) {
			tileList[j].shift(ShiftDirection.UP, this.tileSize);
		}
	}

	// check if block reaches the top of area
	for (var i = 0; i < insertLineNum; i++) {
		if (this.existingTileCollisionFlag[i] !== WALL_FLAG) {
			return;
		}
	}

	// update existing tile status
	this.existingTileCollisionFlag.splice(0, insertLineNum);
	this.existingTileList.splice(0, insertLineNum);
	
	// insert lines
	for (var y = this.rowNum - insertLineNum; y < this.rowNum; y++) {
		var collisionFlag = WALL_FLAG;
		var tileList = [];
		for (var x = 0; x < COLUMN_NUM; x++) {
			if (x === this.insertLineVacantIndex) {
				continue;
			}
			var tile = new Tile();
			tile.createDom(this.tileSize, x, y, 'DimGray');
			$('#blockArea').append(tile.$tile);
			tile.setRotationState(0);
			collisionFlag |=LEFT_EDGE_FLAG << x;
			tileList.push(tile);
		}
		this.existingTileCollisionFlag.splice(y, 0, collisionFlag);
		this.existingTileList.push(tileList);
	}
};
