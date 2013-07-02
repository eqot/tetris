
(function() {

	// Map from DOM id to block event
	var BUTTON_MAP = {
		'left':   BlockEvent.LEFT,
		'right':  BlockEvent.RIGHT,
		'down':   BlockEvent.DOWN,
		'rotate': BlockEvent.ROTATE,
		'add':    BlockEvent.ADD
	};

	// Map from key code to block event
	var KEY_MAP = {
		37: BlockEvent.LEFT,	// Left key
		39: BlockEvent.RIGHT,	// Right key
		40: BlockEvent.DOWN,	// Down key
		38: BlockEvent.ROTATE,	// Up key
		32: BlockEvent.ROTATE,	// Space key
		13: BlockEvent.ADD		// Enter key
	};

	$(document).ready(function($) {
		initialize();
		mainLoop();
	});

	// Initialize
	function initialize() {
		// Set an event listener for buttons to be pressed
		$('.blockEvent').click(onButtonPress);

		// Set an event listener for keys to be pressed
		$(document).keydown(onKeyPress);
	}

	// Handle button press event
	function onButtonPress (event) {
		var code = event.target.id;
		var blockEvent = BUTTON_MAP[code];
		executeBlockEvent(blockEvent);
	}

	// Handle key press event
	function onKeyPress (event)  {
		var code = event.keyCode;
		var blockEvent = KEY_MAP[code];
		executeBlockEvent(blockEvent);
	}

	// Execute block event like adding and moving block
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
