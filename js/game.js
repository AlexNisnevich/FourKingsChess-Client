//
// GLOBAL VARIABLES
//

var squareSize = 48;
var z = 100;

//
// CLASS DEFINITIONS
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

var Game = new Class({
	players: null,
	currentPlayer: null,
	currentTurn: null,
	lastPieceMoved: null,
	turnNum: 0,
	
	initialize: function() {
		
	},

	alert: function(txt) {
		setTimeout(function () {alert (txt); }, 100)
	},

	checkChecks: function(currentPlayer) {
		var game = this;
		var suffix = '';
		
		currentPlayer.check = false;
		currentPlayer.getOtherPlayers().each(function(player) {			
			var check = $$('.royal.' + player.color).every(function (royalPiece) { return royalPiece.object.inCheck(); });
			var canMove = $$('#board .piece.' + player.color).some(function (piece) { return piece.object.hasAvailableMoves(); });

			if (check && !canMove) {
				game.alert('Checkmate!');
				game.gameOver(player.getOtherPlayers()[0]);
				suffix = '#';
			} else if (check) {
				if (!player.check) {
					player.check = true;
					game.alert('Check!');
				}
				suffix = '+';
			} else if (!canMove) {
				game.alert('Stalemate!');
				game.gameOver('Stalemate.');
			}
		});
		
		return suffix;
	},
	
	isCheckOn: function(player) {
		return !$$('.royal.' + player.color).every(function (royalPiece) { return royalPiece.object.inCheck(); });
	},
	
	displayMove: function(txt) {
		if ((game.currentPlayer.order + 1) % 2 == 0) {
			this.nextTurn();
		}

		var move = new Element('div.move');
		move.appendText(txt).inject(this.currentTurn);		
	},
	
	nextPlayer: function() {
		var nextIndex = (game.currentPlayer.order + 1) % 2;
		this.currentPlayer = this.players[nextIndex];
	},
    
    nextTurn: function() {
    	this.turnNum++;
    	this.currentTurn = new Element('div.turn');
    	new Element('div.num').appendText(this.turnNum).inject(this.currentTurn);
		this.currentTurn.inject('moves');
    },
	
	gameOver: function(winner) {
		$$('#board .piece').each(function(piece) {
			piece.object.drag.detach();
		});
		
		if (typeof(winner) == 'string') {
			var outcomeText = winner;
		} else {
			var outcomeText = winner.color.charAt(0).toUpperCase() + winner.color.slice(1) + ' wins.';
		}
		
		var outcome = new Element('div.outcome');
		outcome.appendText(outcomeText);
		setTimeout(function () {outcome.inject('moves')}, 100);
	},
	
	getLastMoveText: function() {
		return $$('#moves .move').getLast();
	},
	
	doPromote: function(choice) {
	    var pawn = this.lastPieceMoved;
	    choice.element.inject('pieces');
    	pawn.element.dispose();
    	game.getLastMoveText().appendText('=' + choice.pieceChar);
    	
    	this.hideDialog();
	},
	
	hideDialog: function() {
	    $('dialog').clear();
	    $('overlay').hide();
	},
	
	createPiece: function(name, params) {
	    return eval('new ' + name + '(' + params.toString() + ');');
	}
});

var Player = new Class({
    order: 0,
    color: '',
    check: false,
    promotionPieces: null,

    initialize: function(order, color) {
        this.order = order;
        this.color = color;
        this.promotionPieces = ['Queen', 'Rook', 'Bishop', 'Knight'];
    },
    
    getOtherPlayers: function() {
    	var ord = this.order;
    	return game.players.filter( function(player) {
    		return player.order != ord;
    	});
    }
});

