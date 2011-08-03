//
// GLOBAL VARIABLES
//

var squareSize = 48; // width/height of squares
var z = 100; // used by Element.pushToFront()

//
// CLASS OVERRIDES
//

Element.implement({
    object: null,

    /*
     * Pushes the HTML element to the front of the screen
     */
    pushToFront: function() {
		this.setStyle('z-index', z++);
    },
    
    /*
     * Shows a previously-hidden HTML element
     */
    show: function() {
        this.setStyle('visibility','visible');
    },
    
    /*
     * Hides the HTML element
     */
    hide: function() {
        this.setStyle('visibility','hidden');
    },
    
    /*
     * Clears the contents of the HTML element
     */
    clear: function() {
        this.innerHTML = '';
    }
});

Array.implement({
	
	/*
	 * @return a string of the form "1, 2, 'blah'" if the array is [1, 2, 'blah']
	 * Note: We override the usual Array.toString() function because we want to quote strings
	 */
	toString: function() {
		var str = '';
		this.each(function (el) {
			if (typeof(el) == 'string') {
				str += "'" + el + "',";
			} else {
				str += el + ',';
			}
		});
		return str.substring(0, str.length - 1);
	}
});

//
// STATIC CLASSES
//

var AbstractFactory = new new Class({
	/*
	 * @params: name = class name of object to create
	 * 			params = arguments to the object constructor
	 * @return a new instance of the given class
	 */
	create: function(name, params) {
		return eval('new ' + name + '(' + params.toString() + ');');
	}
});

//
// CLASS DEFINITIONS
//

