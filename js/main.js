/*
* Copyright (c) 2016 Evgenii Dobrovidov
* This file is part of "Bunnies".
*
* "Bunnies" is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* "Bunnies" is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with "Bunnies".  If not, see <http://www.gnu.org/licenses/>.
*/

var active_screen = 'menu';

function backKey(e) {
	if (e.keyName == "back") {
		if (active_screen == 'main-menu') {
			tizen.application.getCurrentApplication().exit();		
			
		} else {
			if (active_screen == 'playground') {
				finishGame();
				//in case we exit gameover screen with hwback
				$(".contents .playground .info").off();
			}
			switchPage('main-menu');
		}
	}
}

function switchPage(new_page) {
	$(".contents .active").removeClass("active");
	$('.contents .'+new_page).addClass('active');
	
	active_screen = new_page;
}

function showHelpScreen() {
	switchPage('help-screen');

	$('.help-screen .back').click(function () {
		switchPage('main-menu');
	});
}

function showHighscore() {
	switchPage('score-screen');

	$('.score-screen .back').click(function () {
		switchPage('main-menu');
	});
}

function showPlayground() {
	switchPage('playground');
	startGame();
}

function getImgSuffix() {
	if (typeof LANG_CODE !== 'undefined' && LANG_CODE && LANG_CODE === 'ru') {
		return '_ru';
	} else {
		return '';
	}
}

var HIGHSCORE_POSITIONS = 5;//depends on screen resolution

var PLAYER_LIVES = 10;//game over when zero
var PLAYER_SCORE = 0;//well, score
var PLAYER_DIFF_SCORE = 0;//score to set difficulty, does not get subtracted

var BUNNY_INTERVAL = 2000;//2 seconds at the start
var BUNNY_TIMEOUT = 500;//how long bunny stays popped

var DIFFICULTY = 0;
var GAME_ENDED = true;

var SLOTS = { //id: taken or not
	1: false,
	2: false,
	3: false,
	4: false,
	5: false,
	6: false,
	7: false,
	8: false,
	9: false
};

function initGame() {
	PLAYER_LIVES = 10;
	PLAYER_SCORE = 0;
	PLAYER_DIFF_SCORE = 0;

	BUNNY_INTERVAL = 2000;
	BUNNY_TIMEOUT = 500;

	DIFFICULTY = 0;
	GAME_ENDED = false;

	SLOTS = {
		1: false,
		2: false,
		3: false,
		4: false,
		5: false,
		6: false,
		7: false,
		8: false,
		9: false
	};
	
	//clean up some blocks
	$(".contents .playground .info").empty();
	$(".contents .playground .slot :not(.hole)").remove();
	
	$(".contents .playground .info").removeClass('hidden');
}

function startGame() {
	initGame();

	//show "ready" and "go" messages
	var play_info = $(".contents .playground .info");
	play_info.addClass("center");
	
	var ready = $('<img src="img/ready'+getImgSuffix()+'.png">');
	play_info.append(ready);
	
	setTimeout(function () {
		var go = $('<img src="img/go'+getImgSuffix()+'.png">');
	
		ready.remove();
		play_info.append(go);
		setTimeout(function () {
			play_info.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
				play_info.removeClass("center");
				play_info.removeClass("transparent");
				play_info.off();
				
				go.remove();
				
				popBunny();
			});
			play_info.addClass("transparent");
			play_info.addClass("hidden");
			
		}, 700);
		
	}, 1800);
}

function finishGame() {
	GAME_ENDED = true;
	updateHighscore();
}

function constructBunny(slot) {
	var bunny = $('<div class="bunny"></div>');
	bunny.data("slot", slot);
	bunny.click(tapBunny);
	bunny.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
		bunnyTransitionFunction($(this), slot);
	});
	return bunny;
}

function constructBear(slot) {
	var bear = $('<div class="bear"></div>');
	bear.data("slot", slot);
	bear.click(tapBear);
	bear.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
		bearTransitionFunction($(this), slot);
	});
	return bear;
}

function increaseDifficulty() {
	//MINIMUM: BUNNY_INTERVAL = 200; BUNNY_TIMEOUT = 100;
	//first decrease interval, then timeout
	if (BUNNY_INTERVAL > 1800) {
		BUNNY_INTERVAL -= 100;
	} else if (BUNNY_INTERVAL > 1600 && BUNNY_TIMEOUT > 450) {
		BUNNY_TIMEOUT -= 50;
	} else if (BUNNY_INTERVAL > 1400) {
		BUNNY_INTERVAL -= 100;
	} else if (BUNNY_INTERVAL > 1200 && BUNNY_TIMEOUT > 400) {
		BUNNY_TIMEOUT -= 50;
	} else if (BUNNY_INTERVAL > 1000) {
		BUNNY_INTERVAL -= 100;
	} else if (BUNNY_INTERVAL > 800 && BUNNY_TIMEOUT > 350) {
		BUNNY_TIMEOUT -= 50;
	} else if (BUNNY_INTERVAL > 600) {
		BUNNY_INTERVAL -= 100;
	} else if (BUNNY_INTERVAL > 400 && BUNNY_TIMEOUT > 300) {
		BUNNY_TIMEOUT -= 50;
	} else if (BUNNY_INTERVAL > 300) {
		BUNNY_INTERVAL -= 100;
	} else if (BUNNY_TIMEOUT > 100) {
		BUNNY_TIMEOUT -= 50;
	}
	DIFFICULTY++;
}