var Square = new Class({
    x: 0,
    y: 0,
    
    assumeOccupied: false, // temporarily disables isOccupied check for isPawnCapture

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

    isOccupied: function(sides, testingPawnCapture) {
        var square = this;
        var occupied = false;
        
        if (testingPawnCapture && this.assumeOccupied) {
        	return true;
        }

        if (!sides) {
        	sides = [null];
        }
        
        Array.from(sides).each( function (side) {
    		var query = '#board .piece';
    		
            if (side) {
                query += '.' + side.color;
            }

            $$(query).each(function(piece) {
                if (piece.object.x == square.x && piece.object.y == square.y) {
                    occupied = piece.object;
                }
            });
    	})

        return occupied;
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
    	this.assumeOccupied = true;
    	
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

    isPawnMove: function(dest, side) {
        if (side == white) {
            return (!dest.isOccupied() && dest.x == this.x && dest.y == this.y + 1);
        } else {
            return (!dest.isOccupied() && dest.x == this.x && dest.y == this.y - 1);
        }
    },

    isPawnDoubleMove: function(dest, side) {
        if (side == white) {
            return (this.y == 2 && dest.y == 4 && dest.x == this.x && !dest.isOccupied() && !(new Square(this.x, 3)).isOccupied(0));
        } else {
            return (this.y == 7 && dest.y == 5 && dest.x == this.x && !dest.isOccupied() && !(new Square(this.x, 6)).isOccupied(0));
        }
    },

    isPawnCapture: function(dest, side) {
        if (side == white) {
            return (dest.isOccupied(black, true) && (dest.x == this.x + 1 || dest.x == this.x - 1) && dest.y == this.y + 1);
        } else {
            return (dest.isOccupied(white, true) && (dest.x == this.x + 1 || dest.x == this.x - 1) && dest.y == this.y - 1);
        }
    },
    
    isPawnEnPassant: function(dest, side) {
    	if (side == white) {
    		target = dest.getAdjacentSquare(0, -1) ? dest.getAdjacentSquare(0, -1).isOccupied(black) : null;
			return (target && target == game.lastPieceMoved && target.moveType == 'double' && (dest.x == this.x + 1 || dest.x == this.x - 1) && this.y == 5 && dest.y == 6);
		} else {
			target = dest.getAdjacentSquare(0, 1) ? dest.getAdjacentSquare(0, 1).isOccupied(white) : null;
			return (target && target == game.lastPieceMoved && target.moveType == 'double' && (dest.x == this.x + 1 || dest.x == this.x - 1) && this.y == 4 && dest.y == 3);
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
    },
    
    isKingCastleKingside: function(dest, side) {
    	if (side == white) {
    		if (this.x == 5 && this.y == 1 && dest.x == 7 && dest.y == 1 && 
    			this.isOccupied(white) && this.getPiece().pieceName == 'king' &&
    			!dest.isOccupied() && !dest.getAdjacentSquare(-1, 0).isOccupied() &&
    			dest.getAdjacentSquare(1, 0).isOccupied(white) && dest.getAdjacentSquare(1, 0).getPiece().pieceName == 'rook') {
			    	var king = this.getPiece();
			    	var rook = dest.getAdjacentSquare(1, 0).getPiece();
			    	return (!king.inCheck() &&
			    			!king.moved && !rook.moved && 
			    			!dest.isThreatenedBy(black) && !dest.getAdjacentSquare(-1, 0).isThreatenedBy(black));
    		} else {
    			return false;
    		}
    	} else {
    		if (this.x == 5 && this.y == 8 && dest.x == 7 && dest.y == 8 && 
    			this.isOccupied(black) && this.getPiece().pieceName == 'king' &&
    			!dest.isOccupied() && !dest.getAdjacentSquare(-1, 0).isOccupied() &&
    			dest.getAdjacentSquare(1, 0).isOccupied(black) && dest.getAdjacentSquare(1, 0).getPiece().pieceName == 'rook') {
					var king = this.getPiece();
			    	var rook = dest.getAdjacentSquare(1, 0).getPiece();
					return (!king.inCheck() &&
							!king.moved && !rook.moved && 
							!dest.isThreatenedBy(white) && !dest.getAdjacentSquare(-1, 0).isThreatenedBy(white));
			} else {
				return false;
    		}
    	}
    },
    
    isKingCastleQueenside: function(dest, side) {
    	if (side == white) {
			if (this.x == 5 && this.y == 1 && dest.x == 3 && dest.y == 1 && 
				this.isOccupied(white) && this.getPiece().pieceName == 'king' &&
				!dest.isOccupied() && !dest.getAdjacentSquare(1, 0).isOccupied() && !dest.getAdjacentSquare(-1, 0).isOccupied() &&
				dest.getAdjacentSquare(-2, 0).isOccupied(white) && dest.getAdjacentSquare(-2, 0).getPiece().pieceName == 'rook') {
					var king = this.getPiece();
					var rook = dest.getAdjacentSquare(-2, 0).getPiece();
					return (!king.inCheck() &&
							!king.moved && !rook.moved && 
							!dest.isThreatenedBy(black) && !dest.getAdjacentSquare(1, 0).isThreatenedBy(black));
			} else {
				return false;
			}
		} else {
			if (this.x == 5 && this.y == 8 && dest.x == 3 && dest.y == 8 && 
				this.isOccupied(black) && this.getPiece().pieceName == 'king' &&
				!dest.isOccupied() && !dest.getAdjacentSquare(1, 0).isOccupied() && !dest.getAdjacentSquare(-1, 0).isOccupied() &&
				dest.getAdjacentSquare(-2, 0).isOccupied(black) && dest.getAdjacentSquare(-2, 0).getPiece().pieceName == 'rook') {
					var king = this.getPiece();
					var rook = dest.getAdjacentSquare(-2, 0).getPiece();
					return (!king.inCheck() &&
							!king.moved && !rook.moved && 
							!dest.isThreatenedBy(white) && !dest.getAdjacentSquare(1, 0).isThreatenedBy(white));
			} else {
				return false;
			}
    	}
    }
});

var Piece = new Class({
    x: 0,
    y: 0,
    pieceName: '',
    pieceChar: '',
    side: null,
    
    moved: false,
    lastPosition: null,
    lastCapture: null,
    
    drag: null, // drag event handler
    moveType: 'normal', // used by: Pawn, King
    royal: false, // royal pieces: King

    initialize: function(x, y, side) {
        this.x = x;
        this.y = y;
        this.side = side;

        this.element = new Element('img', {
            'class': 'piece',
        });
        this.element.object = this;

        this.setImage();
        this.addDragEvent();
        
        if (Browser.ie || Browser.chrome) {
        	this.element.addClass('customCursor');
        }
    },

    toElement: function() {
        this.refresh();
        return this.element;
    },

    setImage: function() {
        if (this.side) {
            this.element.addClass(this.side.color);
            this.element.setProperty('src', 'images/pieces/' + this.pieceName + '_' + this.side.color + '.png');
        }
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
    	        	
    	        	if (piece.canMove(square) && piece.safeToMove(droppable.object)) {
    	        		droppable.addClass('hoverBlue');
    	        	}
    	        })
    	    },
    	
    	    onEnter: function(draggable, droppable) {
    	        $$('.square').removeClass('hoverGreen').removeClass('hoverRed');
    	
    	        var piece = draggable.object;
    	
    	        if (droppable && !piece.getSquare().equals(droppable.object)) {
    	            if (piece.side == game.currentPlayer && piece.canMove(droppable.object) && piece.safeToMove(droppable.object)) {
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
    	
    	        if (droppable && piece.side == game.currentPlayer && piece.canMove(droppable.object) && piece.safeToMove(droppable.object)) {
    	            piece.moveTo(droppable.object);
    	            piece.afterMove();
    	        } else {
    	            piece.refresh();
    	        }
    	    }
    	});
    },

    refresh: function() {
        this.element.setStyle('left', ((this.x - 1) * squareSize) + 'px');
        this.element.setStyle('top', ((8 - this.y) * squareSize) + 'px');
        
        if (this.royal) {
        	this.element.addClass('royal');
        }
    },

    getSquare: function() {
        return new Square(this.x, this.y);
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
            } else if (this.moveType == 'enPassant') {
            	verb = 'x';
            	suffix = ' e.p.';
            	if (this.side == white) {
            		this.capture(square.getAdjacentSquare(0, -1).getPiece());
            	} else if (this.side == black) {
            		this.capture(square.getAdjacentSquare(0, 1).getPiece());
            	}
            } else if (this.moveType == 'castleKingside') {
            	verb = '0-0';
            	var rook = square.getAdjacentSquare(1, 0).getPiece();
            	var rookDest = square.getAdjacentSquare(-1, 0);
            	rook.moveTo(rookDest, 'free');
            } else if (this.moveType == 'castleQueenside') {
            	verb = '0-0-0';
            	var rook = square.getAdjacentSquare(-2, 0).getPiece();
            	var rookDest = square.getAdjacentSquare(1, 0);
            	rook.moveTo(rookDest, 'free');
            }
            
            // Apply the move

            this.lastPosition = this.getSquare();
            this.x = square.x;
            this.y = square.y;
            
            if (type != 'test') {
	            this.refresh();
	            this.moved = true;
            }

            // Change game settings
            
            if (type != 'free' && type != 'test') {
                game.lastPieceMoved = this;
            	suffix += game.checkChecks(game.currentPlayer);
	            game.currentPlayer.check = false;
	            game.nextPlayer();
	            
	            // Display algebraic notation
            
            	if (verb == '0-0' || verb == '0-0-0') {
					game.displayMove(verb);
				} else {
					game.displayMove(this.pieceChar + startStr + verb + destStr + suffix);
            	}
            }
        }
    },
    
    afterMove: function() {
    	// override this method
    },

    canMove: function(square) {
        return true; // override this method
    },
    
    safeToMove: function(square) {
    	if (this.moveType == 'castleKingside' || this.moveType == 'castleQueenside' || this.moveType == 'enPassant') {
    		return true; // no need to verify for castle, since you can't castle when checked anyway 
    		// TODO: figure out safeToMove for en passant
    	}
    	
    	this.moveTo(square, 'test');
    	var check = game.isCheckOn(this.side);
    	this.undoMove();
    	return check;
    },
    
    canCapture: function(piece) {
    	return this.canMove(piece.getSquare());
    },
    
    hasAvailableMoves: function() {
    	var piece = this;
    	return $$('.square').some(function (square) {
    		return piece.canMove(square.object) && piece.safeToMove(square.object);
    	})
    },

    capture: function(piece) {
    	this.lastCapture = piece;
        piece.captured();
        piece.element.inject('graveyard');
    },
    
    captured: function() {
    	this.drag.detach();
    },
    
    undoMove: function() {
        var lastCapture = this.lastCapture;
		this.moveTo(this.lastPosition, 'test');
		if (lastCapture) {
			lastCapture.undoCaptured();
		}
    },
    
    undoCaptured: function() {
    	this.element.inject('pieces');
    	this.refresh();
    	this.addDragEvent();
    },
    
	inCheck: function() {
		if (!this.royal) {
			return false;
		} else {
			return this.getSquare().isThreatenedBy(this.side.getOtherPlayers());
		}
    }
});

