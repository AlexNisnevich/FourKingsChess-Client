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
	wasLastMoveTeleport: false,
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'AthensBishop', 'AthensBishop', 'AthensBishop'], 
		                    ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
	    this.promotionPieces = [['AthensBishop', 0]];
	    this.derivedPieces = [['Bishop', 'AthensBishop']];
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