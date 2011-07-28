// DefaultCountry is really only for test purposes - default setup, with no powers
var DefaultCountry = new Class({
	Extends: Player,
	
	countryName: 'Default',
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'Rook', 'Bishop', 'Knight'], ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
	    this.promotionPieces = ['Rook', 'Bishop', 'Knight'];
	}
});

var Athens = new Class({
	Extends: Player,
	
	countryName: 'Athens',
	wasLastMoveTeleport: false,
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'AthensBishop', 'AthensBishop', 'AthensBishop'], ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
	    this.promotionPieces = ['AthensBishop'];
	    this.derivedPieces = [['Bishop', 'AthensBishop']];
	}
});

var Mongols = new Class({
	Extends: Player,
	
	countryName: 'Mongols',
	basePromotionPieces: ['Queen', 'Rook', 'Bishop', 'Knight'],
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'MongolPawn', 'MongolPawn', 'MongolPawn'], ['MongolPawn', 'MongolPawn', 'MongolPawn', 'MongolPawn']];
	    this.promotionPieces = ['Queen', 'Rook', 'Bishop', 'Knight'];
	    this.derivedPieces = [['Pawn', 'MongolPawn']];
	},
	
	refreshPromotionPieces: function () {
		var player = this;
		this.promotionPieces = this.basePromotionPieces.filter(function(pieceName) {
        	return player.canPromoteTo(pieceName.toLowerCase());
        });
	},
	
	canPromoteTo: function (pieceName) {
		if (pieceName == 'queen') {
			return (this.countPieces('queen') < 1);
		} else if (pieceName == 'rook') {
			return (this.countPieces('rook') < 2);
		} else if (pieceName == 'bishop') {
			return (this.countPieces('bishop') < 2);
		} else if (pieceName == 'knight') {
			return (this.countPieces('knight') < 2);
		} else {
			return true; // applies to special pieces you may have access to
		}
	},
	
	defeated: function (defeatingPlayer) {
		this.refreshPromotionPieces();
		this.parent(defeatingPlayer);
	}
});