/* global Block, Tile, ShiftDirection */

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

function Engine(tileUpdateListener) {
	var rowNum = COLUMN_NUM << 1;
	this.rowNum = rowNum;

	// initialize existing tile
	this.existingTileCollisionFlag = new Array(rowNum + 1);
	this.existingTileList = new Array(rowNum);
	for (var i = 0; i < rowNum; i++) {
		this.existingTileCollisionFlag[i] = WALL_FLAG;
		this.existingTileList[i] = [];
	}
	this.existingTileCollisionFlag[rowNum] = FULL_LINE_FLAG; // last line
	this.currentBlock = null;

	this.setBlockAreaSize($('#blockArea').width(), $('#blockArea').height());
	this.tileUpdateListener = tileUpdateListener;
	this.insertLineVacantIndex = Math.floor( Math.random() * COLUMN_NUM);
}

Engine.prototype.setBlockAreaSize = function(width, height) {
	this.tileSize = width / COLUMN_NUM;
	//this.rowNum = height / this.tileSize | 0;
	this.topMargin = height - this.tileSize * this.rowNum;
	console.log('tileSize = ' + this.tileSize + ', topMargin = ' + this.topMargin);

	for (var i = 0; i < this.rowNum; i++) {
		var existingTileLine = this.existingTileList[i];
		for (var j = 0; j < existingTileLine.length; j++) {
			existingTileLine[j].setTileSize(this.tileSize);
		}
	}

	if (this.currentBlock !== null) {
		this.currentBlock.setTileSize(this.tileSize);
	}
};

Engine.prototype.createBlock = function(blockType) {
	this.currentBlock = new Block(blockType, this.tileSize, this.topMargin, COLUMN_NUM);
	$('#blockArea').append(this.currentBlock.$block);
};

Engine.prototype.moveBlock = function(blockEvent) {
	if (this.currentBlock === null) {
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

	var blockParam = currentBlock.blockParam;
	var stateNum = blockParam.stateNum;
	var rotationState = transformParam.rotation % stateNum;
	var currentBlockCollisionFlag = blockParam.collisionFlagList[rotationState];

	var fullLineIndexList = [];
	for (var i = 0; i < blockParam.range; i++) {
		var lineIndex = transformParam.y + i;
		if (lineIndex >= this.rowNum) {
			break;
		}
		this.existingTileCollisionFlag[lineIndex] |= currentBlockCollisionFlag[i] << transformParam.x + WALL_RANGE;
		if (this.existingTileCollisionFlag[lineIndex] === FULL_LINE_FLAG) {
			fullLineIndexList.push(lineIndex);
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

	this.deleteLines(fullLineIndexList);
	this.tileUpdateListener(this.existingTileCollisionFlag);
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
				existingTileLine[k].shift(ShiftDirection.DOWN, 1);
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
		var existingTileLine = this.existingTileList[i];
		for (var j = 0; j < existingTileLine.length; j++) {
			existingTileLine[j].shift(ShiftDirection.UP, insertLineNum);
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
		var insertTileLine = [];
		for (var x = 0; x < COLUMN_NUM; x++) {
			if (x === this.insertLineVacantIndex) {
				continue;
			}
			var tile = new Tile(x, y, 'DimGray', this.tileSize, this.topMargin);
			$('#blockArea').append(tile.$tile);
			collisionFlag |=LEFT_EDGE_FLAG << x;
			insertTileLine.push(tile);
		}
		this.existingTileCollisionFlag.splice(y, 0, collisionFlag);
		this.existingTileList.push(insertTileLine);
	}

	this.tileUpdateListener(this.existingTileCollisionFlag);
};
