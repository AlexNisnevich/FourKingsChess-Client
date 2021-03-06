// Country lists

var countries = ['AncientGreece', 'Athens', 'Aztecs', 'Britain', 'ByzantineEmpire',
				 'Conquistadors', 'Huns', 'Hurons', 'Incas', 'Jerusalem', 
				 'Macedonia', 'MedievalBritain', 'Mongols', 'PapalStates', 'Sparta', 
				 'Transylvania'];

var countriesAncient = ['AncientGreece', 'Athens', 'Huns', 'Macedonia', 'Sparta'];
var countriesMedieval = ['Aztecs', 'ByzantineEmpire', 'Conquistadors', 'Incas', 'Jerusalem', 
						 'MedievalBritain', 'Mongols'];
var countriesEnlightenment = ['Britain', 'Hurons', 'PapalStates'];
var countriesFantasy = ['Transylvania'];

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
	countryDisplayName: ' Ancient Greece',
	power: 'power of city-states',

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
	power: 'power of the sea',

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
	power: 'power of warrior societies',

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

		if (game.amIUp()) {
			var player = this;
			game.promptSimple('Select a knight or rook to transform, if you wish to transform a piece instead of moving this turn.',
				'piece',
				'confirmCancel',
				function (piece) {
					return (piece.side == player.order && (piece.pieceClass == 'Rook' || piece.pieceClass == 'Knight'));
				},
				function (piece) {
					if (piece.pieceClass == 'Knight') {
						piece.transform('Rook', true);
						game.displayMove('N' + piece.getSquare().toString() + '=R');
					} else if (piece.pieceClass == 'Rook') {
						piece.transform('Knight', true);
						game.displayMove('R' + piece.getSquare().toString() + '=N');
					}
					player.endTurn();
				}
			);
		}
	}
});

var Britain = new Class({
	Extends: Player,

	countryName: 'Britain',
	power: 'power of democracy',

	initialize: function (order, color) {
		this.parent(order, color);
		this.description = 'Ministers <img src="' + baseUrl + 'images/pieces/Minister_' + color + '.png" align="bottom"> can move like kings and like knights. They cannot move like knights two turns in a row. If you have only one minister on the board, it is royal.';
		this.setupPieces = [['Minister', 'Minister', 'Minister', 'Minister'],
							['Pawn', 'Pawn', 'Pawn', 'Pawn']];
		this.promotionPieces = [['Minister', 0]];
	}
});

var ByzantineEmpire = new Class({
	Extends: Player,

	countryName: 'ByzantineEmpire',
	countryDisplayName: 'Byzantine Empire',
	power: 'power to retreat',

	initialize: function (order, color) {
		this.parent(order, color);
		this.description = 'On your turn, instead of moving a piece normally, you can move any of your pieces to any open square in your 2x4 starting area. If the piece is outside your 3x5 area and is not a pawn, you may use this ability to move it into a square in your 2x4 area that is occupied by an enemy piece, capturing the enemy piece.';
		this.setupPieces = [['ByzantineKing', 'ByzantineRook', 'ByzantineBishop', 'ByzantineKnight'],
							['ByzantinePawn', 'ByzantinePawn', 'ByzantinePawn', 'ByzantinePawn']];
		this.promotionPieces = [['ByzantineRook', 0],
								['ByzantineBishop', 0]
								['ByzantineKnight', 0]];
		this.derivedPieces = [['Rook', 'ByzantineRook'],
							   ['Bishop', 'ByzantineBishop'],
							   ['Knight', 'ByzantineKnight'],
							   ['Pawn', 'ByzantinePawn'],
							   ['King', 'ByzantineKing']];
	}
});

