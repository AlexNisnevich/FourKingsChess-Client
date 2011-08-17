// global variables

var baseUrl = 'http://alex.nisnevich.com/playchess/';
var local = true; // disables multiplayer connections (overridden in multiplayer game)

var countries = ['AncientGreece', 'Athens', 'Aztecs', 'Britain', 'ByzantineEmpire',
                 'Conquistadors', 'Huns', 'Hurons', 'Incas', 'Jerusalem', 
                 'Macedonia', 'MedievalBritain', 'Mongols', 'PapalStates', 'Sparta', 
                 'Transylvania'];

var countriesAncient = ['AncientGreece', 'Athens', 'Huns', 'Macedonia', 'Sparta'];
var countriesMedieval = ['Aztecs', 'ByzantineEmpire', 'Conquistadors', 'Incas', 'Jerusalem', 
                         'MedievalBritain', 'Mongols'];
var countriesEnlightenment = ['Britain', 'Hurons', 'PapalStates'];
var countriesFantasy = ['Transylvania'];

// start game

var game = new Game();
game.setup();
game.alert('Choose countries');

// polling

setInterval(function () { game.pollGameState(); }, 2500);

// setup

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

// (phased out - only for local testing)
if ($('startButton')) {
	$('startButton').addEvent('click', function() {
		if ($$('#setup select').every(function (dropdown) {
			return (dropdown.getSelected()[0].value != '');
		})) {
				game.addPlayer($('selectRed').getSelected()[0].value, 'red');
				game.addPlayer($('selectGreen').getSelected()[0].value, 'green');
				game.addPlayer($('selectYellow').getSelected()[0].value, 'yellow');
				game.addPlayer($('selectBlue').getSelected()[0].value, 'blue');
				game.startGame();
		}
	});
}

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