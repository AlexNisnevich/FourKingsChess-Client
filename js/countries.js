var DefaultCountry = new Class({
	Extends: Player,
	
	countryName: 'Default',
	
	initialize: function (order, color) {
		this.parent(order, color);
		this.setupPieces = [['King', 'Rook', 'Bishop', 'Knight'], ['Pawn', 'Pawn', 'Pawn', 'Pawn']];
	    this.promotionPieces = ['Rook', 'Bishop', 'Knight'];
	}
});