/*global Engine, BlockEvent, EnemyStatus, BLOCK_PARAM_LIST */

'use strict';

(function() {

	// Map from DOM id to block event
	var BUTTON_MAP = {
		'left':   BlockEvent.LEFT,
		'right':  BlockEvent.RIGHT,
		'down':   BlockEvent.DOWN,
		'up':     BlockEvent.ROTATE,
		'rotate': BlockEvent.ROTATE,
		'add':    BlockEvent.ADD
	};

	// Map from key code to block event
	var KEY_MAP = {
		37: BlockEvent.LEFT,	// Left key
		39: BlockEvent.RIGHT,	// Right key
		40: BlockEvent.DOWN,	// Down key
		38: BlockEvent.ROTATE,	// Up key
		32: BlockEvent.PAUSE,	// Space key
		13: BlockEvent.ADD		// Enter key
	};

	$(document).ready(function() {
		initialize();
		mainLoop();
	});

	var engine;
	var enemyStatus;
	var pauseFlag = false;

	// Initialize
	function initialize() {
		// Set an event listener for buttons to be pressed
		$('.blockEvent').click(onButtonPress);

		// Set an event listener for keys to be pressed
		$(document).keydown(onKeyPress);

		// Set an event listener for swipe gestures
		$(window).hammer({
			swipe_velocity: 0.2
		}).on('swipe', onSwipe);

		engine = new Engine(onTileUpdated);
		enemyStatus = new EnemyStatus();

		// Set an event listener for window size to be changed
		$(window).resize(adjustBlockAreaSize);
		adjustBlockAreaSize();
	}

	// Adjust block area size to window size
	function adjustBlockAreaSize () {
		var width = $(window).width() - 40;
		var height = $(window).height() - 40;

		var blockArea = $('#blockArea');
		var blockAreaWidth;
		if (width >= height) {
			// Landscape
			blockAreaWidth = height / 2;
			blockArea.width(blockAreaWidth);
			blockArea.height(height);
			blockArea.css('left', (width - blockAreaWidth) / 2);
		} else {
			// Portrait
			if (width * 2 < height) {
				blockAreaWidth = width;
				blockArea.width(blockAreaWidth);
				blockArea.height(width * 2);
				blockArea.css('left', 10);
			} else {
				blockAreaWidth = height / 2;
				blockArea.width(blockAreaWidth);
				blockArea.height(height);
				blockArea.css('left', (width - blockAreaWidth) / 2);
			}
		}

		var statusArea = $('#statusArea');
		var statusAreaWidth = blockAreaWidth / 4;
		statusArea.width(statusAreaWidth);

		engine.setBlockAreaSize(blockArea.width(), blockArea.height());
		engine.setNextBlockIndicatorSize(statusAreaWidth);
		enemyStatus.setCanvasSize(statusAreaWidth);
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

	// Handle swipe gesture event
	function onSwipe (event) {
		var code = event.gesture.direction;
		var blockEvent = BUTTON_MAP[code];
		executeBlockEvent(blockEvent);
	}

	// Execute block event like adding and moving block
	function executeBlockEvent (blockEvent) {
		if (blockEvent !== undefined) {
			if (blockEvent === BlockEvent.ADD) {
				engine.insertLines(1);
			} else if (blockEvent === BlockEvent.PAUSE) {
				pauseFlag = !pauseFlag;
				if (!pauseFlag) {
					update();
				}
			} else {
				engine.moveBlock(blockEvent);
			}
		}
	}

	function mainLoop() {
		engine.initialize();
		update();
	}

	function update() {
		if (pauseFlag) {
			return;
		}

		if (!engine.currentBlock) {
			var blockType = Math.floor( Math.random() * BLOCK_PARAM_LIST.length);
			engine.createBlock(blockType);
		} else {
			executeBlockEvent(BlockEvent.DOWN);
		}

		setTimeout(function() {
			update();
		}, 1000);
	}

	function onTileUpdated(existingTileCollisionFlag) {
		enemyStatus.render(existingTileCollisionFlag);
	}
})();
