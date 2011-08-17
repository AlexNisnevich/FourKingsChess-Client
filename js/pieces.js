// BASE PIECES

var Pawn = new Class({
	Extends: Piece,

	pieceClass: 'Pawn',
	pieceName: 'Pawn',
	pieceChar: '',
	direction: null,
	
	initialize: function (x, y, side) {
		this.direction = side;
		this.parent(x, y, side);
	},
	
	setImage: function() {
		this.element.addClass(this.color);
		this.element.setProperty('src', baseUrl + 'images/pieces/' + this.pieceName + '_' + this.color + '_' + this.direction + '.png');
	},
	
	canMove: function(square) {
		return (this.getSquare().isPawnMove(square, this.direction) || 
				this.getSquare().isPawnCapture(square, this.direction, this.side) ||
				this.getSquare().isPawnDoubleMove(square, this.direction, this.side));
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
	},
	
	exportPiece: function() {
		var obj = this.parent();
		obj.props.direction = this.direction;
		return obj;
	}
});

var Knight = new Class({
	Extends: Piece,

	pieceClass: 'Knight',
	pieceName: 'Knight',
	pieceChar: 'N',

	canMove: function(square) {
		return this.getSquare().isKnightMove(square, this.side);
	}
});

var Bishop = new Class({
	Extends: Piece,

	pieceClass: 'Bishop',
	pieceName: 'Bishop',
	pieceChar: 'B',

	canMove: function(square) {
		return this.getSquare().isBishopMove(square, this.side);
	}
});

var Rook = new Class({
	Extends: Piece,

	pieceClass: 'Rook',
	pieceName: 'Rook',
	pieceChar: 'R',

	canMove: function(square) {
		return this.getSquare().isRookMove(square, this.side);
	}
});

var Queen = new Class({
	Extends: Piece,

	pieceClass: 'Queen',
	pieceName: 'Queen',
	pieceChar: 'Q',

	canMove: function(square) {
		return (this.getSquare().isBishopMove(square, this.side) || this.getSquare().isRookMove(square, this.side));
	}
});

var King = new Class({
	Extends: Piece,

	pieceClass: 'King',
	pieceName: 'King',
	pieceChar: 'K',
	royal: true,

	canMove: function(square) {
		return (this.getSquare().isKingMove(square, this.side));
	}
});

// SPECIAL PIECES

// Britain

