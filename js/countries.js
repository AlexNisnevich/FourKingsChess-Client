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

var AncientGreece = new Class({
    Extends: Player,

    countryName: 'AncientGreece',

    initialize: function (order, color) {
        this.parent(order, color);
        this.description = 'Your rook, knight, and bishop gain additional moves depending on where they are on the board. In your 2x4 starting area, they can move like a king. In your 3x5 area but outside of your 2x4 area, they can jump diagonally two spaces. In the center 2x2 area, they can "shoot" (capture without moving) enemy pieces that are horizontally or vertically adjacent to them. (At the moment, if a rook can capture normally or shoot, it always shoots.)';
        this.setupPieces = [['King', 'GreeceRook', 'GreeceBishop', 'GreeceKnight'],
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
        this.promotionPieces = [['Rook', 0],
	                            ['Bishop', 0],
	                            ['Knight', 0]];
        this.derivedPieces = [['Knight', 'GreeceKnight'],
							  ['Rook', 'GreeceRook'],
							  ['Bishop', 'GreeceBishop']];
    }
});

var Athens = new Class({
    Extends: Player,

    countryName: 'Athens',

    initialize: function (order, color) {
        this.parent(order, color);
        this.description = 'Your bishops can move to any open space on the board where they won\'t put an opponent in check. You may not use this ability two turns in a row.';
        this.setupPieces = [['King', 'AthensBishop', 'AthensBishop', 'AthensBishop'],
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
        this.promotionPieces = [['AthensBishop', 0]];
        this.derivedPieces = [['Bishop', 'AthensBishop']];

    }
});

var Aztecs = new Class({
    Extends: Player,

    countryName: 'Aztecs',

    initialize: function (order, color) {
        this.parent(order, color);
        this.description = 'On your turn, instead of moving you may change one of your knights into a rook, or vice versa.';
        this.setupPieces = [['King', 'Rook', 'Rook', 'Knight'],
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
        this.promotionPieces = [['Rook', 0],
	                            ['Bishop', 0],
	                            ['Knight', 0]];
    },

    startTurn: function () {
        this.parent();
		var player = this;
        game.promptSimple('Select a knight or rook to transform, if you wish to transform a piece instead of moving this turn.',
			'piece',
			'confirmCancel',
			function (piece) {
			    piece = piece.object;
			    return (piece.side == player.order && (piece.pieceClass == 'Rook' || piece.pieceClass == 'Knight'));
			},
			function (piece) {
				if (piece.object.pieceClass == 'Knight'){
					piece.object.transform('Rook');
				} else if (piece.object.pieceClass == 'Rook'){
					piece.object.transform('Knight');
				}
				player.endTurn();
			},
			true
		);
        
    },
});

var Britain = new Class({
    Extends: Player,

    countryName: 'Britain',

    initialize: function (order, color) {
        this.parent(order, color);
        this.description = 'Ministers <img src="' + baseUrl + 'images/pieces/Minister_' + color + '.png" align="bottom"> can move like kings and like knights, and are royal. They cannot move like knights two turns in a row.';
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
        this.description = 'All of your pieces can jump two squares in any direction that they normally move in, but can only jump over pieces, not open squares. Thus, a king can jump two squares in any direction, a bishop two squares diagonally, a rook two squares horizontally or vertically, and a pawn two squares forwards into an open square or two squares diagonally to capture a piece.';
        this.setupPieces = [['HuronKing', 'HuronRook', 'HuronBishop', 'HuronBishop'],
		                    ['HuronPawn', 'HuronPawn', 'HuronPawn', 'HuronPawn']];
        this.promotionPieces = [['HuronRook', 0],
	                            ['HuronBishop', 0]];
        this.derivedPieces = [['Bishop', 'HuronBishop'],
	                          ['Rook', 'HuronRook'],
							  ['Pawn', 'HuronPawn']];
    }
});

var Jerusalem = new Class({
    Extends: Player,

    countryName: 'Jerusalem',

    initialize: function (order, color) {
        this.parent(order, color);
        this.description = 'At the end of each of your turns, you may choose a non-royal piece you control that has not moved that turn. Until the start of your next turn, the chosen piece may not be captured, except by royal pieces.';
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
    },

    afterImport: function () {
        $$('#board .piece.' + this.color).each(function (piece) {
            if (piece.object.specialProperties.castle) {
                piece.addClass('castle');
            }
        });
    }
});

var Mafia = new Class({
	Extends: Player,
	
	countryName: 'Mafia',
	
	initialize: function (order, color) {
	    this.parent(order, color);
	    this.description = 'Your pieces do not move when they capture other pieces. Instead, if an opponents piece is within capturing range of one of your pieces and you choose to capture it, you remove it from the board without actually moving your piece. This action counts as your movement even though you have not technically moved.  Your bishops and rooks may only move up to three squares each turn.';
		this.setupPieces = [['MafiaKing', 'MafiaRook', 'MafiaBishop', 'MafiaKnight'], 
		                    ['MafiaPawn', 'MafiaPawn', 'MafiaPawn', 'MafiaPawn']];
	    this.promotionPieces = [['MafiaRook', 0],
								['MafiaBishop', 0]
								['MafiaKnight', 0]];
	    this.derivedPieces = [['Rook', 'MafiaRook'],
							   ['Bishop', 'MafiaBishop'],
							   ['Knight', 'MafiaKnight']
							   ['Pawn', 'MafiaPawn']];
	}
});

var Mongols = new Class({
	Extends: Player,
	
	countryName: 'Mongols',
	
	initialize: function (order, color) {
	    this.parent(order, color);
	    this.description = 'Your pawns can move one square horizontally or vertically and can capture one square diagonally in any direction. Your pawns may promote either vertically or horizontally, and may promote to any standard chess piece, provided that you have no more than one queen, two rooks, two bishops, and two knights.';
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
	    this.description = 'Your bishops can also jump two squares diagonally. Whenever one of your bishops moves into another player\'s 2x4 area, it promotes to an archbishop <img src="' + baseUrl + 'images/pieces/Archbishop_' + color + '.png" align="bottom">. Archbishops can move like regular Papal States bishops, but can also jump one or two squares horizontally or vertically.';
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
	    this.description = 'The warrior <img src="' + baseUrl + 'images/pieces/SpartaWarrior_' + color + '.png" align="bottom"> can move as a queen and as a knight, and cannot be moved or destroyed as a result of other players\' special abilities. You may not have more than one warrior at a time. Your pawns can promote to a rook, knight, bishop or warrior.';
		this.setupPieces = [['King', 'SpartaWarrior', 'Pawn', 'Pawn'], ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
		this.promotionPieces = [['SpartaWarrior', 1],
		                        ['Rook', 0], 
	                            ['Bishop', 0], 
	                            ['Knight', 0]];
	}
	
	//@TODO: Once per game, while in check, you may move your king and warrior on the same turn.
});