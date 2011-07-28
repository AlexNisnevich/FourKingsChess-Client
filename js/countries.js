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
	}
});