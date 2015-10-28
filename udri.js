var renderer = PIXI.autoDetectRenderer(852, 387, { backgroundColor: 0xAAAAAA, transparent: false });
document.body.appendChild(renderer.view);
var stage = new PIXI.Container();
PIXI.ticker.shared.add(function (time) {
	renderer.render(stage);
});

var punchSound = new Howl({urls: ['sounds/punch_or_whack_-Vladimir-403040765.mp3']});
var slapSound = new Howl({urls: ['sounds/Slap-SoundMaster13-49669815.mp3']});

var loader = new PIXI.loaders.Loader();
for (var i = 0; i < 3; i++) {
	loader.add('img/plesnica'+i+'.png','img/plesnica'+i+'.png');
	loader.add('img/umruk'+i+'.png','img/umruk'+i+'.png');
}
loader.once('complete', loaded);
loader.load();

var counters = {
	plesnici: 0,
	umruci: 0
};

var unsent = {
	plesnici: 0,
	umruci: 0
};

var plesnica, umruk;

var buttonUmruk = document.getElementById('umruk');
var buttonPlesnica = document.getElementById('plesnica');

// a function which scales the canvas to fit in the window
var resizeCanvas = function() {
	var width = window.innerWidth,
		height = window.innerHeight,
		scale = Math.min(width / renderer.view.width, height / renderer.view.height);

	var newWidth = renderer.view.width * scale,
		newHeight = renderer.view.height * scale;

	var buttonsHeight = window.innerHeight - newHeight - 90;
	if (buttonsHeight < 50) buttonsHeight = 50;

	renderer.view.style.width = newWidth + 'px';
	renderer.view.style.height = newHeight + 'px';
	renderer.view.style.left = ((width - newWidth) / 2) + 'px';
	renderer.view.style.top = 90 + 'px';
	document.body.style.width = window.innerWidth + 'px';
	document.body.style.height = window.innerHeight + 'px';
	buttonUmruk.style.height = buttonsHeight + 'px';
	buttonPlesnica.style.height = buttonsHeight + 'px';
	document.getElementById('addthis').style.bottom = buttonsHeight + 'px';
	document.getElementById('totalCounter').style.bottom = (buttonsHeight + 28) + 'px';
};

// rescale the canvas on window resize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initMovieClips() {
	var framesPlesnica = [];
	var framesUmruk = [];
	for (var i = 0; i < 3; i++) {
		framesPlesnica.push(PIXI.Texture.fromImage('img/plesnica' + i + '.png'));
		framesUmruk.push(PIXI.Texture.fromImage('img/umruk' + i + '.png'));
	}
	
	plesnica = new PIXI.extras.MovieClip(framesPlesnica);
	plesnica.loop = false;
	plesnica.visible = false;
	plesnica.animationSpeed = 0.15;

	umruk = new PIXI.extras.MovieClip(framesUmruk);
	umruk.loop = false;
	umruk.visible = false;
	umruk.animationSpeed = 0.15;

	stage.addChild(plesnica);
	stage.addChild(umruk);
	plesnica.onComplete = function() {
		plesnica.gotoAndStop(0);
		addScore('plesnica');
		activateButtons();
	}
	umruk.onComplete = function() {
		umruk.gotoAndStop(0);
		addScore('umruk');
		activateButtons();
	}
}

function udariUmruk() {
	punchSound.play();
	deactivateButtons();
	plesnica.visible = false;
	umruk.visible = true;
	umruk.gotoAndPlay(0);
}

function udariPlesnica() {
	slapSound.play();
	deactivateButtons();
	umruk.visible = false;
	plesnica.visible = true;
	plesnica.gotoAndPlay(0);
}

function addScore( type ) {
	if ( type === 'umruk' ) {
		unsent.umruci++;
		counters.umruci++;
		document.getElementById('counterUmruci').innerHTML = 'Юмруци: ' + counters.umruci;
	} else {
		unsent.plesnici++;
		counters.plesnici++;
		document.getElementById('counterPlesnici').innerHTML = 'Плесници: ' + counters.plesnici;
	}
}

function deactivateButtons() {
	buttonUmruk.disabled = true;
	buttonPlesnica.disabled = true;
}

function activateButtons() {
	buttonUmruk.disabled = false;
	buttonPlesnica.disabled = false;
}

function loaded() {
	initMovieClips();
	document.body.removeChild(document.getElementById('preloader'));
	umruk.gotoAndStop(0);
	umruk.visible = true;
};

var _tmp = 0;
function hasToSendAjax() {
    if (unsent.umruci > 0 || unsent.plesnici > 0) return true;
    if (_tmp >= 3) { _tmp = 0; return true; }
    _tmp++;
    return false;
}

function updateCounters(force) {
	if (force || hasToSendAjax()) {
		$.ajax({
			type: 'post',
			url: 'http://91.230.195.67/volen_server/',
			data: {
				'punches': unsent.umruci,
				'slaps': unsent.plesnici
			},
			dataType: 'json',
			success: function(r) {
				document.getElementById('totalUsers').innerHTML = r.users;
				document.getElementById('totalPunches').innerHTML = r.punches;
				document.getElementById('totalSlaps').innerHTML = r.slaps;
			}
		});
		unsent.umruci = 0;
		unsent.plesnici = 0;
	}
}

setInterval(function() { updateCounters(); }, 5000);
updateCounters(true);
