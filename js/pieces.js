// BASE PIECES

var Pawn = new Class({
    Extends: Piece,

    pieceName: 'Pawn',
    pieceChar: '',
    direction: null,
    
    initialize: function (x, y, side) {
		this.direction = side;
		this.parent(x, y, side);
	},
	
	setImage: function() {
        this.element.addClass(this.color);
        this.element.setProperty('src', 'images/pieces/' + this.pieceName + '_' + this.color + '_' + this.direction + '.png');
    },
    
    canMove: function(square) {
    	if (this.getSquare().isPawnMove(square, this.direction) || 
    			this.getSquare().isPawnCapture(square, this.direction, this.side)) {
    		this.moveType = 'normal';
    	} else if (this.getSquare().isPawnDoubleMove(square, this.direction, this.side)) {
    		this.moveType = 'double';
    	} else {
    		return false;
    	}
    	
    	return true;
    },

	afterMove: function() {
    	if (((this.direction == 0 && this.y == 8) ||
    		(this.direction == 1 && this.x == 8) ||
    		(this.direction == 2 && this.y == 1) ||
    		(this.direction == 3 && this.x == 1)) &&
    			(this.getOwner().promotionPieces.length != 0)) {
    				this.promote();
    	}
    },
    
    transform: function(pieceName) {
    	newPiece = this.parent(pieceName);
    	
    	newPiece.direction = this.direction;
    	newPiece.setImage();
    	
    	return newPiece;
    },
    
    promote: function() {
        var pawn = this;
        var owner = pawn.getOwner();
    	
        new Element('div.dialogTitle', {html: 'Select a piece to promote to.'}).inject($('dialog'));
        
        owner.promotionPieces.each(function(promotionPiece) {
        	var pieceName = promotionPiece[0];
        	var pieceLimit = promotionPiece[1];
        	
        	if (pieceLimit == 0 || owner.countPieces(pieceName) < pieceLimit) {
        		var piece = AbstractFactory.create(pieceName, [pawn.x, pawn.y, owner.order]);
	            piece.drag.detach();
	            piece.element.onclick = function () {
	                game.doPromote(piece);
	            };
	            piece.element.inject($('dialog'));
        	}
        });
        
        $('overlay').show();
    }
});

var Knight = new Class({
	Extends: Piece,

    pieceName: 'Knight',
    pieceChar: 'N',

    canMove: function(square) {
        return this.getSquare().isKnightMove(square, this.side);
    }
});

var Bishop = new Class({
	Extends: Piece,

    pieceName: 'Bishop',
    pieceChar: 'B',

    canMove: function(square) {
        return this.getSquare().isBishopMove(square, this.side);
    }
});

var Rook = new Class({
	Extends: Piece,

    pieceName: 'Rook',
    pieceChar: 'R',

    canMove: function(square) {
        return this.getSquare().isRookMove(square, this.side);
    }
});

var Queen = new Class({
	Extends: Piece,

    pieceName: 'Queen',
    pieceChar: 'Q',

    canMove: function(square) {
        return (this.getSquare().isBishopMove(square, this.side) || this.getSquare().isRookMove(square, this.side));
    }
});

var King = new Class({
	Extends: Piece,

    pieceName: 'King',
    pieceChar: 'K',
    royal: true,

    canMove: function(square) {
        return (this.getSquare().isKingMove(square, this.side));
    }
});

// SPECIAL PIECES

var Minister = new Class({
	Extends: Piece,
	
	pieceName: 'Minister',
	pieceChar: 'M',
	royal: true,
	
	canMove: function(square) {
		if (this.getSquare().isKingMove(square, this.side)) {
			this.moveType = 'normal';
		} else if (this.getSquare().isKnightMove(square, this.side) && 
				   this.getOwner().lastMoveType != 'knightMove') {
			this.moveType = 'knightMove';
		} else {
			return false;
		}
		
		return true;
	}
});

var SpartaWarrior = new Class({
	Extends: Piece,
	
	pieceName: 'SpartaWarrior',
	pieceChar: 'W',
	
	properties: {
		protectedFromSpecialAbilityMove: true,
		protectedFromSpecialAbilityCapture: true
	},
	
	canMove: function(square) {
		return (this.getSquare().isBishopMove(square, this.side) ||
				this.getSquare().isRookMove(square, this.side) || 
				this.getSquare().isKnightMove(square, this.side));
	}
});

// DERIVED PIECES

var AthensBishop = new Class({
	Extends: Bishop,
	
	canMove: function(square) {
		if (this.parent(square)) {
			this.moveType = 'normal';
		} else if (!square.isOccupied() && !this.isMoveCheck(square) && 
				   this.getOwner().lastMoveType != 'teleport') {
			this.moveType = 'teleport';
		} else {
			return false;
		}
		
		return true;
	},
	
	afterMove: function() {
		if (this.moveType == 'teleport') {
			game.getLastMoveText().appendText(' T');
		}
	}
});

var MongolPawn =  new Class({
	Extends: Pawn,
	
	canMove: function(square) {
		var pos = this.getSquare();
		return ((!square.isOccupied() && 
					((square.x == pos.x && (square.y == pos.y + 1 || square.y == pos.y - 1)) || 
					(square.y == pos.y && (square.x == pos.x + 1 || square.x == pos.x - 1)))) ||
				(square.isOccupied() && !square.isOccupied(this.side) && 
					(square.x == pos.x + 1 || square.x == pos.x - 1) &&
					(square.y == pos.y + 1 || square.y == pos.y - 1)));
	},
	
	afterMove: function() {
    	if ((this.side == 0 && (this.y == 8 || this.x == 8)) ||
    		(this.side == 1 && (this.x == 8 || this.y == 1)) ||
    		(this.side == 2 && (this.y == 1 || this.x == 1)) ||
    		(this.side == 3 && (this.x == 1 || this.y == 8))) {
    			this.promote();
    	}
    },
	
	setImage: function() {
        this.element.addClass(this.color);
        this.element.setProperty('src', 'images/pieces/' + this.pieceName + '_' + this.color + '.png');
    }
});

var PapalBishop = new Class({
	Extends: Bishop,

	canMove: function(square) {
		return (this.parent(square) || 
        		this.getSquare().isBishopJump(square, this.side, 2));
    },
    
    afterMove: function() {
        if (this.getSquare().inTwoByFour() != -1 && this.getSquare().inTwoByFour() != this.getOwner().order) {
        	this.transform('ArchBishop');
        	game.getLastMoveText().appendText('=AB');
	    };
    }
});

var ArchBishop = new Class({
	Extends: PapalBishop,

    pieceName: 'ArchBishop',
    pieceChar: 'AB',

    canMove: function(square) {
		return (this.parent(square) || 
        		this.getSquare().isKingMove(square, this.side) ||
        		this.getSquare().isRookJump(square, this.side, 2))
    },
    
    afterMove: function() {
    	// blank override
    }
});
