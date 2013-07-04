
var ROW_NUM = 15;
var COLUMN_NUM = 10;
var WALL_RANGE = 4; // max block range

var currentBlock;
var existingBlockFlag;
var tileSize;
var topMargin;

BlockEvent = {
	LEFT: 0,
	RIGHT: 1,
	DOWN: 2,
	ROTATE: 3,
	ADD: 4
};

function gameStart() {
	tileSize = $('#blockArea').width() / COLUMN_NUM;
	topMargin = $('#blockArea').height() - tileSize * ROW_NUM;
	console.log('tileSize = ' + tileSize + ', topMargin = ' + topMargin);

	// initialize existing block flag
	existingBlockFlag = new Array(ROW_NUM + 1);
	for (var i = 0; i < ROW_NUM; i++) {
		leftWallFlag = (0x01 << WALL_RANGE) - 1;
		rightWallFlag = leftWallFlag << WALL_RANGE + COLUMN_NUM;
		existingBlockFlag[i] = leftWallFlag | rightWallFlag; // 111100...001111
	}
	existingBlockFlag[ROW_NUM] = (0x01 << WALL_RANGE + COLUMN_NUM + 1) - 1; // last line
}

function createBlock(blockType) {
	currentBlock = new Block(blockType, tileSize, COLUMN_NUM, topMargin);
}

function moveBlock(blockEvent) {
	if (collisionCheck(blockEvent)) {
		currentBlock.move(blockEvent);
	}
}

function collisionCheck(blockEvent) {
	var transform = currentBlock.transform.copy();
	transform.move(blockEvent);

	var param = currentBlock.param;
	var currentBlockFlag = param.collisionFlagArray[transform.rotation % param.stateNum];
	dumpCollisionFlag(currentBlockFlag, param.range);
	var x = transform.x + WALL_RANGE;
	var y = transform.y;
	for (var i = 0; i < param.range; i++) {
		checkResult = (currentBlockFlag[i] << x) & existingBlockFlag[y + i];
		if (checkResult != 0) {
			return false;
		}
	}
	return true;
}
