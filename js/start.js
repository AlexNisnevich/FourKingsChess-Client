var game = new Game();
game.setup();
game.alert('Choose countries');

var countries = ['Athens', 'Britain', 'Mongols', 'PapalStates', 'Sparta'];

$$('#setup select').each(function(dropdown) {
	var blankOption = new Element('option', {
        'value': '',
        html: '(Choose a country)'
    });
	blankOption.inject(dropdown);
	
	countries.each(function (countryName) {
		var newOption = new Element('option', {
            'value': countryName,
            html: countryName
        });
		newOption.inject(dropdown);
	});
});

$('startButton').addEvent('click', function() {
	if ($$('#setup select').every(function (dropdown) {
		return (dropdown.getSelected()[0].value != '');
	})) {
			game.addPlayer($('selectRed').getSelected()[0].value, 'red');
			game.addPlayer($('selectGreen').getSelected()[0].value, 'green');
			game.addPlayer($('selectYellow').getSelected()[0].value, 'yellow');
			game.addPlayer($('selectBlue').getSelected()[0].value, 'blue');
			game.startGame();
			
			$('setup').dispose();
			$('moves').show();
	}
});