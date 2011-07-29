//
// GLOBAL VARIABLES
//

var squareSize = 48;
var z = 100;

//
// CLASS OVERRIDES
//

Element.implement({
    object: null,

    pushToFront: function() {
		this.setStyle('z-index', z++);
    },
    
    show: function() {
        this.setStyle('visibility','visible');
    },
    
    hide: function() {
        this.setStyle('visibility','hidden');
    },
    
    clear: function() {
        this.innerHTML = '';
    }
});

Array.implement({
	// we override the usual Array.toString() function because we want to quote strings
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
	create: function(name, params) {
		return eval('new ' + name + '(' + params.toString() + ');');
	}
});

//
// CLASS DEFINITIONS
//

var Game = new Class({
	players: [],
	currentPlayer: 0,
	currentTurn: null,
	lastPieceMoved: null,
	turnNum: 1,
	
	// setup
	
	initialize: function() {
		
	},
	
	setup: function() {
		// create board
		for (var i = 1; i <= 8; i++) {
			for (var j = 1; j <= 8; j++) {
				$(new Square(i, j)).inject('squares');
			}
		}
	},
	
	addPlayer: function(countryName, color) {
		var order = this.players.length;
		var player = AbstractFactory.create(countryName, [order, color])
		this.players.push(player);
		player.setup();
		$$('#moves .heading.' + color).appendText(player.countryName);
	},
	
	startGame: function() {
		this.turnStart();
		this.playerStart();
	},
	
	// turns and players
	
	getPlayer: function(i) {
		return this.players[i];
	},
    
    getOtherPlayers: function(i) {
		return this.players.filter( function(player) {
    		return player.order != i;
    	});
    },
    
    getCurrentPlayer: function() {
    	return this.getPlayer(this.currentPlayer);
    },
    
    turnStart: function() {
    	this.currentTurn = new Element('tr');
    	new Element('td.num').appendText(this.turnNum).inject(this.currentTurn);
		this.currentTurn.inject('moves');
    },
    
    playerStart: function() {
    	this.getCurrentPlayer().startTurn();
    },
    
	nextPlayer: function() {
    	if (this.currentPlayer == this.players.length - 1) {
    		this.nextTurn();
    		this.currentPlayer = 0;
    	} else {
    		this.currentPlayer++;
    	}
    	
		this.playerStart();
	},
    
    nextTurn: function() {
    	this.turnNum++;
    	this.turnStart();
    },
        
    // game status
	
    alert: function(txt) {
		setTimeout(function () {alert (txt); }, 100)
	},

	checkChecks: function() {
		var game = this;
		var cp = this.getCurrentPlayer();
		var suffix = '';
		
		cp.check = false;
		
		if (this.getOtherPlayers(cp.order).every(function (player) {
			return ($$('#board .royal.' + player.color).length == 0)
		})) {
			game.gameOver(cp);
			suffix = '##';
		} else {
			this.getOtherPlayers(cp.order).each(function(player) {			
				var defeated = ($$('#board .royal.' + player.color).length == 0);
				var check = $$('.royal.' + player.color).every(function (royalPiece) { return royalPiece.object.inCheck(); });
				
				if (defeated) {
					if (player.inGame) {
						player.defeated(cp);
						suffix = '#';
					}
				} else if (check) {
					if (!player.check) {
						player.check = true;
						suffix = '+';
						game.alert('Check!');
					}
				}
			});
		}
		
		return suffix;
	},

	gameOver: function(winner) {
		$$('#board .piece').each(function(piece) {
			piece.object.transferPossession(winner);
			piece.object.drag.detach();
		});
		
		if (typeof(winner) == 'string') {
			var outcomeText = winner;
		} else {
			var outcomeText = winner.color.capitalize() + ' wins.';
		}
		
		var outcome = new Element('div.outcome');
		outcome.appendText(outcomeText);
		setTimeout(function () {outcome.inject('sidebar')}, 100);
	},
	
	// pieces
	
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
	
	displayMove: function(txt) {
		var move = new Element('td.move');
		move.appendText(txt).inject(this.currentTurn);		
	},
		
	getLastMoveText: function() {
		return $$('#moves .move').filter(function (el) {
			return el.innerHTML != '--';
		}).getLast();
	},

	// misc GUI

	hideDialog: function() {
	    $('dialog').clear();
	    $('overlay').hide();
	}
});

