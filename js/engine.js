
var ROTATION_DEGREE = 90;
var ANIMATION_DURATION = '0.3s';

var currentBlock;
var squareSize;

BlockEvent = {
	LEFT: 0,
	RIGHT: 1,
	DOWN: 2,
	ROTATE: 3,
	ADD: 4
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
	this.x = 0;
	this.y = 0;
	this.rotationState = 0;

	var property = BLOCK_PROPERTY_ARRAY[blockType];
	this.createDom(property);
	this.rotationCenterOffset = property.range / 2.0;
	this.stateNum = property.stateNum;
	this.updateTransformOrigin();
}

Block.prototype.createDom = function(property) {
	console.log('block createSquare');
	this.$block = $('<div/>').addClass('block');
	this.$block.css('-webkit-transition', ANIMATION_DURATION);
	$('#blockArea').append(this.$block);
	for (var i = 0; i < property.placement.length; i++) {
		var $square = $('<div/>').addClass('square');
		$square.css('width', squareSize);
		$square.css('height', squareSize);
		$square.css('left', property.placement[i][0] * squareSize);
		$square.css('top', property.placement[i][1] * squareSize);
		$square.css('background-color', property.color);
		this.$block.append($square);
	}
}

Block.prototype.moveLeft = function() {
	this.x--;
	this.update();
}

Block.prototype.moveRight = function() {
	this.x++;
	this.update();
}

Block.prototype.moveDown = function() {
	this.y++;
	this.update();
}

Block.prototype.rotate = function() {
	//this.rotationState = (this.rotationState + 1) % this.stateNum;
	this.rotationState++;
	this.update();
}

Block.prototype.update = function() {
	console.log('block update: x = ' + this.x + ', y = ' + this.y + ', rotate = ' + this.rotationState);
	this.updateTransformOrigin();
	this.updateTransform();
}

Block.prototype.updateTransform = function() {
	this.$block.css('-webkit-transform', 'rotate(' + this.rotationState * ROTATION_DEGREE + 'deg) translate(' + this.x * squareSize + 'px, ' + this.y * squareSize + 'px)');
}

Block.prototype.updateTransformOrigin = function() {
	this.$block.css('-webkit-transform-origin', (this.x + this.rotationCenterOffset) * squareSize + 'px ' + (this.y + this.rotationCenterOffset) * squareSize + 'px');
}
