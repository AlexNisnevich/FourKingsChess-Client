// DefaultCountry is really only for test purposes - default setup, with no powers
var DefaultCountry = new Class({
	Extends: Player,
	
	countryName: 'Default',
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'Rook', 'Bishop', 'Knight'], 
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
	    this.promotionPieces = [['Rook', 0], 
	                            ['Bishop', 0], 
	                            ['Knight', 0]];
	}
});

var Athens = new Class({
	Extends: Player,
	
	countryName: 'Athens',
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'AthensBishop', 'AthensBishop', 'AthensBishop'], 
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
	    this.promotionPieces = [['AthensBishop', 0]];
	    this.derivedPieces = [['Bishop', 'AthensBishop']];
	}
});

var Britain = new Class({
	Extends: Player,
	
	countryName: 'Britain',
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['Minister', 'Minister', 'Minister', 'Minister'],
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
		this.promotionPieces = [['Minister', 0]];
	}
});

var Hurons = new Class({
	Extends: Player,

	countryName: 'Hurons',

	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'HuronRook', 'HuronBishop', 'HuronBishop'], 
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
	    this.promotionPieces = [['HuronRook', 0], 
	                            ['HuronBishop', 0]];
	    this.derivedPieces = [['HuronBishop', 'Bishop'],
	                          ['HuronRook', 'Rook']];
	}
});

var Jerusalem = new Class({
	Extends: Player,

	countryName: 'Jerusalem',

	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'Rook', 'Bishop', 'Knight'], 
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
	    this.promotionPieces = [['Rook', 0], 
	                            ['Bishop', 0], 
	                            ['Knight', 0]];
	},
	
	startTurn: function () {
		this.parent();
		
		$$('#board .piece.' + this.color).each(function (piece) {
			piece.object.specialProperties.castle = false;
			piece.removeClass('castle');
		});
	},
	
	afterMove: function (movedPiece) {
		this.parent(movedPiece);
		
		var player = this;
		game.promptSimple('Select a piece to protect this turn.', 
			'piece', 
			'confirmCancel', 
			function (piece) { 
				piece = piece.object;
				return (piece.side == player.order && !piece.isRoyal() && piece != movedPiece);
			}, 
			function (piece) {
				piece.object.specialProperties.castle = true;
				piece.addClass('castle');
				game.getLastMoveText().appendText(', [' + 
						piece.object.pieceChar + piece.object.getSquare().toString() + ']');
			}
		);
		return false;
	},
	
	capturable: function (myPiece, capturingPiece) {
		return (!myPiece.specialProperties.castle || capturingPiece.isRoyal());
	}
});

var Mongols = new Class({
	Extends: Player,
	
	countryName: 'Mongols',
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'MongolPawn', 'MongolPawn', 'MongolPawn'], 
		                    ['MongolPawn', 'MongolPawn', 'MongolPawn', 'MongolPawn']];
	    this.promotionPieces = [['Queen', 1],
	                            ['Rook', 2], 
	                            ['Bishop', 2], 
	                            ['Knight', 2]];
	    this.derivedPieces = [['Pawn', 'MongolPawn']];
	}
});

var PapalStates = new Class({
	Extends: Player,
	
	countryName: 'PapalStates',
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'PapalBishop', 'PapalBishop', 'PapalBishop'], 
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
	    this.promotionPieces = [['PapalBishop', 0]];
	    this.derivedPieces = [['Bishop', 'PapalBishop']];
	}
});

var Sparta = new Class({
	Extends: Player,
	
	countryName: 'Sparta',
	
	initialize:function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'SpartaWarrior', 'Pawn', 'Pawn'], ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
		this.promotionPieces = [['SpartaWarrior', 1],
		                        ['Rook', 0], 
	                            ['Bishop', 0], 
	                            ['Knight', 0]];
	}
	
	//@TODO: You are checkmated only when your king is captured twice. The first time that your king 
	//is captured, place it anywhere in your 3x5 area at the start of your next turn.
});