function gameOver() {
	GAME_ENDED = true;

	if (PLAYER_SCORE < 0) {
		PLAYER_SCORE = 0;
	}
	
	var play_info = $(".contents .playground .info");
	play_info.addClass("center");
	
	var gameover = $('<img class="gameover" src="img/gameover'+getImgSuffix()+'.png">');
	var score = $('<div class="score"><img class="score-label" src="img/score'+getImgSuffix()+'.png"><span class="score">'+PLAYER_SCORE+'</span></div>');
	
	play_info.append(gameover);
	play_info.append(score);
	
	play_info.removeClass("hidden");
	
	play_info.click(function () {
		switchPage('main-menu');
		play_info.off();
	});
	
	finishGame();
}

function showScore(score, slot) {
	if (!GAME_ENDED && slot >= 1 && slot <= 9 && score !== null) {
		score.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
			if (score.hasClass('fade')) {
				//remove
				score.off();
				score.remove();
			} else {
				//hide
				setTimeout(function () {
					score.addClass('fade');
				}, 150);
			}
		});
		$(".slot#slot" + slot).append(score);
		setTimeout(function () {
			score.addClass('pop');
		}, 100);
	}
}

function showMinusScore(slot) {
	showScore($('<div class="minus score"></div>'), slot);
}

function showPlusScore(slot) {
	showScore($('<div class="plus score"></div>'), slot);
}

function showLiveScore(slot) {
	showScore($('<div class="live score"></div>'), slot);
}

function bunnyTransitionFunction(bunny, slot) {
	if (bunny.hasClass('popped')) {
		//start timer to go back to the hole
		bunny.data("timeout_timer", setTimeout(function () {
			bunny.data("timeout_timer", null);
			bunny.removeClass('popped');
		}, BUNNY_TIMEOUT));
	} else {
		//this bunny went back to the hole, destroy it
		bunny.off();
		bunny.remove();
		
		SLOTS[slot] = false;
		
		if (!GAME_ENDED && !bunny.hasClass('scored')) {
			//subtract lives
			if (PLAYER_LIVES == 1) {
				gameOver();
			} else {
				PLAYER_LIVES--;
				showLiveScore(slot);
			}
		}
	}
}

function bearTransitionFunction(bear, slot) {
	if (bear.hasClass('popped')) {
		//start timer to go back to the hole
		bear.data("timeout_timer", setTimeout(function () {
			bear.data("timeout_timer", null);
			bear.removeClass('popped');
		}, BUNNY_TIMEOUT));
	} else {
		//this bear went back to the hole, destroy it
		bear.off();
		bear.remove();
		
		SLOTS[slot] = false;
	}
}

function popBunny() {
	if (!GAME_ENDED) {
		var empty = [];
		for (var i = 1; i <= 9; i++) {
			if (!SLOTS[i]) empty.push(i);
		}
		if (empty.length > 0) {
			var slot = empty[Math.floor(Math.random() * empty.length)];
			SLOTS[slot] = true;//slot taken
			
			var bear = (Math.random() > 0.7);
			if (bear) {
				var bear = constructBear(slot);
				
				$(".slot#slot" + slot).append(bear);
				setTimeout(function () {
					bear.addClass('popped');
				}, 100);
			
			} else {
				var bunny = constructBunny(slot);

				$(".slot#slot" + slot).append(bunny);
				setTimeout(function () {
					bunny.addClass('popped');
				}, 100);
			}
		}
		setTimeout(popBunny, BUNNY_INTERVAL);
	}
}

function tapBunny() {
	if (!GAME_ENDED) {
		var bunny = $(this);
		if (!bunny.hasClass('scored')) {
			var slot = bunny.data("slot");
			
			var timer = bunny.data("timeout_timer");
			if (timer) {
				clearTimeout(timer);
				bunny.data("timeout_timer", null);
			}
			
			bunny.addClass('scored');
			if (bunny.hasClass('popped')) {
				setTimeout(function () {
					bunny.removeClass('popped');
				}, 200);
			}
			
			showPlusScore(slot);
			PLAYER_SCORE += 10;
			PLAYER_DIFF_SCORE += 10;
			
			if (PLAYER_DIFF_SCORE < 500 && PLAYER_DIFF_SCORE % 50 == 0) {
				increaseDifficulty();
			} else if (PLAYER_DIFF_SCORE < 1000 && PLAYER_DIFF_SCORE % 100 == 0) {
				increaseDifficulty();
			} else if (PLAYER_DIFF_SCORE < 1500 && PLAYER_DIFF_SCORE % 150 == 0) {
				increaseDifficulty();
			} else if (PLAYER_DIFF_SCORE % 200 == 0) {
				increaseDifficulty();
			}
		}
	}
}

