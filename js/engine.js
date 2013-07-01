
var currentBlock;
var squareSize;

BlockEvent = {
	LEFT: 0,
	RIGHT: 1,
	DOWN: 2,
	ROTATE: 3
};

function dummy() {
	squareSize = $('#blockArea').width() / 10;
	console.log('squareSize = ' + squareSize);
}

function createBlock() {
	var blockType = Math.floor( Math.random() * 7);
	currentBlock = new Block(blockType);
}

function moveBlock(blockEvent) {
	switch (blockEvent) {
		case BlockEvent.LEFT:
			console.log('left');
			currentBlock.moveLeft();
			break;

		case BlockEvent.RIGHT:
			console.log('right');
			currentBlock.moveRight();
			break;

		case BlockEvent.DOWN:
			console.log('down');
			currentBlock.moveDown();
			break;

		case BlockEvent.ROTATE:
			console.log('rotate');
			currentBlock.rotate();
			break;

		default:
			break;
	}
}

function Block(blockType) {
	console.log('block create');
	this.$block = $('<div/>').addClass('block');
	$('#blockArea').append(this.$block);
	this.x = 0;
	this.y = 0;
	this.rotation = 0;

	this.createSquare(blockType);
}

Block.prototype.draw = function() {
	console.log('block draw');
}

Block.prototype.createSquare = function(blockType) {
	console.log('block createSquare');
	var property = BLOCK_PROPERTY_ARRAY[blockType];
	for (var i = 0; i < 4; i++) {
		var $square = $('<div/>').addClass('square');
		$square.css('width', squareSize);
		$square.css('height', squareSize);
		$square.css('background-color', property.color);
		$square.css('left', squareSize * property.squarePlacement[i][0]);
		$square.css('top', squareSize * property.squarePlacement[i][1]);
		this.$block.append($square);
	}
	this.rotationCenterX = squareSize * property.rotationCenter[0];
	this.rotationCenterY = squareSize * property.rotationCenter[1];
}

Block.prototype.moveLeft = function() {
	this.x -= squareSize;
	this.rotationCenterX -= squareSize;
	this.update();
}

Block.prototype.moveRight = function() {
	this.x += squareSize;
	this.rotationCenterX += squareSize;
	this.update();
}

Block.prototype.moveDown = function() {
	this.y += squareSize;
	this.rotationCenterY += squareSize;
	this.update();
}

Block.prototype.rotate = function() {
	this.rotation += 90;
	this.update();
}

Block.prototype.update = function() {
	console.log('block update: x = ' + this.x + ', y = ' + this.y + ', rotate = ' + this.rotation);
	this.$block.css('-webkit-transform', 'rotate(' + this.rotation + 'deg) translate(' + this.x + 'px, ' + this.y + 'px)');
	this.$block.css('-webkit-transform-origin', this.rotationCenterX + 'px ' + this.rotationCenterY + 'px');
}