//
// PIECES
//

var Pawn = new Class({
    Implements: Piece,

    pieceName: 'pawn',
    pieceChar: '',
    
    canMove: function(square) {
    	if (this.getSquare().isPawnMove(square, this.side) || this.getSquare().isPawnCapture(square, this.side)) {
    		this.moveType = 'normal';
    	} else if (this.getSquare().isPawnDoubleMove(square, this.side)) {
    		this.moveType = 'double';
    	} else if (this.getSquare().isPawnEnPassant(square, this.side)) {
    		this.moveType = 'enPassant';
    	} else {
    		return false;
    	}
    	
    	return true;
    },

	afterMove: function() {
    	if ((this.side == white && this.y == 8) ||
    		(this.side == black && this.y == 1)) {
    			this.promote();
    	}
    },
    
    promote: function() {
        new Element('div.dialogTitle', {html: 'Select a piece to promote to.'}).inject($('dialog'));
        
        var pawn = this;
        var player = pawn.side;
        player.promotionPieces.each(function(pieceName) {
            var piece = game.createPiece(pieceName, [pawn.x, pawn.y, player.color]);
            piece.drag.detach();
            piece.element.onclick = function () {
                game.doPromote(this.object);
            };
            piece.element.inject($('dialog'));
        });
        
        $('overlay').show();
    }
});