var Game = new Class({
	players: [], // array of players
	currentPlayer: 0, // number of current player
	currentTurn: null, // HTML element that stores current turn's moves
	lastPieceMoved: null, // last Piece moved
	turnNum: 1, // current turn number
	movable: false, // can pieces be moved?
	
	// SETUP
	
	initialize: function() {
		
	},
	
	/*
	 * Creates the game board
	 */
	setup: function() {
		for (var i = 1; i <= 8; i++) {
			for (var j = 1; j <= 8; j++) {
				$(new Square(i, j)).inject('squares');
			}
		}
	},
	
	/*
	 * @params: self-explanatory
	 * @return a new Player given countryName and color
	 */
	addPlayer: function(countryName, color) {
		var order = this.players.length;
		var player = AbstractFactory.create(countryName, [order, color])
		this.players.push(player);
		player.setup();
		$$('#moves .heading.' + color).appendText(player.countryName);
	},
	
	/*
	 * Calls the start of the first turn and the first player's move
	 */
	startGame: function() {
		this.turnStart();
		this.playerStart();
		this.clearStatus();
		this.movable = true;
		
		$('setup').dispose();
		$('moves').show();
	},
	
	// turns and players
	
	/*
	 * @params: i = player number
	 * @return a Player given their number
	 */
	getPlayer: function(i) {
		return this.players[i];
	},
    
	/*
	 * @params: i = player number
	 * @return an array of all players except the one at the given number
	 */
    getOtherPlayers: function(i) {
		return this.players.filter( function(player) {
    		return player.order != i;
    	});
    },
    
    /*
     * @return the player whose turn it is
     */
    getCurrentPlayer: function() {
    	return this.getPlayer(this.currentPlayer);
    },
    
    /*
     * Prepares a turn
     */
    turnStart: function() {
    	this.currentTurn = new Element('tr');
    	new Element('td.num').appendText(this.turnNum).inject(this.currentTurn);
		this.currentTurn.inject('moves');
    },
    
    /*
     * Starts the current player's turn
     */
    playerStart: function() {
    	this.getCurrentPlayer().startTurn();
    },
    
    /*
     * Moves play to the next player and starts their turn
     */
	nextPlayer: function() {
    	if (this.currentPlayer == this.players.length - 1) {
    		this.nextTurn();
    		this.currentPlayer = 0;
    	} else {
    		this.currentPlayer++;
    	}
    	
		this.playerStart();
	},
    
	/*
	 * Increments the turn number and starts the next turn
	 */
    nextTurn: function() {
    	this.turnNum++;
    	this.turnStart();
    },
    
    //
    // GAME STATUS AND PLAYER INTERACTION
	//
    
    /*
     * @params: txt = the text to display
     * Displays an alert with the given text
     */
    alert: function(txt) {
		$('alert').innerHTML = txt;
	},
	
	/*
	 * @params: txt = the text to display
	 * 			selectType = available types: "piece"
	 * 			buttonType = available types: "confirmCancel"
	 * 			selector(item) = filter function to determine whether an object is selectable
	 * 			onAvailable(item) = callback for selectable items
	 * 			onSelect(item) = callback for selection
	 * 			onConfirm(selectedItem) = callback for confirm button (if any)
	 * 			onCancel() = callback for cancel button (if any)
	 * 			onEnd() = callback for when the prompt is cleared
	 * Prompts a player to select something
	 */
	prompt: function(txt, selectType, buttonType, selector, onAvailable, onSelect, onConfirm, onCancel, onEnd) {
		$('alert').innerHTML = txt;
		
		switch (buttonType) {
		case 'confirmCancel':
			$('confirmButton').show();
			$('confirmButton').addEvent('click', function () {
				if (game.selection) {
					onConfirm(game.selection);
					game.clearStatus();
				}
			});
			
			$('cancelButton').show()
			$('cancelButton').addEvent('click', function () {
				onCancel();
				game.clearStatus();
			});
		}
		
		switch (selectType) {
		case 'piece':
			$$('#board .piece').filter(function (piece) {
				return selector(piece);
			}).each(function (piece) {
				onAvailable(piece);
				piece.addClass('clickable');
				piece.addEvent('click', function () {
					game.selection = piece;
					onSelect(piece);
				})
			});
			break;
		}
		
		this.onEndPrompt = onEnd;
		this.movable = false;
	},
	
	/*
	 * Creates a prompt with recommended settings (see prompt() for params)
	 */
	promptSimple: function (txt, selectType, buttonType, selector, onConfirm) {
		var onAvailable = function () {};
		var onSelect = function () {};
		var onCancel = function () {};
		var onEnd = function () {};
		
		switch (selectType) {
		case 'piece':
			onAvailable = function (piece) {
				piece.object.getSquare().element.addClass('hoverBlue')
			};
			onSelect = function (piece) {
				$$('#board .square').removeClass('hoverGreen');
				piece.object.getSquare().element.addClass('hoverGreen');
			};
			onEnd = function () {
				$$('#board .square').removeClass('hoverBlue').removeClass('hoverGreen');
				game.getCurrentPlayer().endTurn();
			};
			break;
		}
		
		this.prompt(txt, selectType, buttonType, selector, onAvailable, onSelect, onConfirm, onCancel, onEnd); 
	},
	
	/*
     * Clears alert and prompt
     */
	clearStatus: function(txt) {
		this.alert('');
		
		$$('#statusBox button').each (function (button) {
			button.hide();
			button.removeEvents('click');
		});
		
		$$('#board .piece').each (function (piece) {
			piece.removeClass('clickable');
			piece.removeEvents('click');
		})
		
		if (this.onEndPrompt) {
			var onEnd = this.onEndPrompt;
			this.onEndPrompt = null;
			onEnd();
		}
		
		this.movable = true;
	},

	/*
	 * @returns: '##' if game over, '#' if checkmate, '+' if check, '' otherwise
	 * Checks for game over, checkmate, check
	 */
	checkChecks: function() {
		var game = this;
		var cp = this.getCurrentPlayer();
		var suffix = '';
		
		cp.check = false;
		
		this.clearStatus(); // first, clear existing alert
		
		if (this.getOtherPlayers(cp.order).every(function (player) {
			return ($$('#board .royal.' + player.color).length == 0)
		})) {
			game.gameOver(cp);
			suffix = '##';
		} else {
			this.getOtherPlayers(cp.order).each(function(player) {			
				var defeated = ($$('#board .royal.' + player.color).length == 0);
				var check = $$('#board .royal.' + player.color).every(function (royalPiece) { return royalPiece.object.inCheck(); });
				
				if (defeated) {
					if (player.inGame) {
						player.defeated(cp);
						suffix = '#';
					}
				} else if (check) {
					game.alert('Check!'); // alert displays continually, but '+' is shown only 
										  // the first time a player is checked (until his next turn)
					if (!player.check) {
						player.check = true;
						suffix = '+';
					}
				}
			});
		}
		
		return suffix;
	},

	/*
	 * @params: winner = Player that won the game
	 * Displays victory status
	 */
	gameOver: function(winner) {
		$$('#board .piece').each(function(piece) {
			piece.object.transferPossession(winner);
			piece.object.drag.detach();
		});
		
		var outcomeText = winner.color.capitalize() + ' wins.';
		var outcome = new Element('div.outcome');
		outcome.appendText(outcomeText);
		setTimeout(function () {outcome.inject('sidebar')}, 100);
	},
	
	// pieces
	
	/*
	 * @params: choice = the Piece the player has selected to promote to
	 * Promotes the last-moved piece to the chosen piece
	 */
	doPromote: function(choice) {
	    var pawn = this.lastPieceMoved;
	    
	    choice.element.inject('pieces');
	    choice.addDragEvent();
	    choice.element.onclick = "";
    	pawn.element.dispose();
    	
    	game.getLastMoveText().appendText('=' + choice.pieceChar);
    	this.hideDialog();
	},

	// moves
	
	/*
	 * @params: txt = move text to display
	 * Displays the given text on the move table
	 */
	displayMove: function(txt) {
		var move = new Element('td.move');
		move.appendText(txt).inject(this.currentTurn);		
	},
		
	/*
	 * Retrieves the HTML element containing the text of the last move
	 */
	getLastMoveText: function() {
		return $$('#moves .move').filter(function (el) {
			return el.innerHTML != '--';
		}).getLast();
	},

	// misc GUI

	/*
	 * Hides any currently open dialog
	 */
	hideDialog: function() {
	    $('dialog').clear();
	    $('overlay').hide();
	},
	
	export: function() {
		return {
			gameVars: {
				currentPlayer: this.currentPlayer,
				turnNum: this.turnNum
			},
			players: this.players.map(function(player) {
				return player.export();
			}),
			board: {
				pieces: $$('#board .piece').map(function(piece) {
					return piece.object.export();
				})
			},
			graveyard: $$('#graveyard .piece').map(function(piece) {
				return piece.object.export();
			}),
			moves: escape($('moves').innerHTML)
		};
	},
	
	import: function(gameState) {
		var game = this;
		var state = JSON.parse(gameState);
		
		// reset things, in case this is called in the middle of a game
		$$('.piece').dispose();
		game.players = [];
		
		// import game vars
		
		Object.merge(game, state.gameVars);
		
		// import players
		
		state.players.each(function (player) {
			var player = AbstractFactory.create(player.country, [game.players.length, player.color]);
			Object.merge(player, player.properties);
			game.players.push(player);
		});
		
		// import pieces
		
		state.board.pieces.each(function (piece) {
			var pieceObj = AbstractFactory.create(piece.pieceType, [piece.x, piece.y, piece.side]);
			Object.merge(pieceObj, piece.props);
			$(pieceObj).inject('pieces');
		});
		
		state.graveyard.each(function (piece) {
			var pieceObj = AbstractFactory.create(piece.pieceType, [piece.x, piece.y, piece.side]);
			Object.merge(pieceObj, piece.props);
			$(pieceObj).inject('graveyard');
		});
		
		// import moves list
		
		$('moves').innerHTML = unescape(state.moves);
		this.currentTurn = $$('#moves tr').getLast();
		
		// run any special import events
		
		game.players.each(function (player) {
			player.afterImport();
		})
		
		// kind of like calling startGame(), but without starting a new turn
		this.clearStatus();
		this.movable = true;
		if ($('setup')) { $('setup').dispose(); }
		$('moves').show();
		this.getCurrentPlayer().startTurn();
	}
});

