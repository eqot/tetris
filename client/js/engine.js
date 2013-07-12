/* global Block, Tile, ShiftDirection */

'use strict';

var COLUMN_NUM = 10;
var MAX_BLOCK_RANGE = 4;
var WALL_RANGE = MAX_BLOCK_RANGE;
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

function Engine(onDeleteLines, onTileUpdated) {
	var rowNum = COLUMN_NUM << 1;
	this.rowNum = rowNum;
	this.existingTileCollisionFlag = new Array(rowNum + 1);
	this.existingTileCollisionFlag[rowNum] = FULL_LINE_FLAG; // last line
	this.existingTileList = new Array(rowNum);
	this.onDeleteLines = onDeleteLines;
	this.onTileUpdated = onTileUpdated;
}

Engine.prototype.initialize = function() {
	// initialize existing tile
	for (var i = 0; i < this.rowNum; i++) {
		this.existingTileCollisionFlag[i] = WALL_FLAG;
		this.existingTileList[i] = [];
	}

	this.currentBlock = null;
};

Engine.prototype.setBlockAreaSize = function(width, height) {
	this.tileSize = width / COLUMN_NUM;
	//this.rowNum = height / this.tileSize | 0;
	this.topMargin = height - this.tileSize * this.rowNum;
	console.log('tileSize = ' + this.tileSize + ', topMargin = ' + this.topMargin);

	for (var i = 0; i < this.rowNum; i++) {
		var existingTileLine = this.existingTileList[i];
		if (!existingTileLine) {
			continue;
		}
		for (var j = 0; j < existingTileLine.length; j++) {
			existingTileLine[j].setTileSize(this.tileSize);
		}
	}

	if (this.currentBlock) {
		this.currentBlock.setTileSize(this.tileSize);
	}
};

Engine.prototype.setNextBlockIndicatorSize = function(size) {
	$('#nextBlockIndicator').width(size);
	$('#nextBlockIndicator').height(size);
	this.nextBlockTileSize = size / MAX_BLOCK_RANGE;
	if (this.nextBlock) {
		this.nextBlock.setTileSize(this.nextBlockTileSize);
	}
};

Engine.prototype.createBlock = function(blockType) {
	if (this.nextBlock) {
		var currentBlock = new Block(this.nextBlock.blockType, this.tileSize, this.topMargin);
		currentBlock.setTransform(COLUMN_NUM - currentBlock.blockParam.range >> 1, 0, 0);
		$('#blockArea').append(currentBlock.$block);
		this.currentBlock = currentBlock;
		this.nextBlock.$block.remove();
		if (!this.collisionCheck(null)) {
			return false;
		}
	}

	var nextBlock = new Block(blockType, this.nextBlockTileSize, 0);
	$('#nextBlockIndicator').append(nextBlock.$block);
	this.nextBlock = nextBlock;
	return true;
};

Engine.prototype.moveBlock = function(blockEvent) {
	if (!this.currentBlock) {
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
	if (blockEvent !== null) {
		transformParam.move(blockEvent);
	}
	var blockParam = this.currentBlock.blockParam;
	var currentBlockCollisionFlag = blockParam.collisionFlagList[transformParam.rotation % blockParam.stateNum];
	//dumpCollisionFlag(currentBlockCollisionFlag, blockParam.range);
	var columnIndex = transformParam.x + WALL_RANGE;
	for (var i = 0; i < blockParam.range; i++) {
		var rowIndex = transformParam.y + i;
		var checkResult = (currentBlockCollisionFlag[i] << columnIndex) & this.existingTileCollisionFlag[rowIndex];
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

	var blockParam = currentBlock.blockParam;
	var stateNum = blockParam.stateNum;
	var rotationState = transformParam.rotation % stateNum;
	var currentBlockCollisionFlag = blockParam.collisionFlagList[rotationState];

	var fullLineIndexList = [];
	var columnIndex = transformParam.x + WALL_RANGE;
	for (var i = 0; i < blockParam.range; i++) {
		var rowIndex = transformParam.y + i;
		if (rowIndex >= this.rowNum) {
			break;
		}
		this.existingTileCollisionFlag[rowIndex] |= currentBlockCollisionFlag[i] << columnIndex;
		if (this.existingTileCollisionFlag[rowIndex] === FULL_LINE_FLAG) {
			fullLineIndexList.push(rowIndex);
		}
	}

	var tilePosList = blockParam.tilePosSet[rotationState];
	var tileColor = blockParam.color;
	for (var i = 0; i < currentBlock.tileList.length; i++) {
		var tilePosX = transformParam.x + tilePosList[i][0];
		var tilePosY = transformParam.y + tilePosList[i][1];

		var fixedTile = new Tile(tilePosX, tilePosY, tileColor, this.tileSize, this.topMargin);
		$('#blockArea').append(fixedTile.$tile);
		this.existingTileList[tilePosY].push(fixedTile);
	}
	currentBlock.removeDom();

	if (fullLineIndexList.length > 0) {
		this.deleteLines(fullLineIndexList);
	}
	this.onTileUpdated(this.existingTileCollisionFlag);
	this.currentBlock = null;
};

Engine.prototype.deleteLines = function(indexList) {
	var deleteLineNum = indexList.length;
	for (var i = deleteLineNum - 1; i >= 0; i--) { // begin with large index
		var deleteLineIndex = indexList[i];
		console.log('deleteLine: index = ' + deleteLineIndex);

		// remove tiles
		var removeTileLine = this.existingTileList[deleteLineIndex];
		for (var j = 0; j < removeTileLine.length; j++) {
			removeTileLine[j].removeDom();
		}

		// shift down existing tiles
		for (var j = deleteLineIndex - 1; j >= 0; j--) {
			var existingTileLine = this.existingTileList[j];
			for (var k = 0; k < existingTileLine.length; k++) {
				//existingTileLine[k].shift(ShiftDirection.DOWN, 1);
				existingTileLine[k].shiftDelayed(ShiftDirection.DOWN, 1, 700);
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

	this.onDeleteLines(deleteLineNum);
};

Engine.prototype.insertLines = function(insertLineNum, emptyColumnIndex) {
	// shift up existing tiles
	for (var i = 0; i < this.rowNum; i++) {
		var existingTileLine = this.existingTileList[i];
		for (var j = 0; j < existingTileLine.length; j++) {
			existingTileLine[j].shift(ShiftDirection.UP, insertLineNum);
		}
	}

	// check if block reaches the top of area
	var isAlive = true;
	for (var i = 0; i < insertLineNum; i++) {
		if (this.existingTileCollisionFlag[i] !== WALL_FLAG) {
			isAlive = false;
			break;
		}
	}

	// update existing tile status
	this.existingTileCollisionFlag.splice(0, insertLineNum);
	this.existingTileList.splice(0, insertLineNum);
	
	// insert lines
	for (var y = this.rowNum - insertLineNum; y < this.rowNum; y++) {
		var collisionFlag = WALL_FLAG;
		var insertTileLine = [];
		for (var x = 0; x < COLUMN_NUM; x++) {
			if (x === emptyColumnIndex) {
				continue;
			}
			var tile = new Tile(x, y, 'darkgray', this.tileSize, this.topMargin);
			$('#blockArea').append(tile.$tile);
			collisionFlag |=LEFT_EDGE_FLAG << x;
			insertTileLine.push(tile);
		}
		this.existingTileCollisionFlag.splice(y, 0, collisionFlag);
		this.existingTileList.push(insertTileLine);
	}

	this.onTileUpdated(this.existingTileCollisionFlag.slice(0, this.rowNum));
	return isAlive;
};
