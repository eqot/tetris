
(function() {

	var BUTTON_MAP = {
		'left': BlockEvent.LEFT,
		'right': BlockEvent.RIGHT,
		'down': BlockEvent.DOWN,
		'rotate': BlockEvent.ROTATE,
		'add': BlockEvent.ADD
	};

	var KEY_MAP = {
		37: BlockEvent.LEFT,
		39: BlockEvent.RIGHT,
		40: BlockEvent.DOWN,
		38: BlockEvent.ROTATE,
		32: BlockEvent.ROTATE,
		13: BlockEvent.ADD
	};

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
		$('#add').click(onButtonPress);

		$(document).keydown(onKeyPress);
	}

	function onButtonPress (event) {
		var code = event.target.id;
		var blockEvent = BUTTON_MAP[code];
		executeBlockEvent(blockEvent);
	}

	function onKeyPress (event)  {
		var code = event.keyCode;
		var blockEvent = KEY_MAP[code];
		executeBlockEvent(blockEvent);
	}

	function executeBlockEvent (blockEvent) {
		if (blockEvent !== undefined) {
			if (blockEvent === BlockEvent.ADD) {
				createBlock();
			} else {
				moveBlock(blockEvent);
			}
		}
	}

	function mainLoop() {
		dummy();
	}

})();
