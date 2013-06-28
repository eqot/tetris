
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
			break;

		case BlockEvent.DOWN:
			console.log('down');
			break;

		case BlockEvent.ROTATE:
			console.log('rotate');
			break;

		default:
			break;
	}
}