var Knight = new Class({
    Implements: Piece,

    pieceName: 'knight',
    pieceChar: 'N',

    canMove: function(square) {
        return this.getSquare().isKnightMove(square, this.side);
    }
});

var Bishop = new Class({
    Implements: Piece,

    pieceName: 'bishop',
    pieceChar: 'B',

    canMove: function(square) {
        return this.getSquare().isBishopMove(square, this.side);
    }
});

var Rook = new Class({
    Implements: Piece,

    pieceName: 'rook',
    pieceChar: 'R',

    canMove: function(square) {
        return this.getSquare().isRookMove(square, this.side);
    }
});

var Queen = new Class({
    Implements: Piece,

    pieceName: 'queen',
    pieceChar: 'Q',

    canMove: function(square) {
        return (this.getSquare().isBishopMove(square, this.side) || this.getSquare().isRookMove(square, this.side));
    }
});

var King = new Class({
    Implements: Piece,

    pieceName: 'king',
    pieceChar: 'K',
    royal: true,

    canMove: function(square) {
        if (this.getSquare().isKingMove(square, this.side)) {
        	this.moveType = 'normal';
        } else if (this.getSquare().isKingCastleKingside(square, this.side)) {
        	this.moveType = 'castleKingside';
        } else if (this.getSquare().isKingCastleQueenside(square, this.side)) {
        	this.moveType = 'castleQueenside';
        } else {
        	return false;
        }
        
        return true;
    }
});

