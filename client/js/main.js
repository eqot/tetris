
(function() {

	$(document).ready(function($) {
		initialize();
		mainLoop();
	});

	function initialize() {
		console.log('initialize()');

		$('#left').click(onButtonPress);
		$('#right').click(onButtonPress);
		$('#down').click(onButtonPress);
		$('#rotate').click(onButtonPress);
	}

	function onButtonPress (event) {
		var blockEvent = event.target.id;
		switch (blockEvent) {
			case 'left':
				moveBlock(BlockEvent.LEFT);
				break;

			case 'right':
				moveBlock(BlockEvent.RIGHT);
				break;

			case 'down':
				moveBlock(BlockEvent.DOWN);
				break;

			case 'rotate':
				moveBlock(BlockEvent.ROTATE);
				break;

			default:
				break;
		}
	}

	function mainLoop() {
		dummy();
	}

})();