var Player = new Class({
    order: 0, // the player's number, starting from 0
    color: '', // color of the player's pieces

    check: false, // is the player currently in check?
    inGame: true, // is the player currently in the game?
    
    setupPieces: [], // starting setup: 2-dimensional array, where the first row is the bottom row, etc.
    promotionPieces: [], // stores pieces that the player's pawns can promote to, and the number that can
    					 // be on the board at once (0 for infinite)
    derivedPieces: [], // stores pieces that the player has that modify existing pieces
    				   // e.g. [['Bishop', 'AthensBishop']]

    lastMoveType: 'normal', // moveType of last Piece moved by this player

   /*
     * Creates a new player with the given order and color
     */
    initialize: function(order, color) {
        this.order = order;
        this.color = color;
    },
    
    /*
     * Sets up the player's pieces
     */
    setup: function() {
    	var player = this;
    	var rowNum = 1, colNum;
    	this.setupPieces.each( function (row) {
    		colNum = 1;
    		row.each( function (piece) {
    			player.placePiece(piece, rowNum, colNum);
    			colNum++;
    		});
    		rowNum++;
    	});
    },
    
    /*
     * @params: pieceName = class of the piece
     * 			row, col = location of the piece
     * Places a piece of the given class at the given location
     */
    placePiece: function(pieceName, row, col) {
    	var piece;
    	switch (this.order) {
	    	case 0:
	    		piece = AbstractFactory.create(pieceName, [col, row, this.order]);
	    		break;
	    	case 1:
	    		piece = AbstractFactory.create(pieceName, [row, 9 - col, this.order]);
	    		break;
			case 2:
				piece = AbstractFactory.create(pieceName, [9 - col, 9 - row, this.order]);
	    		break;
			case 3:
				piece = AbstractFactory.create(pieceName, [9 - row, col, this.order]);
	    		break;
    	}
    	$(piece).inject('pieces');
    },
    
    /*
     * @params: defeatingPlayer = the player that defeated this player
     * Called when this player is defeated
     */
    defeated: function(defeatingPlayer) {
    	// status
    	
    	this.inGame = false;
    	
    	// transfer possession
    	
    	$$('#board .piece.' + this.color).each(function (piece) {
    		piece.object.transferPossession(defeatingPlayer);
    	});
    	
    	// merge promotionPieces
    	
    	var newPromotionPieces = this.promotionPieces.filter(function (promotionPiece) {
    		return !defeatingPlayer.promotionPieces.some(function (existingPiece) {
    			return existingPiece[0] == promotionPiece[0]; // not already in promotionPieces
    		}) && !defeatingPlayer.derivedPieces.some(function (derivedPiece) {
    			return derivedPiece[0] == promotionPiece[0]; // doesn't have any derived pieces
    		});
    	});
    	defeatingPlayer.promotionPieces.append(newPromotionPieces);
    	
    	// alert
    	
    	game.alert(this.color.capitalize() + ' has been defeated.');
    },
    
    /*
     * Starts the player's turn.
     */
    startTurn: function() {
    	// Skip turn if not in game
    	if (!this.inGame) {
     		game.displayMove('--');
       		game.nextPlayer();
    	}
    	
    	// Update "to move"
    	var toMove = $('toMove');
    	toMove.innerHTML = this.color.capitalize() + ' to move.';
    	toMove.erase("class");
    	toMove.addClass(this.color);
    },
    
    /*
     * @params: piece = the Piece that was moved this turn
     * @return true if game can continue, false if waiting for input
     * Called after the player moves. 
     */
    
    afterMove: function(piece) {
    	this.lastMoveType = piece.moveType;
    	game.lastPieceMoved = piece;
    	return true;
    },
    
    /*
     * @params: piece = the Piece that was moved this turn
     * Ends the player's turn. 
     */
    
    endTurn: function() {
    	var suffix = game.checkChecks();
        game.getLastMoveText().appendText(suffix);
        game.nextPlayer();
    },
    
    /*
     * @params: piece = the Piece that was received
     * Called when the player takes possession of an opponent's piece
     */
    receivedPiece: function(piece) {
    	this.derivedPieces.each(function (derivedPiece) {
    		if (piece.pieceName == derivedPiece[0]) {
    			piece.transform(derivedPiece[1]);
    		}
    	});
    },
    
    /*
     * @params: pieceName = class of piece
     * @return the number of pieces of the given class this player currently
     * has on the board
     */
    countPieces: function(pieceName) {
    	return $$('#board .' + this.color).filter(function (piece) {
    		return (piece.object.pieceName == pieceName);
    	}).length;
    },
    
    /*
     * @params: myPiece = this player's piece being targeted
     * 			capturingPice = opponent's piece
     * @return whether the opponent's piece is allowed to capture the given
     * piece belonging to this player
     */
    capturable: function(myPiece, capturingPiece) {
    	return true; // override this method
    },
    
    export: function() {
    	return {
    		country: this.countryName,
		    color: this.color,
		    properties: {
			    check: this.check,
			    inGame: this.inGame,
			    promotionPieces: this.promotionPieces,
			    lastMoveType: this.lastMoveType
    		}
    	}
    },
    
    afterImport: function() {
    	return; // override this method
    }
});