var Conquistadors = new Class({
	Extends: Player,

	countryName: 'Conquistadors',
	power: 'power of disease',

	startTurn: function (order, color) {
		this.parent();

		if (game.amIUp() == this.userName) {
			var player = this;
			this.getPieces().filter(function (piece) {
				return (piece.pieceClass != 'Pawn');
			}).each(function (piece) {
				game.getPieces(game.getOtherPlayers(player.order), null, -1).filter(function (targetPiece) {
					return (targetPiece.getSquare().distance(piece.getSquare()) == 1) &&
						!targetPiece.specialProperties.protectedFromSpecialAbilityCapture;
				}).each(function (targetPiece) {
					targetPiece.captured();
					game.displayMove('[' + targetPiece.getSquare().toString() + '], ');
				});
			});
		}
	},

	initialize: function (order, color) {
		this.parent(order, color);
		this.description = 'At the start of your turn, if any opponent\'s non-royal piece is horizontally or vertically adjacent to your bishop, knight, or king, destroy the enemy piece.';
		this.setupPieces = [['Bishop', 'King', 'Pawn'],
							['Pawn', 'Pawn', 'Knight']];
		this.promotionPieces = [['Knight', 0],
								['Bishop', 0]];
	}
});

var Huns = new Class({
	Extends: Player,

	countryName: 'Huns',
	power: 'power of tribute',

	specialProperties: { hasUsed: false },

	initialize: function (order, color) {
		this.parent(order, color);
		this.description = 'On each of your turns, instead of moving a piece, you may choose to place an additional pawn under your control into your 3x5 starting area. You may not use this ability two turns in a row.';
		this.setupPieces = [['King', 'Bishop', 'Knight'],
							['Pawn', 'Pawn', 'Pawn']];
		this.promotionPieces = [['Rook', 0],
								['Knight', 0],
								['Bishop', 0]];
	},
	
	startTurn: function () {
		this.parent();

		if (game.amIUp()) {
			var player = this;
			if (this.specialProperties.hasUsed == false) {
				game.promptSimple('Select a square to place a pawn, if you wish to place a pawn instead of moving this turn.',
					'square',
					'confirmCancel',
					function (square) {
						return ((square.inThreeByFive() == player.order) && !square.isOccupied());
					},
					function (square) {
						var pawn = AbstractFactory.create('Pawn', [square.x, square.y, player.order]);
						$(pawn).inject($('pieces'));
						
						game.addToLastMove({
							type: 'create',
							pos: {x: square.x, y: square.y}
						});
						game.displayMove('[' + square.toString() + ']');

						player.specialProperties.hasUsed = true;
						player.endTurn();
					}
				);
			}
			else {
				this.specialProperties.hasUsed = false;
			}
		}
	}
});