var Player = new Class({
    order: 0,
    color: '',
    check: false,
    setupPieces: [],
    promotionPieces: [],
    derivedPieces: [],
    inGame: true,

    initialize: function(order, color) {
        this.order = order;
        this.color = color;
    },
    
    setup: function() {
    	var player = this;
    	var rowNum = 1, colNum;
    	this.setupPieces.each( function (row) {
    		colNum = 1;
    		row.each( function (piece) {
    			player.placePiece(piece, rowNum, colNum, player.order);
    			colNum++;
    		});
    		rowNum++;
    	});
    },
    
    placePiece: function(pieceName, row, col, order) {
    	var piece;
    	switch (order) {
	    	case 0:
	    		piece = AbstractFactory.create(pieceName, [col, row, order]);
	    		break;
	    	case 1:
	    		piece = AbstractFactory.create(pieceName, [row, 9 - col, order]);
	    		break;
			case 2:
				piece = AbstractFactory.create(pieceName, [9 - col, 9 - row, order]);
	    		break;
			case 3:
				piece = AbstractFactory.create(pieceName, [9 - row, col, order]);
	    		break;
    	}
    	$(piece).inject('pieces');
    },
    
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
    
    startTurn: function() {
    	if (!this.inGame) {
     		game.displayMove('--');
       		game.nextPlayer();
    	}
    },
    
    receivedPiece: function(piece) {
    	this.derivedPieces.each(function (derivedPiece) {
    		if (piece.pieceName == derivedPiece[0]) {
    			piece.transform(derivedPiece[1]);
    		}
    	});
    },
    
    countPieces: function(pieceName) {
    	return $$('#board .' + this.color).filter(function (piece) {
    		return (piece.object.pieceName == pieceName);
    	}).length;
    }
});

var Square = new Class({
    x: 0,
    y: 0,

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

    toElement: function() {
        return this.element;
    },
    
    toString: function() {
    	return String.fromCharCode('a'.charCodeAt(0) - 1 + this.x) + this.y;
    },

    equals: function(square) {
        return (this.x == square.x && this.y == square.y);
    },
    
    distance: function(square) {
    	return (Math.abs(this.x - square.x) + Math.abs(this.y - square.y));
    },

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

    isKnightMove: function(dest, side) {
        var x1 = this.x,
            x2 = dest.x,
            y1 = this.y,
            y2 = dest.y;
        return (!dest.isOccupied(side) && (((y2 == y1 + 2 || y2 == y1 - 2) && (x2 == x1 + 1 || x2 == x1 - 1)) || ((y2 == y1 + 1 || y2 == y1 - 1) && (x2 == x1 + 2 || x2 == x1 - 2))));
    },

    isBishopMove: function(dest, side) {
        return ((dest.y - dest.x == this.y - this.x && !this.isLineOccupied(dest, 'diagonalUp', side)) || (dest.x + dest.y == this.x + this.y && !this.isLineOccupied(dest, 'diagonalDown', side)));
    },

    isRookMove: function(dest, side) {
        return ((dest.y == this.y && !this.isLineOccupied(dest, 'horizontal', side)) || (dest.x == this.x && !this.isLineOccupied(dest, 'vertical', side)));
    },

    isKingMove: function(dest, side) {
        return (!dest.isOccupied(side) && (dest.x == this.x || dest.x == this.x - 1 || dest.x == this.x + 1) && (dest.y == this.y || dest.y == this.y - 1 || dest.y == this.y + 1));
    }
});