var Minister = new Class({
	Extends: Piece,
	
	pieceClass: 'Minister',
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

// Delegate

var Delegate = new Class({
	Extends: Piece,
	
	pieceName: 'Delegate',
	pieceClass: 'Delegate',
	pieceChar: 'D',
	
	canMove: function(square){
		return (this.getSquare().isKingMove(square, this.side) || this.getSquare().isRookJump(square, this.side, 2));
	}
});

// Sparta

var SpartaWarrior = new Class({
	Extends: Piece,
	
	pieceClass: 'SpartaWarrior',
	pieceName: 'SpartaWarrior',
	pieceChar: 'W',
	
	specialProperties: {
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

// Athens

var AthensBishop = new Class({
	Extends: Bishop,
	
	pieceClass: 'AthensBishop',

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
			game.getLastMoveText().appendText(' (t)');
		}
	}
});

// Byzantine Empire

var ByzantineNonPawn = new Class({
	byzantineRetreat: function (dest, side) {
		if ((dest.inTwoByFour() == side) && ((!(this.getSquare().inThreeByFive() == side) && !dest.isOccupied(side)) || !dest.isOccupied())) {
			return true;
		}
		else {
			return false;
		}
	}
});

var ByzantineKnight = new Class({
	Extends: Knight,
	Implements: ByzantineNonPawn,

	pieceClass: 'ByzantineKnight',

	canMove: function (square) {
		return (this.parent(square) || this.byzantineRetreat(square, this.side));
	}
});

var ByzantineRook = new Class({
	Extends: Rook,
	Implements: ByzantineNonPawn,

	pieceClass: 'ByzantineRook',

	canMove: function (square) {
		return (this.parent(square) || this.byzantineRetreat(square, this.side));
	}
});

var ByzantineKing = new Class({
	Extends: King,
	Implements: ByzantineNonPawn,

	pieceClass: 'ByzantineKing',

	canMove: function (square) {
		return (this.parent(square) || this.byzantineRetreat(square, this.side));
	}
});

var ByzantineBishop = new Class({
	Extends: Bishop,
	Implements: ByzantineNonPawn,

	pieceClass: 'ByzantineBishop',

	canMove: function (square) {
		return (this.parent(square) || this.byzantineRetreat(square, this.side));
	}
});

var ByzantinePawn = new Class({
	Extends: Pawn,

	pieceClass: 'ByzantinePawn',

	canMove: function (square) {
		return (this.parent(square) || this.byzantineRetreat(square, this.side));
	},
	byzantineRetreat: function (dest, side) {
		if (!(dest.inTwoByFour() == side) || dest.isOccupied()) {
			return false;
		}
		else {
			return true;
		}
	}
});

// Ancient Greece

var GreecePiece = new Class({
	greeceMove: function (square){
		this.moveType = 'normal';
		if (this.getSquare().inTwoByFour() == this.side) {
			return this.getSquare().isKingMove(square, this.side);
		}
		else if (this.getSquare().inThreeByFive() == this.side) {
			return this.getSquare().isBishopJump(square, this.side, 2);
		}
		else if (this.getSquare().inCenterTwoByTwo() == true) {
			if (this.getSquare().isRookJump(square, this.side, 1)
					&& square.isOccupied()
					&& !square.isOccupied(this.side)) {
				this.moveType = 'shoot';
				return true;
			}else {
				return false;
			}
		}
		else {
			return this.parent(square);
		}
	},
	greeceHasMoved: function(){
		if (this.moveType == 'shoot') {
			this.moveTo(this.lastPosition, 'normal');
			game.getLastMoveText().appendText(' (sh)');
		}
	}
});

var GreeceKnight = new Class({
	Extends: Knight,
	Implements: GreecePiece,
	pieceClass: 'GreeceKnight',

	canMove: function (square) {
		return (this.parent(square) || this.greeceMove(square));
	},

	afterMove: function () {
		this.greeceHasMoved();
	}
});

var GreeceBishop = new Class({
	Extends: Bishop,

	pieceClass: 'GreeceBishop',
	Implements: GreecePiece,
	canMove: function (square) {
		return (this.parent(square) || this.greeceMove(square));
	},

	afterMove: function () {
		this.greeceHasMoved();
	}
});

var GreeceRook = new Class({
	Extends: Rook,
	Implements: GreecePiece,
	pieceClass: 'GreeceRook',

	canMove: function (square) {
		return (this.parent(square) || this.greeceMove(square));
	},

	afterMove: function () {
		this.greeceHasMoved();
	}
});

// Hurons

var HuronBishop = new Class({
	Extends: Bishop,

	pieceClass: 'HuronBishop',

	canMove: function(square) {
	return (this.parent(square) || 
		this.getSquare().isBishopJump(square, this.side, 2));
	}
});

var HuronRook = new Class({
	Extends: Rook,

	pieceClass: 'HuronRook',

	canMove: function(square) {
	return (this.parent(square) || 
		this.getSquare().isRookJump(square, this.side, 2));
	}
});

var HuronKing = new Class({
	Extends: King,

	pieceClass: 'HuronKing',

	canMove: function (square) {
		return (this.parent(square) || this.isKingJumpMove(this.getSquare(), square, this.side));
	},

	isKingJumpMove: function (start, dest, side) {
		return !dest.isOccupied(side) &&
		(((new Square(start.x + 1, start.y).isOccupied()) && (dest.x == (start.x + 2)) && dest.y == start.y)
		|| ((new Square(start.x - 1, start.y).isOccupied()) && (dest.x == (start.x - 2)) && dest.y == start.y)
		|| ((new Square(start.x, start.y + 1).isOccupied()) && (dest.x == (start.x)) && (dest.y == start.y + 2))
		|| ((new Square(start.x, start.y - 1).isOccupied()) && (dest.x == (start.x)) && (dest.y == start.y - 2))
		|| ((new Square(start.x + 1, start.y + 1).isOccupied()) && (dest.x == (start.x + 2)) && (dest.y == start.y + 2))
		|| ((new Square(start.x - 1, start.y + 1).isOccupied()) && (dest.x == (start.x - 2)) && (dest.y == start.y + 2))
		|| ((new Square(start.x - 1, start.y - 1).isOccupied()) && (dest.x == (start.x - 2)) && (dest.y == start.y - 2))
		|| ((new Square(start.x + 1, start.y - 1).isOccupied()) && (dest.x == (start.x + 2)) && (dest.y == start.y - 2)));
	}
});

var HuronPawn = new Class({
	Extends: Pawn,

	pieceClass: 'HuronPawn',

	canMove: function (square) {
		return (this.parent(square) ||
				this.isPawnJumpMove(this.getSquare(), square, this.direction) ||
				this.isPawnJumpCapture(this.getSquare(), square, this.direction, this.side));
	},

	isPawnJumpMove: function (start, dest, dir) {
		switch (dir) {
			case 0:
				return (!dest.isOccupied() && (new Square(start.x, start.y + 1).isOccupied()) && dest.x == start.x && dest.y == start.y + 2);
			case 1:
				return (!dest.isOccupied() && (new Square(start.x + 1, start.y).isOccupied()) && dest.y == start.y && dest.x == start.x + 2);
			case 2:
				return (!dest.isOccupied() && (new Square(start.x, start.y - 1).isOccupied()) && dest.x == start.x && dest.y == start.y - 2);
			case 3:
				return (!dest.isOccupied() && (new Square(start.x - 1, start.y).isOccupied()) && dest.y == start.y && dest.x == start.x - 2);
		}
	},

	isPawnJumpCapture: function (start, dest, dir, side) {
		if (dest.isOccupied() && !dest.isOccupied(side)) {
			switch (dir) {
				case 0:
					return (((new Square(start.x + 1, start.y + 1).isOccupied() && dest.x == start.x + 2) ||
						 (new Square(start.x - 1, start.y + 1).isOccupied() && dest.x == start.x - 2)) && dest.y == start.y + 2);
				case 1:
					return (((new Square(start.x + 1, start.y + 1).isOccupied() && dest.y == start.y + 2) ||
						 (new Square(start.x + 1, start.y - 1).isOccupied() && dest.y == start.y - 2)) && dest.x == start.x + 2);
				case 2:
					return (((new Square(start.x + 1, start.y - 1).isOccupied() && dest.x == start.x + 2) ||
						 (new Square(start.x - 1, start.y - 1).isOccupied() && dest.x == start.x - 2)) && dest.y == start.y - 2);
				case 3:
					return (((new Square(start.x - 1, start.y - 1).isOccupied() && dest.y == start.y + 2) ||
						 (new Square(start.x - 1, start.y - 1).isOccupied() && dest.y == start.y - 2)) && dest.x == start.x - 2);
			}
		} else {
			return false;
		}
	}
});

// Macedonia

var MacedoniaPawn = new Class({
	Extends: Pawn,

	pieceClass: 'MacedoniaPawn',

	canMove: function (square) {
		return (this.parent(square) ||
				this.isPawnQuadMove(square, this.direction) ||
				this.isPawnMoveTwo(square, this.direction) ||
				this.isPawnCaptureTwo(square, this.direction, this.side));
	},

	isPawnCaptureTwo: function (dest, dir, side) {
		if (dest.isOccupied() && !dest.isOccupied(side)) {
			switch (dir) {
				case 0:
					return (((dest.x == this.x + 2 && !(new Square(this.x + 1, this.y + 1)).isOccupied()) || (dest.x == this.x - 2 && !(new Square(this.x - 1, this.y + 1)).isOccupied())) && (dest.y == this.y + 2));
				case 1:
					return (((dest.y == this.y + 2 && !(new Square(this.x + 1, this.y + 1)).isOccupied()) || (dest.y == this.y - 2 && !(new Square(this.x + 1, this.y - 1)).isOccupied())) && (dest.x == this.x + 2));
				case 2:
					return (((dest.x == this.x + 2 && !(new Square(this.x + 1, this.y - 1)).isOccupied()) || (dest.x == this.x - 2 && !(new Square(this.x - 1, this.y - 1)).isOccupied())) && (dest.y == this.y - 2));
				case 3:
					return (((dest.y == this.y + 2 && !(new Square(this.x - 1, this.y + 1)).isOccupied()) || (dest.y == this.y - 2 && !(new Square(this.x - 1, this.y - 1)).isOccupied())) && (dest.x == this.x - 2));
			}
		} else {
			return false;
		}
	},

	isPawnMoveTwo: function (dest, dir) {
		switch (dir) {
			case 0:
				return ((this.y + 2 == dest.y) && dest.x == this.x && !dest.isOccupied() && !(new Square(this.x, this.y + 1)).isOccupied());
			case 1:
				return ((this.x + 2 == dest.x) && dest.y == this.y && !dest.isOccupied() && !(new Square(this.x + 1, this.y)).isOccupied());
			case 2:
				return ((this.y - 2 == dest.y) && dest.x == this.x && !dest.isOccupied() && !(new Square(this.x, this.y - 1)).isOccupied());
			case 3:
				return ((this.x - 2 == dest.x) && dest.y == this.y && !dest.isOccupied() && !(new Square(this.x - 1, this.y)).isOccupied());
		}
	},

	isPawnQuadMove: function (dest, dir) {
		switch (dir) {
			case 0:
				return (this.y == 2 && dest.y == 6 && dest.x == this.x && !dest.isOccupied() && !(new Square(this.x, 3)).isOccupied() && !(new Square(this.x, 4)).isOccupied() && !(new Square(this.x, 5)).isOccupied());
			case 1:
				return (this.x == 2 && dest.x == 6 && dest.y == this.y && !dest.isOccupied() && !(new Square(3, this.y)).isOccupied() && !(new Square(4, this.y)).isOccupied() && !(new Square(5, this.y)).isOccupied());
			case 2:
				return (this.y == 7 && dest.y == 3 && dest.x == this.x && !dest.isOccupied() && !(new Square(this.x, 6)).isOccupied() && !(new Square(this.x, 5)).isOccupied() && !(new Square(this.x, 4)).isOccupied());
			case 3:
				return (this.x == 7 && dest.x == 3 && dest.y == this.y && !dest.isOccupied() && !(new Square(6, this.y)).isOccupied() && !(new Square(5, this.y)).isOccupied() && !(new Square(4, this.y)).isOccupied());
		}
	}
});

// Medieval Britain

var MafiaPiece = new Class ({
	hasMoved: function(){
		if (this.lastCapture != null){
			this.moveTo(this.lastPosition, 'normal');
			game.getLastMoveText().appendText(' (sh)');
			game.lastPieceMoved = null;
		}
	}
});

var MafiaRook = new Class ({
	Extends: Rook,
	Implements: MafiaPiece,
	pieceClass: 'MafiaRook',
	
	canMove: function(square){
		return this.getSquare().isRookMove(square, this.side, 3);
	},
	
	afterMove: function() {
		this.hasMoved();
	}
});

var MafiaBishop = new Class ({
	Extends: Bishop,
	Implements: MafiaPiece,
	pieceClass: 'MafiaBishop',
	
	canMove: function(square){
		return this.getSquare().isBishopMove(square, this.side, 3);
	},
	
	afterMove: function() {
		this.hasMoved();
	}	
});

var MafiaKnight = new Class ({
	Extends: Knight,
	Implements: MafiaPiece,
	pieceClass: 'MafiaKnight',
	
	afterMove: function() {
		this.hasMoved();
	}
});

var MafiaKing = new Class ({
	Extends: King,
	Implements: MafiaPiece,
	pieceClass: 'MafiaKing',
	
	afterMove: function() {
		this.hasMoved();
	}	
});

var MafiaPawn = new Class ({
	Extends: Pawn,
	Implements: MafiaPiece,
	pieceClass: 'MafiaPawn',
	
	afterMove: function() {
		this.hasMoved();
	}
});

// Mongols

var MongolPawn =  new Class({
	Extends: Pawn,
	
	pieceClass: 'MongolPawn',

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
		this.element.setProperty('src', baseUrl + 'images/pieces/' + this.pieceName + '_' + this.color + '.png');
	}
});

// Papal States

var PapalBishop = new Class({
	Extends: Bishop,

	pieceClass: 'PapalBishop',

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

	pieceClass: 'ArchBishop',
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

// Transylvania

var VampKing = new Class({
	Extends: King,

	pieceClass: 'VampKing',

	canMove: function (square) {
		return (this.parent(square) || this.getSquare().isBishopJump(square, this.side, 2));
	}
});

var VampPawn = new Class({
	Extends: Pawn,

	pieceClass: 'VampPawn',

	afterMove: function () {
		if (this.lastCapture != null) {
			if (this.lastCapture.pieceName != 'Pawn') {
				this.transform(this.lastCapture.pieceName);
			}
		}
	}
});