var Square = new Class({
    x: 0,
    y: 0, // position of the square on the board, from (1,1) at bottom-left to (8,8)

    /*
     * Creates a square at the given position
     */
    initialize: function(x, y) {
        this.x = x;
        this.y = y;

        this.element = new Element('div', {
            'class': 'square',
        });
        this.element.object = this;

        this.element.setStyle('left', ((this.x - 1) * squareSize) + 'px');
        this.element.setStyle('top', ((8 - this.y) * squareSize) + 'px');
        if ((this.x + this.y) % 2 == 0) {
            this.element.addClass('white');
        } else {
            this.element.addClass('black');
        }
    },

    /*
     * @return the HTML element corresponding to this square 
     */
    toElement: function() {
        return this.element;
    },
    
    /*
     * @return the algebraic notation corresponding to this square's position
     */
    toString: function() {
    	return String.fromCharCode('a'.charCodeAt(0) - 1 + this.x) + this.y;
    },

    /*
     * @params: square = another Square
     * @return whether this square and the given square share the same position
     */
    equals: function(square) {
        return (this.x == square.x && this.y == square.y);
    },
    
    /*
     * @params: square = another Square
     * @return the distance (in horizontal/vertical movements) between 
     * this square and the given square
     */
    distance: function(square) {
    	return (Math.abs(this.x - square.x) + Math.abs(this.y - square.y));
    },

    /*
     * @return the Piece currently occupying this square or null if the square is empty
     */
    getPiece: function() {
        var square = this;
        var occupied = null;
        $$('#board .piece').each(function(piece) {
            if (piece.object.x == square.x && piece.object.y == square.y) {
                occupied = piece;
            }
        });
        if (occupied) {
            return occupied.object;
        } else {
            return null;
        }
    },
    
    /*
     * @params: xOffset, yOffset specify a relative position to this square
     * @return the square that is xOffset to the right and yOffset above this square
     */
    getAdjacentSquare: function(xOffset, yOffset) {
    	var currentSquare = this;
    	var adjacent = null;
    	$$('#board .square').each(function(square) {
			if (square.object.x == currentSquare.x + xOffset && square.object.y == currentSquare.y + yOffset) {
				adjacent = square;
			}
        });
        if (adjacent) {
			return adjacent.object;
		} else {
			return null;
        }
    },

    /*
     * @params: side = optional parameter specifying the order of the Player we're looking for
     * If side is not specified, @return whether this square is occupied by a piece.
     * If side is specified, @return whether this square is occupied by a piece belonging
     * to the given player.
     */
    isOccupied: function(side) {
        var square = this;
        var query = '#board .piece';
        
        if (!isNaN(side)) {
        	query += '.' + game.getPlayer(side).color;
        } else if (side) {
        	query += '.' + side.color;
        }

        return $$(query).some(function(piece) {
            return piece.object.x == square.x && piece.object.y == square.y;
        });
    },

    /*
     * @params: dest = destination square
     * 			dir = 'horizontal', 'vertical', 'diagonalUp', 'diagonalDown'
     * 			side = optional parameter specifying the order of the Player we're looking for
     * @return whether the line from the current square in the given direction to the
     * given square is occupied at any point (either by any player or by the given player)
     */
    isLineOccupied: function(dest, dir, side) {
        switch (dir) {
        case 'horizontal':
            var minX = Math.min(this.x + 1, dest.x);
            var maxX = Math.max(this.x - 1, dest.x);
            for (var i = minX; i <= maxX; i++) {
                var square = new Square(i, this.y);
                if (square.isOccupied(side) ||
                		(((i != maxX && i > this.x) || (i != minX && i < this.x)) && square.isOccupied())) {
                    return true;
                }
            }
            break;
        case 'vertical':
            var minY = Math.min(this.y + 1, dest.y);
            var maxY = Math.max(this.y - 1, dest.y);
            for (var j = minY; j <= maxY; j++) {
                var square = new Square(this.x, j);
                if (square.isOccupied(side) ||
                		(((j != maxY && j > this.y) || (j != minY && j < this.y)) && square.isOccupied())) {
                    return true;
                }
            }
            break;
        case 'diagonalUp':
            var minX = Math.min(this.x + 1, dest.x);
            var maxX = Math.max(this.x - 1, dest.x);
            for (var i = minX; i <= maxX; i++) {
                var square = new Square(i, this.y - this.x + i);
                if (square.isOccupied(side) ||
                		(((i != maxX && i > this.x) || (i != minX && i < this.x)) && square.isOccupied())) {
                    return true;
                }
            }
            break;
        case 'diagonalDown':
            var minX = Math.min(this.x + 1, dest.x);
            var maxX = Math.max(this.x - 1, dest.x);
            for (var i = minX; i <= maxX; i++) {
                var square = new Square(i, this.y + this.x - i);
                if (square.isOccupied(side) ||
                		(((i != maxX && i > this.x) || (i != minX && i < this.x)) && square.isOccupied())) {
                    return true;
                }
            }
            break;
        }
        return false;
    },
    
    /*
     * @params: sides = Players to check
     * @return: whether this square is being threatened by a piece belonging to
     * any of the given players
     */
    isThreatenedBy: function(sides) {
    	var square = this;
    	var isThreatened = false;
    	
    	Array.from(sides).each( function (side) {
	    	if ($$('#board .piece.' + side.color).some (function (piece) {
				return piece.object.canMove(square);
			})) {
	    		isThreatened = true;
	    	}
    	});
		
		this.assumeOccupied = false;
		return isThreatened;
    },

    /*
     * @params: dest = destination Square
     * 			dir = direction the pawn moves in (corresponds to player order: 0 = up, etc)
     * @returns whether a pawn could move from here to dest as a regular pawn move
     */
    isPawnMove: function(dest, dir) {
    	switch (dir) {
    	case 0:
    		return (!dest.isOccupied() && dest.x == this.x && dest.y == this.y + 1);
    	case 1:
    		return (!dest.isOccupied() && dest.y == this.y && dest.x == this.x + 1);
    	case 2:
    		return (!dest.isOccupied() && dest.x == this.x && dest.y == this.y - 1);
    	case 3:
    		return (!dest.isOccupied() && dest.y == this.y && dest.x == this.x - 1);
    	}
    },

    /*
     * @params: dest = destination Square
     * 			dir = direction the pawn moves in (corresponds to player order: 0 = up, etc)
     * @returns whether a pawn could move from here to dest as a double-pawn move
     */
    isPawnDoubleMove: function(dest, dir) {
    	switch (dir) {
    	case 0:
    		return (this.y == 2 && dest.y == 4 && dest.x == this.x && !dest.isOccupied() && !(new Square(this.x, 3)).isOccupied());
    	case 1:
    		return (this.x == 2 && dest.x == 4 && dest.y == this.y && !dest.isOccupied() && !(new Square(3, this.y)).isOccupied());
    	case 2:
    		return (this.y == 7 && dest.y == 5 && dest.x == this.x && !dest.isOccupied() && !(new Square(this.x, 6)).isOccupied());
    	case 3:
    		return (this.x == 7 && dest.x == 5 && dest.y == this.y && !dest.isOccupied() && !(new Square(6, this.y)).isOccupied());
    	}
    },

    /*
     * @params: dest = destination Square
     * 			dir = direction the pawn moves in (corresponds to player order: 0 = up, etc)
     * @returns whether a pawn could capture from here to dest
     */
    isPawnCapture: function(dest, dir, side) {
    	if (dest.isOccupied() && !dest.isOccupied(side)) {
	    	switch (dir) {
	    	case 0:
	    		return ((dest.x == this.x + 1 || dest.x == this.x - 1) && dest.y == this.y + 1);
	    	case 1:
	    		return ((dest.y == this.y + 1 || dest.y == this.y - 1) && dest.x == this.x + 1);    	
	    	case 2:
	    		return ((dest.x == this.x + 1 || dest.x == this.x - 1) && dest.y == this.y - 1);
	    	case 3:
	    		return ((dest.y == this.y + 1 || dest.y == this.y - 1) && dest.x == this.x - 1);
	    	}
    	} else {
    		return false;
    	}
    },

    /*
     * @params: dest = destination Square
     * 			side = order of the given piece's owner
     * @returns whether a knight could move from here to dest
     */
    isKnightMove: function(dest, side) {
        var x1 = this.x,
            x2 = dest.x,
            y1 = this.y,
            y2 = dest.y;
        return (!dest.isOccupied(side) && (((y2 == y1 + 2 || y2 == y1 - 2) && (x2 == x1 + 1 || x2 == x1 - 1)) || ((y2 == y1 + 1 || y2 == y1 - 1) && (x2 == x1 + 2 || x2 == x1 - 2))));
    },

    /*
     * @params: dest = destination Square
     * 			side = order of the given piece's owner
     * @returns whether there is a valid diagonal move from here to dest
     */
    isBishopMove: function(dest, side) {
        return ((dest.y - dest.x == this.y - this.x && !this.isLineOccupied(dest, 'diagonalUp', side)) || (dest.x + dest.y == this.x + this.y && !this.isLineOccupied(dest, 'diagonalDown', side)));
    },
    
    /*
     * @params: dest = destination Square
     * 			side = order of the given piece's owner
     * 			length = jump length
     * @returns whether there is a valid diagonal jump of the given length from here to dest
     */
    isBishopJump: function(dest, side, length) {
    	var x1 = this.x,
	        x2 = dest.x,
	        y1 = this.y,
	        y2 = dest.y;
    	return !dest.isOccupied(side) && 
	    		   (x2 == x1 + length || x2 == x1 - length) && 
	    		   (y2 == y1 - length || y2 == y1 + length);
    },

    /*
     * @params: dest = destination Square
     * 			side = order of the given piece's owner
     * @returns whether there is a valid lateral move from here to dest
     */
    isRookMove: function(dest, side) {
        return ((dest.y == this.y && !this.isLineOccupied(dest, 'horizontal', side)) || (dest.x == this.x && !this.isLineOccupied(dest, 'vertical', side)));
    },
    
    /*
     * @params: dest = destination Square
     * 			side = order of the given piece's owner
     * 			length = jump length
     * @returns whether there is a valid lateral jump of the given length from here to dest
     */
    isRookJump: function(dest, side, length) {
    	var x1 = this.x,
	        x2 = dest.x,
	        y1 = this.y,
	        y2 = dest.y;
    	return !dest.isOccupied(side) && 
					((x2 == x1 && (y2 == y1 - length || y2 == y1 + length)) || 
					 (y2 == y1 && (x2 == x1 - length || x2 == x1 + length)));
    },

    /*
     * @params: dest = destination Square
     * 			side = order of the given piece's owner
     * @returns whether a king could move from here to dest
     */
    isKingMove: function(dest, side) {
        return (!dest.isOccupied(side) && (dest.x == this.x || dest.x == this.x - 1 || dest.x == this.x + 1) && (dest.y == this.y || dest.y == this.y - 1 || dest.y == this.y + 1));
    },
    
    /*
     * @returns the number of the player whose 2x4 starting region this square
     * is in, or -1 if the square is not in a 2x4 starting region
     */
    inTwoByFour: function() {
    	if (this.x <= 4 && this.y <= 2) {
    		return 0;
    	} else if (this.x <= 2 && this.y >= 5) {
    		return 1;
    	} else if (this.x >= 5 && this.y >= 7) {
    		return 2;
    	} else if (this.x >= 7 && this.y <= 4) {
    		return 3;
    	} else {
    		return -1;
    	}
    },
});