//
// SETUP
//

var game = new Game();

var white = new Player(0, 'white');
var black = new Player(1, 'black');
game.players = [white, black];
game.currentPlayer = white;

for (var i = 1; i <= 8; i++) {
	for (var j = 1; j <= 8; j++) {
		$(new Square(i, j)).inject('squares');
	}
}

$(new Rook(1, 1, white)).inject('pieces');
$(new Knight(2, 1, white)).inject('pieces');
$(new Bishop(3, 1, white)).inject('pieces');
$(new Queen(4, 1, white)).inject('pieces');
$(new King(5, 1, white)).inject('pieces');
$(new Bishop(6, 1, white)).inject('pieces');
$(new Knight(7, 1, white)).inject('pieces');
$(new Rook(8, 1, white)).inject('pieces');
$(new Pawn(1, 2, white)).inject('pieces');
$(new Pawn(2, 2, white)).inject('pieces');
$(new Pawn(3, 2, white)).inject('pieces');
$(new Pawn(4, 2, white)).inject('pieces');
$(new Pawn(5, 2, white)).inject('pieces');
$(new Pawn(6, 2, white)).inject('pieces');
$(new Pawn(7, 2, white)).inject('pieces');
$(new Pawn(8, 2, white)).inject('pieces');

$(new Rook(1, 8, black)).inject('pieces');
$(new Knight(2, 8, black)).inject('pieces');
$(new Bishop(3, 8, black)).inject('pieces');
$(new Queen(4, 8, black)).inject('pieces');
$(new King(5, 8, black)).inject('pieces');
$(new Bishop(6, 8, black)).inject('pieces');
$(new Knight(7, 8, black)).inject('pieces');
$(new Rook(8, 8, black)).inject('pieces');
$(new Pawn(1, 7, black)).inject('pieces');
$(new Pawn(2, 7, black)).inject('pieces');
$(new Pawn(3, 7, black)).inject('pieces');
$(new Pawn(4, 7, black)).inject('pieces');
$(new Pawn(5, 7, black)).inject('pieces');
$(new Pawn(6, 7, black)).inject('pieces');
$(new Pawn(7, 7, black)).inject('pieces');
$(new Pawn(8, 7, black)).inject('pieces');