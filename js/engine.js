/* global Block */

'use strict';

var COLUMN_NUM = 10;
var WALL_RANGE = 4; // max block range
var LEFT_WALL_FLAG = (0x01 << WALL_RANGE) - 1;
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
	this.existingBlockFlag = new Array(rowNum + 1);
	this.existingTileList = new Array(rowNum);
	for (var i = 0; i < rowNum; i++) {
		this.existingBlockFlag[i] = WALL_FLAG;
		this.existingTileList[i] = [];
	}
	this.existingBlockFlag[rowNum] = FULL_LINE_FLAG; // last line
}

Engine.prototype.createBlock = function(blockType) {
	this.currentBlock = new Block(blockType, this.tileSize, this.topMargin, COLUMN_NUM);
};

Engine.prototype.moveBlock = function(blockEvent) {
	if (this.currentBlock === undefined) {
		return;
	}

	if (this.collisionCheck(blockEvent)) {
		this.currentBlock.move(blockEvent);
	} else if (blockEvent === BlockEvent.DOWN) {
		var fullLineIndexList = this.fixBlock();
		var fullLineNum = fullLineIndexList.length;
		for (var i = 0; i < fullLineNum; i++) {
			this.deleteLine(fullLineIndexList[i]);
		}
		this.shiftBlock(fullLineIndexList);
	}
};

Engine.prototype.collisionCheck = function(blockEvent) {
	var transformParam = this.currentBlock.transformParam.copy();
	transformParam.move(blockEvent);
	var x = transformParam.x + WALL_RANGE;
	var y = transformParam.y;

	var blockParam = this.currentBlock.blockParam;
	var currentBlockFlag = blockParam.collisionFlagList[transformParam.rotation % blockParam.stateNum];
	//dumpCollisionFlag(currentBlockFlag, blockParam.range);

	for (var i = 0; i < blockParam.range; i++) {
		var checkResult = (currentBlockFlag[i] << x) & this.existingBlockFlag[y + i];
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
	var currentBlockFlag = blockParam.collisionFlagList[rotationState];

	var fullLineIndexList = [];
	for (var i = 0; i < blockParam.range; i++) {
		var lineIndex = y + i;
		if (lineIndex >= this.rowNum) {
			break;
		}
		this.existingBlockFlag[lineIndex] |= currentBlockFlag[i] << x;
		if (this.existingBlockFlag[lineIndex] === FULL_LINE_FLAG) {
			fullLineIndexList.push(lineIndex);
		}
	}

	var tilePosList = blockParam.tilePosSet[rotationState];
	for (var i = 0; i < currentBlock.tileList.length; i++) {
		var tile = currentBlock.tileList[i];
		tile.setShiftDownOffset(rotationState);
		var tilePosY = tilePosList[i][1];
		this.existingTileList[y + tilePosY].push(tile);
	}

	this.currentBlock = null;
	return fullLineIndexList;
};

Engine.prototype.deleteLine = function(lineIndex) {
	console.log('deleteLine: index = ' + lineIndex);
	var tileList = this.existingTileList[lineIndex];
	for (var i = 0; i < tileList.length; i++) {
		tileList[i].removeDom();
	}
};

Engine.prototype.shiftBlock = function(deleteLineIndexList) {
	var deleteLineNum = deleteLineIndexList.length;
	for (var i = deleteLineNum - 1; i >= 0; i--) { // begin with large index
		var deleteLineIndex = deleteLineIndexList[i];
		for (var j = 0; j < deleteLineIndex; j++) {
			var tileList = this.existingTileList[j];
			for (var k = 0; k < tileList.length; k++) {
				tileList[k].shiftDown(this.tileSize);
			}
		}
		this.existingBlockFlag.splice(deleteLineIndex, 1);
		this.existingTileList.splice(deleteLineIndex, 1);
	}

	for (var i = 0; i < deleteLineNum; i++) {
		this.existingBlockFlag.unshift(WALL_FLAG);
		this.existingTileList.unshift([]);
	}
};