var Hurons = new Class({
	Extends: Player,

	countryName: 'Hurons',
	power: 'power to ambush',

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

var Incas = new Class ({
	Extends: Player,

  countryName: 'Incas',
	power: 'power of manipulation',
	
	startTurn: function(order, color){
		var player = this;
		this.getPieces('Delegate').each(function (delegate) {
			game.getPieces(game.getOtherPlayers(player.order)).filter(function (targetPiece) {
				return (targetPiece.getSquare().distance(delegate.getSquare()) == 1)
			}).each(function (targetPiece) {
				targetPiece.transferPossession(player);
				game.displayMove('[' + targetPiece.getSquare().toString() + '], ');
			});
		});
	},
	
  initialize: function (order, color) {
	this.parent(order, color);
	this.description = 'Delegates <img src="' + baseUrl + 'images/pieces/Delegate_' + color + '.png" align="bottom"> can move like kings or jump two squares horizontally or vertically. Whenever a delegate starts a turn horizontally or vertically adjacent to a nonroyal enemy piece, take control of that piece.';
	this.setupPieces = [['King', 'Delegate', 'Delegate'],
					['Pawn', 'Pawn', 'Pawn']];
	this.promotionPieces = [['Delegate', 0]];
  }
});

var Jerusalem = new Class({
	Extends: Player,

	countryName: 'Jerusalem',
	power: 'power of castles',

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

		if (game.amIUp()) {
			this.getPieces().each(function (piece) {
				piece.specialProperties.castle = false;
				piece.removeDecorator('castle');
			});
		}
	},

	afterMove: function (movedPiece) {
		this.parent(movedPiece);

		var player = this;
		game.promptSimple('Select a piece to protect this turn.',
			'piece',
			'confirmCancel',
			function (piece) {
				return (piece.side == player.order && !piece.isRoyal() && piece != movedPiece);
			},
			function (piece) {
				piece.specialProperties.castle = true;
				piece.addDecorator('castle');
				
				game.getLastMoveText().appendText(', [' +
						piece.pieceChar + piece.getSquare().toString() + ']');
				game.addToLastMove({
					type: 'decorate',
					pos: {x: piece.x, y: piece.y},
					decoration: 'castle'
				});
				game.getCurrentPlayer().endTurn();
			},
			true
		);
		return false;
	},

	capturable: function (myPiece, capturingPiece) {
		return (!myPiece.specialProperties.castle || capturingPiece.isRoyal());
	},

	afterImport: function () {
		this.getPieces().each(function (piece) {
			if (piece.specialProperties.castle) {
				piece.element.addClass('castle');
			}
		});
	}
});

var Macedonia = new Class({
	Extends: Player,

	countryName: 'Macedonia',
	power: 'power to advance',

	initialize: function (order, color) {
		this.parent(order, color);
		this.description = 'Your pawns can also move or capture twice as far away as a normal pawn (that is, they can always move one or two squares forward, can move two or four squares forward when on the second row, and can capture one or two squares diagonally), and can promote to a rook, bishop, or queen. You can only have one queen in play at a time.';
		this.setupPieces = [['King', 'Rook', 'Bishop', 'MacedoniaPawn'],
							['MacedoniaPawn', 'MacedoniaPawn', 'MacedoniaPawn', 'MacedoniaPawn']];
		this.promotionPieces = [['Queen', 1],
								['Rook', 0],
								['Bishop', 0]];
		this.derivedPieces = [['Pawn', 'MacedoniaPawn']];
	}
});

var MedievalBritain = new Class({
	Extends: Player,
	
	countryName: 'MedievalBritain',
	countryDisplayName: 'Medieval Britain',
	power: 'power of longbows',
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.description = 'Your pieces capture without moving. Your bishops and rooks may only move up to three squares each turn.';
		this.setupPieces = [['MedievalBritainKing', 'MedievalBritainRook', 'MedievalBritainBishop', 'MedievalBritainKnight'], 
							['MedievalBritainPawn', 'MedievalBritainPawn', 'MedievalBritainPawn', 'MedievalBritainPawn']];
		this.promotionPieces = [['MedievalBritainRook', 0],
								['MedievalBritainBishop', 0],
								['MedievalBritainKnight', 0]];
		this.derivedPieces = [['Rook', 'MedievalBritainRook'],
							   ['Bishop', 'MedievalBritainBishop'],
							   ['Knight', 'MedievalBritainKnight'],
							   ['Pawn', 'MedievalBritainPawn']];
	}
});

var Mongols = new Class({
	Extends: Player,
	
	countryName: 'Mongols',
	power: 'power of training',
	
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
	countryDisplayName: 'Papal States',
	power: 'power of the church',
	
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
	power: 'power of mastery',
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.description = 'The warrior <img src="' + baseUrl + 'images/pieces/SpartaWarrior_' + color + '.png" align="bottom"> can move as a queen and as a knight, and cannot be moved or destroyed as a result of other players\' special abilities. You may not have more than one warrior at a time. Your pawns can promote to a rook, knight, bishop or warrior.';
		this.setupPieces = [['King', 'SpartaWarrior', 'Pawn', 'Pawn'], 
							['Pawn', 'Pawn', 'Pawn', 'Pawn']];
		this.promotionPieces = [['SpartaWarrior', 1],
								['Rook', 0], 
								['Bishop', 0], 
								['Knight', 0]];
	}
	
	//@TODO: Once per game, while in check, you may move your king and warrior on the same turn.
});

var Transylvania = new Class({
	Extends: Player,

	countryName: 'Transylvania',
	power: 'power of vampires',

	initialize: function (order, color) {
		this.parent(order, color);
		this.description = 'When one of your pawns captures a piece, it promotes to the piece it captured. Your king can also jump three squares diagonally.';
		this.setupPieces = [['VampKing', 'Rook', 'Bishop', 'Knight'],
							['VampPawn', 'VampPawn', 'VampPawn', 'VampPawn']];
		this.promotionPieces = [['Rook', 0],
								['Knight', 0],
								['Bishop', 0]];
		this.derivedPieces = [['Pawn', 'VampPawn'],
							  ['King', 'VampKing']];
	}
});

// Backward compatibility
var Mafia = MedievalBritain;