// global variables

var baseUrl = 'http://alex.nisnevich.com/playchess/';

// start game

var game = new Game();
game.setup();
game.alert('Choose countries');

$$('#setup select').each(function(dropdown) {
	var blankOption = new Element('option', {
		'value': '',
		html: '(Choose a country)'
	});
	blankOption.inject(dropdown);
	
	countries.each(function (countryName) {
		var newOption = new Element('option', {
			'value': countryName,
			html: getDisplayName(countryName)
		});
		newOption.inject(dropdown);
	});
});
// buttons

if ($('chatSendButton')) {
	$('chatSendButton').addEvent('click', function () {
		game.sendChat($('myMessage').value);
		$('myMessage').value = '';
	});

	// Enter doesn't work correctly on IE, so just disable the check for now
	if (!Browser.ie) {
		$('myMessage').addEvent('keydown', function (event) {
			if (event.key == 'enter') {
				game.sendChat($('myMessage').value);
				$('myMessage').value = '';
			}
		});
	}
}

if ($('chooseCountryButton')) {
	$('countryDropDown').addEvent('change', function () {
		$$('#board .piece').dispose();
		game.players = [];
		game.addPlayer($('countryDropDown').getSelected()[0].value, 'white');
		game.displayDescriptions();

		// remove direction marks from pawns
		$$('#board .piece').each(function (piece) {
			piece.setProperty('src', baseUrl + 'images/pieces/' + piece.object.pieceName + '_white.png');
		});
	});

	$('chooseCountryButton').addEvent('click', function () {
		location.replace(baseUrl + 'Games/ChooseCountry/' + gameId + '/' + $('countryDropDown').getSelected()[0].value);
	});
}

if ($('drawButton')) {
	$('drawButton').addEvent('click', function () {
		game.offerDraw();
	});
}

if ($('joinButton')) {
	$('joinButton').addEvent('click', function () {
		location.replace(baseUrl + 'Games/Join/' + gameId);
	});
}

if ($('leaveButton')) {
	$('leaveButton').addEvent('click', function () {
		location.replace(baseUrl + 'Games/Leave/' + gameId);
	});
}

if ($('resignButton')) {
	$('resignButton').addEvent('click', function () {
		game.resign();
	});
}

// controls

var tabBox = new TabPane('tabbedBox');

tabBox.addEvent('change', function () {
	$$('.tab').removeClass('notify');
	if ($('messages')) {
		$('messages').scrollTop = $('messages').scrollHeight; // scroll down
	}
});

// helpers

function getDisplayName(countryName) {
	var country = AbstractFactory.create(countryName, [null, null]);
	return country.countryDisplayName;
}