function tapBear() {
	if (!GAME_ENDED) {
		var bear = $(this);
		if (!bear.hasClass('scored')) {
			var slot = bear.data("slot");
			
			var timer = bear.data("timeout_timer");
			if (timer) {
				clearTimeout(timer);
				bear.data("timeout_timer", null);
			}
			
			bear.addClass('scored');
			if (bear.hasClass('popped')) {
				setTimeout(function () {
					bear.removeClass('popped');
				}, 200);
			}
			
			showMinusScore(slot);
			PLAYER_SCORE -= 20;
		}
	}
}

var HIGHSCORE_DATA = null;
function updateHighscore() {
	if (PLAYER_SCORE > 0 && PLAYER_SCORE > HIGHSCORE_DATA[HIGHSCORE_DATA.length - 1]) {
		HIGHSCORE_DATA.push(PLAYER_SCORE);
		HIGHSCORE_DATA.sort(function (a,b) { return b - a; });
		if (HIGHSCORE_DATA.length > HIGHSCORE_POSITIONS) {
			HIGHSCORE_DATA.splice(HIGHSCORE_DATA.length - 1, 1);	
		}
		
		localStorage.setItem('highscore', HIGHSCORE_DATA);
		
		$(".contents .score-screen ul.highscore").empty();
		for (var i = 0; i < HIGHSCORE_DATA.length; i++) {
			var score = HIGHSCORE_DATA[i];
			$(".contents .score-screen ul.highscore").append($("<li>"+score+"</li>"));
		}
	}
}

function loadHighscore() {
	if (localStorage.highscore !== undefined) {
		HIGHSCORE_DATA = JSON.parse('[' + localStorage.getItem('highscore') + ']');
		
		$(".contents .score-screen ul.highscore").empty();
		for (var i = 0; i < HIGHSCORE_DATA.length; i++) {
			var score = HIGHSCORE_DATA[i];
			
			$(".contents .score-screen ul.highscore").append($("<li>"+score+"</li>"));
		}
	}
}

function onVisibilityChange() {
	if (document.visibilityState !== 'visible') {
		//stop the game, release screen request
		tizen.power.release("SCREEN");
		if (!GAME_ENDED) {
			finishGame();
			$(".contents .playground .info").off();
			switchPage('main-menu');		
		}
		
	} else {
		//set screen request
		tizen.power.request("SCREEN", "SCREEN_NORMAL");
	}
}

function onUnload() {
	//stop the game, release screen request
	tizen.power.release("SCREEN");
	if (!GAME_ENDED) {
		updateHighscore();
	}
}

function onBlur() {
	//stop the game, release screen request
	tizen.power.release("SCREEN");
	if (!GAME_ENDED) {
		finishGame();
		$(".contents .playground .info").off();
		switchPage('main-menu');		
	}
}

function onFocus() {
	//set screen request
	tizen.power.request("SCREEN", "SCREEN_NORMAL");
}

$(function () {
    document.addEventListener('tizenhwkey', backKey);	
    window.addEventListener('unload', onUnload);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    
    tizen.systeminfo.addPropertyValueChangeListener(
        'BATTERY',
        function change(battery) {
			if (!battery.isCharging) {
				if (typeof LANG_CODE !== 'undefined' && LANG_CODE && LANG_CODE === 'ru') {
					alert("Батарея разряжена! Не тратьте заряд, поиграйте позже.");	
				} else {
					alert("Low battery level! Don't waste it, play later.");
				}
				try {
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) { }
			}
        },
        { lowThreshold: 0.06 }
    );
    
    tizen.power.request("SCREEN", "SCREEN_NORMAL");
    
    //load screen resolution
    tizen.systeminfo.getPropertyValue("DISPLAY", function (screen) {
		var width = screen.resolutionWidth,
			height = screen.resolutionHeight;
		
		if (width > 320 && height > 320) {
			$(".contents").addClass("big");
			HIGHSCORE_POSITIONS = 6;
		}
		
		if (localStorage.highscore === undefined) {
			HIGHSCORE_DATA = [];
			for (var i = 1000, j = 0; j < HIGHSCORE_POSITIONS; j++) {
				HIGHSCORE_DATA.push(i);
				i -= 100;
			}
			localStorage.setItem('highscore', HIGHSCORE_DATA);
		}
		loadHighscore();
    });
	
    //main menu
    $('.main-menu .exit').click(function () {
    	tizen.application.getCurrentApplication().exit();
    });
    
	$('.main-menu .new-game').click(function () {		
		showPlayground();
    });
	
	$('.main-menu .highscore').click(function () {		
		showHighscore();
    });
	
    $('.main-menu .help').click(function () {
		showHelpScreen();
    });
});
