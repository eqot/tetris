
var currentBlock;

BlockEvent = {
	LEFT: 0,
	RIGHT: 1,
	DOWN: 2,
	ROTATE: 3
};

function dummy() {
	console.log('dummy()');
}

function moveBlock(blockEvent) {
	switch (blockEvent) {
		case BlockEvent.LEFT:
			console.log('left');
			break;

		case BlockEvent.RIGHT:
			console.log('right');
			currentBlock.moveRight();
			break;

		case BlockEvent.DOWN:
			console.log('down');
			break;

		case BlockEvent.ROTATE:
			console.log('rotate');
			currentBlock = new Block();
			currentBlock.draw();
			break;

		default:
			break;
	}
}

function Block() {
	console.log('block create');
	this.$block = $('<div/>').addClass('block');
	$('#blockArea').append(this.$block);
	this.pos = [0, 0];
	this.rotation = 0;
}

Block.prototype.draw = function() {
	console.log('block draw');
	for (var i = 0; i < 4; i++) {
		var $square = $('<div/>').addClass('square');
		//$square.css('top',String(100 * i) + 'px');
		this.$block.append($square);
	}
}

Block.prototype.moveRight = function() {
	console.log('block move right');
	this.$block.css('left',String(100) + 'px');
}