var Piece = new Class({
    x: 0,
    y: 0, // position of the piece on the board, from (1,1) at bottom-left to (8,8)
    
    pieceClass: '', // class name of the piece
    pieceName: '', // base name of the piece 
    pieceChar: '', // the piece's character representation in algebraic notation
    side: null, // the order of this piece's owner
    color: null, // color of the piece's image
    
    moved: false, // has this piece moved?
    lastPosition: null, // the Square this piece was in last, or null
    lastCapture: null, // the piece this piece captured last, or null
    
    drag: null, // drag event handler
    moveType: 'normal', // used by: Pawn, King, etc
    royal: false, // royal pieces: King
    specialProperties: {}, // holds special properties pertaining to powers

    //
    // SETUP
    //
    
    /*
     * Creates a piece with the given position and owner
     */
    initialize: function(x, y, side) {
		if (!game) {return;}
	
        this.x = x;
        this.y = y;
        this.side = side;
        this.color = game.players[side].color;
        
    	this.element = new Element('img', {
            'class': 'piece'
        });
        this.element.object = this;

        this.setImage();
        this.addDragEvent();
        
        if (Browser.ie || Browser.chrome) {
        	this.element.addClass('customCursor');
        }
    },

    /*
     * Refreshes this piece's position on the board and sets any relevant CSS classes
     */
    refresh: function() {
        this.element.setStyle('left', ((this.x - 1) * squareSize) + 'px');
        this.element.setStyle('top', ((8 - this.y) * squareSize) + 'px');
        
        if (this.royal) {
        	this.element.addClass('royal');
        }
    },

    /*
     * Sets the piece's image
     */
    setImage: function() {
        this.element.addClass(this.color);
        this.element.setProperty('src', 'images/pieces/' + this.pieceName + '_' + this.color + '.png');
    },
    
    /*
     * Creates the piece's drag event
     */
    addDragEvent: function() {
    	this.drag = this.toElement().makeDraggable({
    	    droppables: $$('.square'),
    	
    	    // called when the piece is picked up
    	    onStart: function(draggable) {
    			if (!game.movable) {
    				return false;
    			}
    		
    			draggable.pushToFront();
    	        draggable.addClass('grabbing');
    	        
    	        var piece = draggable.object;
    	        
    	        $$('.square').each(function (droppable) {
    	        	var square = droppable.object;
    	        	
    	        	if (piece.canMove(square) 
    	        			&& (!square.isOccupied() || piece.canCapture(square.getPiece()))) {
    	        		droppable.addClass('hoverBlue');
    	        	}
    	        })
    	    },
    	
    	    // called when the piece is dragged over a square
    	    onEnter: function(draggable, droppable) {
    	    	if (!game.movable) {
    				return false;
    			}
    	    	
    	        $$('.square').removeClass('hoverGreen').removeClass('hoverRed');
    	
    	        var piece = draggable.object;
    	
    	        if (droppable && !piece.getSquare().equals(droppable.object)) {
    	        	if (piece.side == game.currentPlayer 
    	            		&& piece.canMove(droppable.object)
    	            		&& (!droppable.object.isOccupied() || piece.canCapture(droppable.object.getPiece()))) {
    	                droppable.addClass('hoverGreen');
    	            } else {
    	                droppable.addClass('hoverRed');
    	            }
    	        }
    	    },
    	
    	    // called when the piece is dropped in a square
    	    onDrop: function(draggable, droppable) {
    	    	if (!game.movable) {
    	    		draggable.object.refresh();
    				return false;
    			}
    	    	
    	        $$('.square').removeClass('hoverGreen').removeClass('hoverRed').removeClass('hoverBlue');
    	        draggable.removeClass('grabbing');
    	
    	        var piece = draggable.object;
    	
    	        if (droppable 
    	        		&& piece.side == game.currentPlayer 
    	        		&& piece.canMove(droppable.object)
    	        		&& (!droppable.object.isOccupied() || piece.canCapture(droppable.object.getPiece()))) {
    	            var moveTxt = piece.moveTo(droppable.object);
    	            game.displayMove(moveTxt);
    	            
    	            piece.afterMove();
    	            if (game.getCurrentPlayer().afterMove(piece)) {
    	            	game.getCurrentPlayer().endTurn();
    	            }
    	        } else {
    	            piece.refresh();
    	        }
    	    }
    	});
    },

    //
    // GETTERS
    //
    
    /*
     * @return the HTML element corresponding to this piece
     */
    toElement: function() {
        this.refresh();
        return this.element;
    },

    /*
     * @return the square this piece is in
     */
    getSquare: function() {
    	var x = this.x; var y = this.y;
    	return $$('#board .square').filter(function (square) {
    		return (square.object.x == x && square.object.y == y);
    	})[0].object;
    },
    
    /*
     * @return the Player who controls this piece
     */
    getOwner: function(player) {
    	return game.getPlayer(this.side);
    },
        
    //
    // MOVEMENT
    //
    
    /*
     * @params: square = destination Square
     * @return whether this piece can move to the given square
     */
    canMove: function(square) {
        return true; // override this method
    },

    /*
     * @params: square = destination Square
     * @return whether this piece would place any player in check after
     * moving to the given square
     */
    isMoveCheck: function(square) {
    	var piece = this;
    	var oldX = this.x, oldY = this.y;
    	this.x = square.x; this.y = square.y;
    		
    	var result = game.players.some(function (player) {
    		return $$('#board .royal.' + player.color).length == 1 && 
    			   $$('#board .royal.' + player.color).some(function(royalPiece) {
    			return piece.canMove(royalPiece.object.getSquare());
    		});
    	});
    	
    	this.x = oldX; this.y = oldY;
    	return result;
    },

    /*
     * @params: square = destination Square
     * @return move's algebraic notation
     * Moves the piece to the given square, handles capture if there is any.
     */
    moveTo: function(square, type) {
        // Set up algebraic notation
    	
    	var startStr = this.getSquare().toString();
    	var destStr = square.toString();
    	var verb = '-';
        
        // Handle capture, special move
        
    	this.lastCapture = null;
        if (square.isOccupied()) {
        	verb = 'x';
            this.capture(square.getPiece());
        }
        
        // Apply the move

        this.lastPosition = this.getSquare();
        this.x = square.x;
        this.y = square.y;
        this.refresh();

    	// Return algebraic notation
    	
    	return this.pieceChar + startStr + verb + destStr;
    },
    
    /*
     * Called after a piece is moved by a player.
     */
    afterMove: function() {
    	// override this method
    },
    
    //
    // CAPTURE
    //
    
    /*
     * @params: piece = target Piece
     * @return whether this piece can capture the given piece
     * By default, asks the player
     */
    canCapture: function(piece) {
    	return piece.getOwner().capturable(piece, this);
    },

    /*
     * @params: piece = target Piece
     * Captures the given piece.
     */
    capture: function(piece) {
    	this.lastCapture = piece;
        piece.captured();
        piece.element.inject('graveyard');
    },
    
    /*
     * Called when this piece is captured.
     */
    captured: function() {
    	this.drag.detach();
    },
    
    //
    // MISC
    //
    
    /*
     * @return whether this piece is the last royal piece belonging to a player
     */
    isRoyal: function() {
    	return this.royal && ($$('#board .piece.royal.' + this.getOwner().color).length == 1);
    },
    
    /*
     * @return whether this piece is royal and currently in check
     */
	inCheck: function() {
		if (!this.isRoyal()) {
			return false;
		} else {
			return this.getSquare().isThreatenedBy(game.getOtherPlayers(this.side));
		}
    },
    
    /*
     * @params: player = Player to give this piece to
     * Transfers control of this piece to another player.
     */
    transferPossession: function(player) {
        this.element.removeClass(this.color);

        this.side = player.order;
        this.color = player.color;
        
        this.setImage();
        
        var newPiece = this.transform(this.pieceName); // transform to base piece ...
        this.getOwner().receivedPiece(newPiece); // ... and possibly to player-specific piece
    },
    
    /*
     * @params: pieceName = class name of piece to transform into
     * "Transforms" this piece into a piece of the given type.
     * @return the Piece that was created
     */
    transform: function(pieceName) {
    	this.element.dispose();
    	
    	var newPiece = AbstractFactory.create(pieceName, [this.x, this.y, this.side]);
    	$(newPiece).inject('pieces');
    	newPiece.specialProperties = this.specialProperties;
    	return newPiece;
    },
    
    export: function() {
    	return {
    		x: this.x,
    		y: this.y,
    		pieceType: this.pieceClass,
    		side: this.side,
    		props: {
    			specialProperties: Object.clone(this.specialProperties)
    		}
    	};
    }
});