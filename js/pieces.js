var Pawn = new Class({
    Extends: Piece,

    pieceName: 'pawn',
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
    	if ((this.direction == 0 && this.y == 8) ||
    		(this.direction == 1 && this.x == 8) ||
    		(this.direction == 2 && this.y == 1) ||
    		(this.direction == 3 && this.x == 1)) {
    			this.promote();
    	}
    },
    
    promote: function() {
        new Element('div.dialogTitle', {html: 'Select a piece to promote to.'}).inject($('dialog'));
        
        var pawn = this;
        var owner = pawn.getOwner();
        owner.promotionPieces.each(function(pieceName) {
            var piece = game.createPiece(pieceName.capitalize(), [pawn.x, pawn.y, owner.order]);
            piece.drag.detach();
            piece.element.onclick = function () {
                game.doPromote(piece);
            };
            piece.element.inject($('dialog'));
        });
        
        $('overlay').show();
    }
});

var Knight = new Class({
	Extends: Piece,

    pieceName: 'knight',
    pieceChar: 'N',

    canMove: function(square) {
        return this.getSquare().isKnightMove(square, this.side);
    }
});

var Bishop = new Class({
	Extends: Piece,

    pieceName: 'bishop',
    pieceChar: 'B',

    canMove: function(square) {
        return this.getSquare().isBishopMove(square, this.side);
    }
});

var Rook = new Class({
	Extends: Piece,

    pieceName: 'rook',
    pieceChar: 'R',

    canMove: function(square) {
        return this.getSquare().isRookMove(square, this.side);
    }
});

var Queen = new Class({
	Extends: Piece,

    pieceName: 'queen',
    pieceChar: 'Q',

    canMove: function(square) {
        return (this.getSquare().isBishopMove(square, this.side) || this.getSquare().isRookMove(square, this.side));
    }
});

var King = new Class({
	Extends: Piece,

    pieceName: 'king',
    pieceChar: 'K',
    royal: true,

    canMove: function(square) {
        return (this.getSquare().isKingMove(square, this.side));
    }
});