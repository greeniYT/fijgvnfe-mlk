

var logueado = false;

var LANGS_OBJ    = {
		"en" : 0,
		"de" : 1,
		"nl" : 2
	};
	var selectedLang = LANGS_OBJ.en;
	try {
		var search       = location.search.substring(1);
		var searchParams = JSON.parse(
			"{\"" + decodeURI(search).replace(/"/g, "\\\"").replace(/&/g, "\",\"").replace(/=/g, "\":\"") + "\"}");

		selectedLang = LANGS_OBJ[ searchParams.locale ] || LANGS_OBJ.en;
	} catch (e) {}

	//lang
	var lenguajeManual = true;
	var lenguajeEl     = selectedLang;
	//end lang
        
    var APP = null;
    var hiloStart = null;    
    var timeToStartGame = 300;
	 hiloStart = setInterval(esperaJuegoListo,300);
	
	function esperaJuegoListo()
	{
		if(APP != null)
		{		
		
			onGameLoad();
			clearInterval(hiloStart);          
			hiloStart = setInterval(empezarJuego,timeToStartGame);
		}
	}
	function empezarJuego()
	{
		clearInterval(hiloStart);       
		APP.start();	
		
			if(isMobile.any())
			{
				window.innerWidth  = document.body.offsetWidth;
				window.innerHeight = document.body.offsetHeight;				
				var width  = Math.min(window.innerWidth, window.innerHeight);
				var height = Math.max(window.innerWidth, window.innerHeight);
				APP.resizeCanvas(width, height);
			}			
	}
	
	var isMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
            },
            any: function() {
                 return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows() || (window.devicePixelRatio >= 2 && navigator.maxTouchPoints > 0) );
            }
        };
        
    var landscapeMode = false;
	var randomLevels = true;
	var soundOff      = true;
	var rotate        = document.getElementById("rotate");
		//rotate.style.display = "none";
	var width, height;
	if (window.isMobile.any() && window.innerHeight < window.innerWidth) {
		landscapeMode      = true;
		width              = window.innerWidth;
		height             = window.innerHeight;
		window.innerWidth  = height;
		window.innerHeight = width;
	}        

	function loadjscssfile(filename, filetype) {
		if (filetype == "js") { //if filename is a external JavaScript file
			var fileref = document.createElement("script");
			fileref.setAttribute("type", "text/javascript");
			fileref.setAttribute("src", filename);
		} else if (filetype == "css") { //if filename is an external CSS file
			var fileref = document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", filename);
		}
		if (typeof fileref != "undefined")
			document.getElementsByTagName("head")[ 0 ].appendChild(fileref);
	}
var aa = false;
if(!isMobile.any())
	aa = true;
ASSET_PREFIX = "";
SCRIPT_PREFIX = "";
SCENE_PATH = "1105270.json";
CONTEXT_OPTIONS = {
    'antialias': aa,
    'alpha': true,
    'preserveDrawingBuffer': false,
    'preferWebGl2': false,
    'powerPreference': "high-performance"
};
SCRIPTS = [ 43745247, 43745249, 43745235, 43745388, 43745305, 43745232, 43745233, 43745067, 43745237, 43745238, 43745240, 43745236, 43745241, 43745242, 43745244, 43745239, 43745523, 43745245, 43745246, 43745248, 43745229, 43745251, 43745250, 43745228, 43745230, 43745252, 43745243, 43745254, 43745253, 43745330, 43745902, 43745516, 43744920, 43745525, 43745781, 43745784, 43745736, 43745338, 43745391, 43745356, 43745782, 43745783, 43745041, 43745659, 43745822, 43745045, 43745091, 43745262, 43745789, 43745788, 43745658, 43745306, 43745393, 43745451, 43745353, 43745448, 43745438, 43745654, 43745675, 43745422, 43745323, 43745321, 43745322, 43745325, 43745324, 43745319, 43745695, 43745509, 45136622 ];
if(!isMobile.any())
    CONFIG_FILENAME = "config.json";
else 
   CONFIG_FILENAME = "config_mobile.json";
INPUT_SETTINGS = {
    useKeyboard: true,
    useMouse: true,
    useGamepads: false,
    useTouch: true
};
pc.script.legacy = false;
PRELOAD_MODULES = [
    {'moduleName' : 'Ammo', 'glueUrl' : 'files/assets/43745082/1/ammo.wasm.js', 'wasmUrl' : 'files/assets/43745074/1/ammo.wasm.wasm', 'fallbackUrl' : 'files/assets/43745076/1/ammo.js', 'preload' : true},
];











(
		function() {
			"use strict";
		
			var scope          = {};

			function getScore() {
				return _globalScore;
			}

			var startInterval;
			Object.defineProperty(scope, "quickstartGame", {
				value : function quickstartGame() {
					clearTimeout(startInterval);
					try {
						if (window.gameFinished) return;
                     if (_control && _control.screen2D.findByName("Logo").enabled) {
						    skipMenu = true;
                        if(_control != null)
                           _control.finalForzado();
                     }
                     else{
							startInterval = setTimeout(scope.quickstartGame, 300);
						}
                     
					} catch (e) {}
				}
			});
			Object.defineProperties(window, {
				onGameUpdate : {
					value : function(scoreAdded) {
					
					}
				},
				onGameLoad : {
					value : function onGameLoad(time) {
						if (window.gameFinished) return;
						console.log("GAME LOAD WAS CALLED!!! ", time);
						if (landscapeMode) {
							window.innerWidth  = height;
							window.innerHeight = width;
                         rotate = document.getElementById("rotate");
							rotate.style.display = "block";
						}
						if (window.isMobile.any()) {
							window.addEventListener("resize", ChangeOrientation, false);
							window.addEventListener("orientationchange", ChangeOrientation, false);
						}
					}
				},

				onGameStart : {
					value : function onGameStart() {
					
					}
				},

				onGameEnd : {
					value : function onGameEnd() {					
						Object.defineProperty(window, "gameFinished", {
							value : true
						});
					}
				}
			});

			function ChangeOrientation() {
				window.innerWidth  = document.body.offsetWidth;
				window.innerHeight = document.body.offsetHeight;
				if (document.body.offsetHeight < document.body.offsetWidth) {
					rotate.style.display = "block";
				} else {
					rotate.style.display = "none";
				}
				var width  = Math.min(window.innerWidth, window.innerHeight);
				var height = Math.max(window.innerWidth, window.innerHeight);
				APP.resizeCanvas(width, height);
			}

		
		}
	)();

