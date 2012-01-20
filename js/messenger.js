var Messenger = new Class({
	start: function() {},
	sendState: function() {},
	sendChat: function() {},
	sendGameEvent: function() {},
	sendGameMsg: function() {},
	amIUp: function() {},
	isGameFinished: function() {}
});

var DummyMessenger = Messenger;

var LocalMessenger = new Class({
	Extends: Messenger,
	
	sendState: function(game) {
		var gameState = game.exportState();
		game.displayLastMove(gameState.lastMove, true);
	},
	
	amIUp: function(game) {
		return true;
	},
	
	isGameFinished: function() {
		return true;
	}
});

var ServerMessenger = new Class({
	Extends: Messenger,
	
	state: '',
	chats: '',
	players: '',
	
	gameId: null,
	numStage: null,
	numState: null,
	userName: null,
	
	timeRemaining: -1,
	timeRefreshInterval: null,
	
	initialize: function(params) {
		this.gameId = params.id;
		this.numStage = params.numStage;
		this.numState = params.numState;
		this.userName = params.userName;
		this.state = params.state;
		this.chats = params.chats;
		this.players = params.players;
	},
	
	start: function(game) {
		// initialize game state
		if (this.state != '') {
		var state = JSON.parse(this.state);
		game.importGame(state);
	}

		// initialize chats
	if (chat.length > 0) {
		game.displayChat(this.chat);
	}
	
	// initialize players
	if (this.players != '') {
		game.importPlayers(this.players, this.numStage, this.userName);
	}
	
	// start polling
	this.pollState(game);
	setInterval(function () { this.pollState(game); }, 2500);
	},
	
	sendState: function(game) {
		var gameState = game.exportState();
		
		var publishRequest = new Request({
			url: baseUrl + 'Games/SaveState/',
			data: 'id=' + this.gameId 
				+ '&state=' + JSON.stringify(gameState)
				+ '&turn=' + game.turnNum
		+ '&player=' + game.currentPlayer,
			onSuccess: function (txt) {
				this.numState++;
			}
		});

		publishRequest.send();
	},
	
	pollState: function(game) {
		var pollRequest = new Request({
			url: baseUrl + 'Games/PollState/',
			data: 'id=' + this.gameId 
				+ '&num_state=' + this.numState
				+ '&num_chats=' + $$('#messages .msg').length,
			onSuccess: function (txt) {
				var data = JSON.parse(txt);
				this.numState = data.num;
				
				if (data.stage > this.numStage) {
			location.reload(true);
		}

		// Check time remaining (only if game is active)
		if (this.numStage == 2) {
			if (data.time) {
				if (data.time == 'expired') {
					var oldPlayer = game.getCurrentPlayer();
					game.skipTurn();
					this.sendGameMsg(game, 'Oops! Time expired for ' + oldPlayer.userName + ' (' + oldPlayer.countryDisplayName + ').');
					this.publishGameState(game);
				} else {
					$('timeLeft').innerHTML = formatTimeLeft(data.time) + ' left';

					this.timeRemaining = parseInt(data.time);
					if (timeRefreshInterval) {
						clearInterval(this.timeRefreshInterval);
					}
					this.timeRefreshInterval = setInterval(function () { 
						this.timeRemaining--; 
						if (formatTimeLeft(this.timeRemaining)) {
							$('timeLeft').innerHTML = formatTimeLeft(this.timeRemaining) + ' left'; 
						} else {
							$('timeLeft').innerHTML = 'Turn expired!';
						}
					}, 1000);
				}
			}
		}
				
				if (data.state) {
					game.importState(data.state);
					game.tabNotification('movesTab');
				}
				if (data.chats) {
					this.displayChat(game, data.chats);
					game.tabNotification('chatTab');
				}
			}
		});

		pollRequest.send();
	},
	
	sendChat: function(game, msg) {
		var chatRequest = new Request({
			url: baseUrl + 'Games/SendChat/',
			data: 'id=' + this.gameId + '&msg=' + msg.replace(/"/g, "'"),
			onSuccess: function (txt) {
				this.displayChat(game, JSON.parse(txt));
			}
		});

		chatRequest.send();
	},
	
	displayChat: function(game, chat) {
		$('messages').clear();

		chat.each(function (msg) {
			var color = '';
			var country = 'Guest';
			
			if (this.numStage >= 2) {
				var playerObj = game.players.filter(function (player) {
					return (player.userName == msg[0]);
				});

				if (playerObj.length > 0) {
					color = playerObj[0].color;
					country = playerObj[0].countryDisplayName;
				}

				var msgHtml = '<span class="name ' + color + '">' + msg[0] + ' (' + country + ') :</span> ' + msg[1];
			} else {
				var msgHtml = '<span class="name">' + msg[0] + ':</span> ' + msg[1];
			}

			var msg = new Element('div.msg', {
				html: msgHtml
			});
			msg.inject($('messages'));
		});

		$('messages').scrollTop = $('messages').scrollHeight; // scroll down
	},
	
	sendGameEvent: function(game, gameEvent) {
		var publishRequest;
		
		switch (gameEvent.type) {
			case 'gameOver':
				publishRequest = new Request({
					url: baseUrl + 'Games/GameOver/',
					data: 'id=' + this.gameId 
						+ '&winner=' + gameEvent.player
				});
				break;
			case 'playerDefeated':
				publishRequest = new Request({
					url: baseUrl + 'Games/Defeated/',
					data: 'id=' + this.gameId 
						+ '&loser=' + gameEvent.player
				});
				break;
			case 'offerDraw':
				publishRequest = new Request({
					url: baseUrl + 'Games/OfferDraw/',
					data: 'id=' + this.gameId
				});
				break;
		}
		
		publishRequest.send();
	},
	
	sendGameMsg: function(game, msg) {
		msg = msg.replace(/"/g, "'");

		var sendMsgRequest = new Request({
			url: baseUrl + 'Games/SendGameMsg/',
			data: 'id=' + this.gameId 
				+ '&msg=' + this.msg,
			onSuccess: function (txt) {
				this.displayChat(JSON.parse(txt));
			}
		});

	// Make a poll first to make sure that we don't duplicate the message

	var pollRequest = new Request({
			url: baseUrl + 'Games/PollState/',
			data: 'id=' + this.gameId 
				+ '&num_state=' + this.numState
				+ '&num_chats=' + $$('#messages .msg').length,
			onSuccess: function (txt) {
				var data = JSON.parse(txt);

				if (data.chats) {
					this.displayChat(data.chats);
					game.tabNotification('chatTab');
				}

		var gameMsgs = $$('#messages .gameMsg');
		if (gameMsgs.length == 0 || gameMsgs.getLast().getText() != msg) {
			sendMsgRequest.send();
		}
			}
		});

		pollRequest.send();
	},
	
	amIUp: function(game) {
		return (game.getCurrentPlayer().userName == this.userName);
	},
	
	isGameFinished: function() {
		return (this.numStage != 3);
	}
});

// Helpers

function formatTimeLeft(timeLeft) {
	if (timeLeft < 0) {
		return false;
	}

	var sec = timeLeft % 60;
	var min = Math.floor(timeLeft / 60) % 60;
	var hrs = Math.floor(timeLeft / (60 * 60)) % 24;
	var days = Math.floor(timeLeft / (60 * 60 * 24));

	if (days > 0) {
		var strTimeLeft = days + ':' + pad(hrs) + ':' + pad(min) + ':' + pad(sec);
	} else if (hrs > 0) {
		var strTimeLeft = hrs + ':' + pad(min) + ':' + pad(sec);
	} else {
		var strTimeLeft = min + ':' + pad(sec);
	}

	return strTimeLeft;
}

// used by formatTimeLeft
function pad(intTime) {
	if (intTime < 10) {
		return '0' + intTime;
	} else {
		return intTime;
	}
}