var Piece = new Class({
    x: 0,
    y: 0,
    pieceName: '',
    pieceChar: '',
    side: null,
    color: null,
    
    moved: false,
    lastPosition: null,
    lastCapture: null,
    
    drag: null, // drag event handler
    moveType: 'normal', // used by: Pawn, King, etc
    royal: false, // royal pieces: King
    specialProperties: {},

    // setup
    
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

    refresh: function() {
        this.element.setStyle('left', ((this.x - 1) * squareSize) + 'px');
        this.element.setStyle('top', ((8 - this.y) * squareSize) + 'px');
        
        if (this.royal) {
        	this.element.addClass('royal');
        }
    },

    setImage: function() {
        this.element.addClass(this.color);
        this.element.setProperty('src', 'images/pieces/' + this.pieceName + '_' + this.color + '.png');
    },
    
    addDragEvent: function() {
    	this.drag = this.toElement().makeDraggable({
    	    droppables: $$('.square'),
    	
    	    onStart: function(draggable) {
    			draggable.pushToFront();
    	        draggable.addClass('grabbing');
    	        
    	        var piece = draggable.object;
    	        
    	        $$('.square').each(function (droppable) {
    	        	square = droppable.object;
    	        	
    	        	if (piece.canMove(square)) {
    	        		droppable.addClass('hoverBlue');
    	        	}
    	        })
    	    },
    	
    	    onEnter: function(draggable, droppable) {
    	        $$('.square').removeClass('hoverGreen').removeClass('hoverRed');
    	
    	        var piece = draggable.object;
    	
    	        if (droppable && !piece.getSquare().equals(droppable.object)) {
    	            if (piece.side == game.currentPlayer && piece.canMove(droppable.object)) {
    	                droppable.addClass('hoverGreen');
    	            } else {
    	                droppable.addClass('hoverRed');
    	            }
    	        }
    	    },
    	
    	    onDrop: function(draggable, droppable) {
    	        $$('.square').removeClass('hoverGreen').removeClass('hoverRed').removeClass('hoverBlue');
    	        draggable.removeClass('grabbing');
    	
    	        var piece = draggable.object;
    	
    	        if (droppable && piece.side == game.currentPlayer && piece.canMove(droppable.object)) {
    	            piece.moveTo(droppable.object);
    	            piece.afterMove();
    	        } else {
    	            piece.refresh();
    	        }
    	    }
    	});
    },

    // getters
    
    toElement: function() {
        this.refresh();
        return this.element;
    },

    getSquare: function() {
        return new Square(this.x, this.y);
    },
    
    getOwner: function(player) {
    	return game.getPlayer(this.side);
    },
    
    // movement

    canMove: function(square) {
        return true; // override this method
    },

    isMoveCheck: function(square) {
    	var piece = this;
    	var oldX = this.x, oldY = this.y;
    	this.x = square.x; this.y = square.y;
    		
    	var result = $$('#board .royal').some(function(royalPiece) {
			return piece.canMove(royalPiece.object.getSquare());
		});
    	
    	this.x = oldX; this.y = oldY;
    	return result;
    },

    moveTo: function(square, type) {
        if (!this.getSquare().equals(square)) {
        	// For algebraic notation
        	
        	var startStr = this.getSquare().toString();
        	var destStr = square.toString();
        	var verb = '-'; var suffix = '';
            
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

            if (type != 'free') {
                // Check checks
            	
            	suffix += game.checkChecks();
            	
            	// Display algebraic notation
            	
            	if (verb == '0-0' || verb == '0-0-0') {
					game.displayMove(verb);
				} else {
					game.displayMove(this.pieceChar + startStr + verb + destStr + suffix);
            	}
            	
            	// Change game vars
            	
            	game.lastPieceMoved = this;
	            game.nextPlayer();
            }
        }
    },
    
    afterMove: function() {
    	// override this method
    },
     
    // capture

    canCapture: function(piece) {
    	return this.canMove(piece.getSquare());
    },

    capture: function(piece) {
    	this.lastCapture = piece;
        piece.captured();
        piece.element.inject('graveyard');
    },
    
    captured: function() {
    	this.drag.detach();
    },
    
    // misc
    
	inCheck: function() {
		if (!this.royal) {
			return false;
		} else {
			return this.getSquare().isThreatenedBy(game.getOtherPlayers(this.side));
		}
    },
    
    transferPossession: function(player) {
        this.element.removeClass(this.color);

        this.side = player.order;
        this.color = player.color;
        
        this.setImage();
        
        var newPiece = this.transform(this.pieceName); // transform to base piece ...
        this.getOwner().receivedPiece(newPiece); // ... and possibly to player-specific piece
    },
    
    transform: function(pieceName) {
    	this.element.dispose();
    	
    	var newPiece = AbstractFactory.create(pieceName, [this.x, this.y, this.side]);
    	$(newPiece).inject('pieces');
    	newPiece.properties = this.properties;
    	return newPiece;
    },
});