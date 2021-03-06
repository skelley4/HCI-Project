(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
//the webcam functionality came from the WebRTC library which is included in html5
//this can be found at https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
//for our image text recognition we utilize the module tesseract.js
//the code for which can be found at https://github.com/naptha/tesseract.js#tesseractjs
//the future implementation for the text to keyword that we are currently trying to get off the ground is node-rake
// this code can be found at https://www.npmjs.com/package/node-rake
//currently this section is not working due to some issue with the fs package not being able to properly access the filestreaming.
//this project is to capture an image of text, and display that output text and then pass it to a keyword extractor to come to a set of keywords.

//for this project to work in its current state you will need the following packages, tesseract.js, fs, live-server, and in the future node-rake
//the only command lines that will need to be done to run is: live-server
//this command will grab the index.html file and create a local server instance for it, and will open up a webpage based on this.
//currently the js file that is listed as the scripting file is the testing.js file which is a packaged file of the capture.js fileCreatedDate
//this was done with the package browserify, the line of code that was used for this is: browserify capture.js > testing.js
//if the live-server command listed earlyer does not produce the expected results please contact me directly via phone or email
//Phone:2103247171
//Email:jguevara2@islander.tamucc.edu


(function() {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  var width = 720;    // We will scale the photo width to this
  var height = 0;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;
  // include teseract ocr
  const Tesseract = require('tesseract.js');
  
  //const rake = require('node-rake');
  var keyword_extractor = require("keyword-extractor");
  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.
  //this is a test sentence for the keyword-extractor to test if it would work within the live-server enviroment
var sentence = "President Obama woke up Monday facing a Congressional defeat that many in both parties believed could hobble his presidency."
 
//  Extract the keywords

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;
  var startbtn = null;
  

  function startup() {
    video = document.getElementById('videoElement');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');

    navigator.getMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);

    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
      
        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.
      
        if (isNaN(height)) {
          height = width / (4/3);
        }
      
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    startbutton.addEventListener('click', function(ev){
      takepicture();
      ev.preventDefault();
    }, false);
    
    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }
  
  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
    //in this section we turn the canvas to a datauri
      var data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
    } else {
      clearphoto();
    }
/* 	var extraction_result = keyword_extractor.extract(sentence,{
                                                                language:"english",
                                                                remove_digits: true,
                                                                return_changed_case:true,
                                                                remove_duplicates: false
 
                                                           });
														   
	console.log(extraction_result); */
	Tesseract.recognize(canvas.getContext('2d'))
		.then(function(result){
			//this section will change the result of the first text box to the tesseract output
			document.getElementById("myspan").innerText=result.text;
 				var extraction_result = keyword_extractor.extract(result.text,{
                                                                language:"english",
                                                                remove_digits: true,
                                                                return_changed_case:true,
                                                                remove_duplicates: false
 
                                                           }); 
				document.getElementById("endingid").innerText= extraction_result;	
			
			})
  }
    // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
})();
},{"keyword-extractor":3,"tesseract.js":23}],3:[function(require,module,exports){
module.exports = require('./lib/keyword_extractor');
},{"./lib/keyword_extractor":4}],4:[function(require,module,exports){
var _ = require("underscore");
_.str = require('underscore.string');
var supported_languages = ["danish","dutch","english","french","galician","german","italian","polish","portuguese","russian","spanish","swedish"];
var stopwords = require("./stopwords/stopwords");

function _extract(str, options){
    if(_.isEmpty(str)){
        return [];
    }
    if(_.isEmpty(options)){
        options = {
            remove_digits: true,
            return_changed_case: true
        };
    }
    var return_changed_case = options.return_changed_case;
    var return_chained_words = options.return_chained_words;
    var remove_digits = options.remove_digits;
    var _language = options.language || "english";
    var _remove_duplicates = options.remove_duplicates || false;
    var return_max_ngrams = options.return_max_ngrams;

    if(supported_languages.indexOf(_language) < 0){
        throw new Error("Language must be one of ["+supported_languages.join(",")+"]");
    }

    //  strip any HTML and trim whitespace
    var text = _.str.trim(_.str.stripTags(str));
    if(_.isEmpty(text)){
        return [];
    }else{
        var words = text.split(/\s/);
        var unchanged_words = [];
        var low_words = [];
        //  change the case of all the words
        for(var x = 0;x < words.length; x++){
            var w = words[x].match(/https?:\/\/.*[\r\n]*/g) ? words[x] : words[x].replace(/\.|,|;|!|\?|\(|\)|:|"|^'|'$|ΓÇ£|ΓÇ¥|ΓÇÿ|ΓÇÖ/g,'');
            //  remove periods, question marks, exclamation points, commas, and semi-colons
            //  if this is a short result, make sure it's not a single character or something 'odd'
            if(w.length === 1){
                w = w.replace(/-|_|@|&|#/g,'');
            }
            //  if it's a number, remove it
            var digits_match = w.match(/\d/g);
            if(remove_digits && digits_match && digits_match.length === w.length){
                w = "";
            }
            if(w.length > 0){
                low_words.push(w.toLowerCase());
                unchanged_words.push(w);
            }
        }
        var results = [];
        var _stopwords = options.stopwords || _getStopwords({ language: _language });
        var _last_result_word_index = 0;
        var _start_result_word_index = 0;
	var _unbroken_word_chain = false;
        for(var y = 0; y < low_words.length; y++){

            if(_stopwords.indexOf(low_words[y]) < 0){
                
                if(_last_result_word_index !== y - 1){
                    _start_result_word_index = y;
                    _unbroken_word_chain = false; 
		} else {
	            _unbroken_word_chain = true;
		}
                var result_word = return_changed_case && !unchanged_words[y].match(/https?:\/\/.*[\r\n]*/g) ? low_words[y] : unchanged_words[y];
                
                if (return_max_ngrams && _unbroken_word_chain && !return_chained_words && return_max_ngrams > (y - _start_result_word_index) && _last_result_word_index === y - 1){
                    var change_pos = results.length - 1 < 0 ? 0 : results.length - 1;
                    results[change_pos] = results[change_pos] ? results[change_pos] + ' ' + result_word : result_word;
                } else if (return_chained_words && _last_result_word_index === y - 1) {
                  var change_pos = results.length - 1 < 0 ? 0 : results.length - 1;
                  results[change_pos] = results[change_pos] ? results[change_pos] + ' ' + result_word : result_word;
                } else {
                  results.push(result_word);
                }

                _last_result_word_index = y;
            } else {
		_unbroken_word_chain = false;
	    }
        }

        if(_remove_duplicates) {
            results= _.uniq(results, function (item) {
                return item;
            });
        }

        return results;
    }
}

function _getStopwords(options){
    options = options || {};

    var _language = options.language || "english";
    if(supported_languages.indexOf(_language) < 0){
        throw new Error("Language must be one of ["+supported_languages.join(",")+"]");
    }

    return stopwords[_language];
}

module.exports = {
    extract:_extract,
    getStopwords: _getStopwords
};

},{"./stopwords/stopwords":17,"underscore":25,"underscore.string":24}],5:[function(require,module,exports){
// Danish stopwords
// http://www.ranks.nl/stopwords/danish
// https://github.com/dnohr

module.exports = {
    stopwords: [
		"ad",
		"af",
		"aldrig",
		"alle",
		"alt",
		"altid",
		"anden",
		"andet",
		"andre",
		"at",
		"bagved",
		"begge",
		"blev",
		"blive",
		"bliver",
		"da",
		"de",
		"dem",
		"den",
		"denne",
		"der",
		"deres",
		"det",
		"dette",
		"dig",
		"din",
		"disse",
		"dog",
		"du",
		"efter",
		"ej",
		"eller",
		"en",
		"end",
		"endnu",
		"ene",
		"eneste",
		"enhver",
		"er",
		"et",
		"fem",
		"fire",
		"fjernt",
		"flere",
		"fleste",
		"for",
		"foran",
		"fordi",
		"forrige",
		"fra",
		"f├Ñ",
		"f├╕r",
		"gennem",
		"god",
		"ham",
		"han",
		"hans",
		"har",
		"havde",
		"have",
		"hende",
		"hendes",
		"her",
		"hos",
		"hovfor",
		"hun",
		"hurtig",
		"hvad",
		"hvem",
		"hver",
		"hvilken",
		"hvis",
		"hvon├Ñr",
		"hvor",
		"hvordan",
		"hvorfor",
		"hvorhen",
		"hvorn├Ñr",
		"i",
		"ikke",
		"imod",
		"ind",
		"ingen",
		"intet",
		"ja",
		"jeg",
		"jer",
		"jeres",
		"jo",
		"kan",
		"kom",
		"kommer",
		"kunne",
		"langsom",
		"lav",
		"lidt",
		"lille",
		"man",
		"mand",
		"mange",
		"med",
		"meget",
		"mellem",
		"men",
		"mens",
		"mere",
		"mig",
		"min",
		"mindre",
		"mine",
		"mit",
		"mod",
		"m├Ñske",
		"ned",
		"nede",
		"nej",
		"ni",
		"nogen",
		"noget",
		"nogle",
		"nok",
		"nu",
		"ny",
		"nyt",
		"n├Ñr",
		"n├ªr",
		"n├ªste",
		"n├ªsten",
		"og",
		"ogs├Ñ",
		"om",
		"op",
		"oppe",
		"os",
		"otte",
		"over",
		"p├Ñ",
		"rask",
		"sammen",
		"se",
		"seks",
		"selv",
		"ses",
		"sig",
		"sin",
		"sine",
		"sit",
		"skal",
		"skulle",
		"som",
		"stor",
		"store",
		"syv",
		"s├Ñdan",
		"temmelig",
		"thi",
		"ti",
		"til",
		"to",
		"tre",
		"ud",
		"uden",
		"udenfor",
		"under",
		"var",
		"ved",
		"vi",
		"vil",
		"ville",
		"vor",
		"v├ªre",
		"v├ªret"
    ]
};
},{}],6:[function(require,module,exports){
/**
 * Created by jan on 9-3-15.
 */
// German stopwords
// via https://code.google.com/p/stop-words/
module.exports = {
    stopwords: [
        "a",
        "ab",
        "aber",
        "ach",
        "acht",
        "achte",
        "achten",
        "achter",
        "achtes",
        "ag",
        "alle",
        "allein",
        "allem",
        "allen",
        "aller",
        "allerdings",
        "alles",
        "allgemeinen",
        "als",
        "also",
        "am",
        "an",
        "andere",
        "anderen",
        "andern",
        "anders",
        "au",
        "auch",
        "auf",
        "aus",
        "ausser",
        "au├ƒer",
        "ausserdem",
        "au├ƒerdem",
        "b",
        "bald",
        "bei",
        "beide",
        "beiden",
        "beim",
        "beispiel",
        "bekannt",
        "bereits",
        "besonders",
        "besser",
        "besten",
        "bin",
        "bis",
        "bisher",
        "bist",
        "c",
        "d",
        "da",
        "dabei",
        "dadurch",
        "daf├╝r",
        "dagegen",
        "daher",
        "dahin",
        "dahinter",
        "damals",
        "damit",
        "danach",
        "daneben",
        "dank",
        "dann",
        "daran",
        "darauf",
        "daraus",
        "darf",
        "darfst",
        "darin",
        "dar├╝ber",
        "darum",
        "darunter",
        "das",
        "dasein",
        "daselbst",
        "dass",
        "da├ƒ",
        "dasselbe",
        "davon",
        "davor",
        "dazu",
        "dazwischen",
        "dein",
        "deine",
        "deinem",
        "deiner",
        "dem",
        "dementsprechend",
        "demgegen├╝ber",
        "demgem├ñss",
        "demgem├ñ├ƒ",
        "demselben",
        "demzufolge",
        "den",
        "denen",
        "denn",
        "denselben",
        "der",
        "deren",
        "derjenige",
        "derjenigen",
        "dermassen",
        "derma├ƒen",
        "derselbe",
        "derselben",
        "des",
        "deshalb",
        "desselben",
        "dessen",
        "deswegen",
        "d.h",
        "dich",
        "die",
        "diejenige",
        "diejenigen",
        "dies",
        "diese",
        "dieselbe",
        "dieselben",
        "diesem",
        "diesen",
        "dieser",
        "dieses",
        "dir",
        "doch",
        "dort",
        "drei",
        "drin",
        "dritte",
        "dritten",
        "dritter",
        "drittes",
        "du",
        "durch",
        "durchaus",
        "d├╝rfen",
        "d├╝rft",
        "durfte",
        "durften",
        "e",
        "eben",
        "ebenso",
        "ehrlich",
        "ei",
        "ei,",
        "eigen",
        "eigene",
        "eigenen",
        "eigener",
        "eigenes",
        "ein",
        "einander",
        "eine",
        "einem",
        "einen",
        "einer",
        "eines",
        "einige",
        "einigen",
        "einiger",
        "einiges",
        "einmal",
        "eins",
        "elf",
        "en",
        "ende",
        "endlich",
        "entweder",
        "er",
        "Ernst",
        "erst",
        "erste",
        "ersten",
        "erster",
        "erstes",
        "es",
        "etwa",
        "etwas",
        "euch",
        "f",
        "fr├╝her",
        "f├╝nf",
        "f├╝nfte",
        "f├╝nften",
        "f├╝nfter",
        "f├╝nftes",
        "f├╝r",
        "g",
        "gab",
        "ganz",
        "ganze",
        "ganzen",
        "ganzer",
        "ganzes",
        "gar",
        "gedurft",
        "gegen",
        "gegen├╝ber",
        "gehabt",
        "gehen",
        "geht",
        "gekannt",
        "gekonnt",
        "gemacht",
        "gemocht",
        "gemusst",
        "genug",
        "gerade",
        "gern",
        "gesagt",
        "geschweige",
        "gewesen",
        "gewollt",
        "geworden",
        "gibt",
        "ging",
        "gleich",
        "gott",
        "gross",
        "gro├ƒ",
        "grosse",
        "gro├ƒe",
        "grossen",
        "gro├ƒen",
        "grosser",
        "gro├ƒer",
        "grosses",
        "gro├ƒes",
        "gut",
        "gute",
        "guter",
        "gutes",
        "h",
        "habe",
        "haben",
        "habt",
        "hast",
        "hat",
        "hatte",
        "h├ñtte",
        "hatten",
        "h├ñtten",
        "heisst",
        "her",
        "heute",
        "hier",
        "hin",
        "hinter",
        "hoch",
        "i",
        "ich",
        "ihm",
        "ihn",
        "ihnen",
        "ihr",
        "ihre",
        "ihrem",
        "ihren",
        "ihrer",
        "ihres",
        "im",
        "immer",
        "in",
        "indem",
        "infolgedessen",
        "ins",
        "irgend",
        "ist",
        "j",
        "ja",
        "jahr",
        "jahre",
        "jahren",
        "je",
        "jede",
        "jedem",
        "jeden",
        "jeder",
        "jedermann",
        "jedermanns",
        "jedoch",
        "jemand",
        "jemandem",
        "jemanden",
        "jene",
        "jenem",
        "jenen",
        "jener",
        "jenes",
        "jetzt",
        "k",
        "kam",
        "kann",
        "kannst",
        "kaum",
        "kein",
        "keine",
        "keinem",
        "keinen",
        "keiner",
        "kleine",
        "kleinen",
        "kleiner",
        "kleines",
        "kommen",
        "kommt",
        "k├╢nnen",
        "k├╢nnt",
        "konnte",
        "k├╢nnte",
        "konnten",
        "kurz",
        "l",
        "lang",
        "lange",
        "leicht",
        "leide",
        "lieber",
        "los",
        "m",
        "machen",
        "macht",
        "machte",
        "mag",
        "magst",
        "mahn",
        "man",
        "manche",
        "manchem",
        "manchen",
        "mancher",
        "manches",
        "mann",
        "mehr",
        "mein",
        "meine",
        "meinem",
        "meinen",
        "meiner",
        "meines",
        "mensch",
        "menschen",
        "mich",
        "mir",
        "mit",
        "mittel",
        "mochte",
        "m├╢chte",
        "mochten",
        "m├╢gen",
        "m├╢glich",
        "m├╢gt",
        "morgen",
        "muss",
        "mu├ƒ",
        "m├╝ssen",
        "musst",
        "m├╝sst",
        "musste",
        "mussten",
        "n",
        "na",
        "nach",
        "nachdem",
        "nahm",
        "nat├╝rlich",
        "neben",
        "nein",
        "neue",
        "neuen",
        "neun",
        "neunte",
        "neunten",
        "neunter",
        "neuntes",
        "nicht",
        "nichts",
        "nie",
        "niemand",
        "niemandem",
        "niemanden",
        "noch",
        "nun",
        "nur",
        "o",
        "ob",
        "oben",
        "oder",
        "offen",
        "oft",
        "ohne",
        "Ordnung",
        "p",
        "q",
        "r",
        "recht",
        "rechte",
        "rechten",
        "rechter",
        "rechtes",
        "richtig",
        "rund",
        "s",
        "sa",
        "sache",
        "sagt",
        "sagte",
        "sah",
        "satt",
        "schlecht",
        "Schluss",
        "schon",
        "sechs",
        "sechste",
        "sechsten",
        "sechster",
        "sechstes",
        "sehr",
        "sei",
        "seid",
        "seien",
        "sein",
        "seine",
        "seinem",
        "seinen",
        "seiner",
        "seines",
        "seit",
        "seitdem",
        "selbst",
        "sich",
        "sie",
        "sieben",
        "siebente",
        "siebenten",
        "siebenter",
        "siebentes",
        "sind",
        "so",
        "solang",
        "solche",
        "solchem",
        "solchen",
        "solcher",
        "solches",
        "soll",
        "sollen",
        "sollte",
        "sollten",
        "sondern",
        "sonst",
        "sowie",
        "sp├ñter",
        "statt",
        "t",
        "tag",
        "tage",
        "tagen",
        "tat",
        "teil",
        "tel",
        "tritt",
        "trotzdem",
        "tun",
        "u",
        "├╝ber",
        "├╝berhaupt",
        "├╝brigens",
        "uhr",
        "um",
        "und",
        "und?",
        "uns",
        "unser",
        "unsere",
        "unserer",
        "unter",
        "v",
        "vergangenen",
        "viel",
        "viele",
        "vielem",
        "vielen",
        "vielleicht",
        "vier",
        "vierte",
        "vierten",
        "vierter",
        "viertes",
        "vom",
        "von",
        "vor",
        "w",
        "wahr?",
        "w├ñhrend",
        "w├ñhrenddem",
        "w├ñhrenddessen",
        "wann",
        "war",
        "w├ñre",
        "waren",
        "wart",
        "warum",
        "was",
        "wegen",
        "weil",
        "weit",
        "weiter",
        "weitere",
        "weiteren",
        "weiteres",
        "welche",
        "welchem",
        "welchen",
        "welcher",
        "welches",
        "wem",
        "wen",
        "wenig",
        "wenige",
        "weniger",
        "weniges",
        "wenigstens",
        "wenn",
        "wer",
        "werde",
        "werden",
        "werdet",
        "wessen",
        "wie",
        "wieder",
        "will",
        "willst",
        "wir",
        "wird",
        "wirklich",
        "wirst",
        "wo",
        "wohl",
        "wollen",
        "wollt",
        "wollte",
        "wollten",
        "worden",
        "wurde",
        "w├╝rde",
        "wurden",
        "w├╝rden",
        "x",
        "y",
        "z",
        "z.b",
        "zehn",
        "zehnte",
        "zehnten",
        "zehnter",
        "zehntes",
        "zeit",
        "zu",
        "zuerst",
        "zugleich",
        "zum",
        "zun├ñchst",
        "zur",
        "zur├╝ck",
        "zusammen",
        "zwanzig",
        "zwar",
        "zwei",
        "zweite",
        "zweiten",
        "zweiter",
        "zweites",
        "zwischen",
        "zw├╢lf",
        "∩╗┐aber",
        "euer",
        "eure",
        "hattest",
        "hattet",
        "jedes",
        "mu├ƒt",
        "m├╝├ƒt",
        "sollst",
        "sollt",
        "soweit",
        "weshalb",
        "wieso",
        "woher",
        "wohin"
    ]

};
},{}],7:[function(require,module,exports){
// via http://jmlr.org/papers/volume5/lewis04a/a11-smart-stop-list/english.stop
module.exports = {
    stopwords:[
        "a",
        "a's",
        "able",
        "about",
        "above",
        "according",
        "accordingly",
        "across",
        "actually",
        "after",
        "afterwards",
        "again",
        "against",
        "ain't",
        "all",
        "allow",
        "allows",
        "almost",
        "alone",
        "along",
        "already",
        "also",
        "although",
        "always",
        "am",
        "among",
        "amongst",
        "an",
        "and",
        "another",
        "any",
        "anybody",
        "anyhow",
        "anyone",
        "anything",
        "anyway",
        "anyways",
        "anywhere",
        "apart",
        "appear",
        "appreciate",
        "appropriate",
        "are",
        "aren't",
        "around",
        "as",
        "aside",
        "ask",
        "asking",
        "associated",
        "at",
        "available",
        "away",
        "awfully",
        "b",
        "be",
        "became",
        "because",
        "become",
        "becomes",
        "becoming",
        "been",
        "before",
        "beforehand",
        "behind",
        "being",
        "believe",
        "below",
        "beside",
        "besides",
        "best",
        "better",
        "between",
        "beyond",
        "both",
        "brief",
        "but",
        "by",
        "c",
        "c'mon",
        "c's",
        "came",
        "can",
        "can't",
        "cannot",
        "cant",
        "cause",
        "causes",
        "certain",
        "certainly",
        "changes",
        "clearly",
        "co",
        "com",
        "come",
        "comes",
        "concerning",
        "consequently",
        "consider",
        "considering",
        "contain",
        "containing",
        "contains",
        "corresponding",
        "could",
        "couldn't",
        "course",
        "currently",
        "d",
        "definitely",
        "described",
        "despite",
        "did",
        "didn't",
        "different",
        "do",
        "does",
        "doesn't",
        "doing",
        "don't",
        "done",
        "down",
        "downwards",
        "during",
        "e",
        "each",
        "edu",
        "eg",
        "eight",
        "either",
        "else",
        "elsewhere",
        "enough",
        "entirely",
        "especially",
        "et",
        "etc",
        "even",
        "ever",
        "every",
        "everybody",
        "everyone",
        "everything",
        "everywhere",
        "ex",
        "exactly",
        "example",
        "except",
        "f",
        "far",
        "few",
        "fifth",
        "first",
        "five",
        "followed",
        "following",
        "follows",
        "for",
        "former",
        "formerly",
        "forth",
        "four",
        "from",
        "further",
        "furthermore",
        "g",
        "get",
        "gets",
        "getting",
        "given",
        "gives",
        "go",
        "goes",
        "going",
        "gone",
        "got",
        "gotten",
        "greetings",
        "h",
        "had",
        "hadn't",
        "happens",
        "hardly",
        "has",
        "hasn't",
        "have",
        "haven't",
        "having",
        "he",
        "he's",
        "hello",
        "help",
        "hence",
        "her",
        "here",
        "here's",
        "hereafter",
        "hereby",
        "herein",
        "hereupon",
        "hers",
        "herself",
        "hi",
        "him",
        "himself",
        "his",
        "hither",
        "hopefully",
        "how",
        "howbeit",
        "however",
        "i",
        "i'd",
        "i'll",
        "i'm",
        "i've",
        "ie",
        "if",
        "ignored",
        "immediate",
        "in",
        "inasmuch",
        "inc",
        "indeed",
        "indicate",
        "indicated",
        "indicates",
        "inner",
        "insofar",
        "instead",
        "into",
        "inward",
        "is",
        "isn't",
        "it",
        "it'd",
        "it'll",
        "it's",
        "its",
        "itself",
        "j",
        "just",
        "k",
        "keep",
        "keeps",
        "kept",
        "know",
        "knows",
        "known",
        "l",
        "last",
        "lately",
        "later",
        "latter",
        "latterly",
        "least",
        "less",
        "lest",
        "let",
        "let's",
        "like",
        "liked",
        "likely",
        "little",
        "look",
        "looking",
        "looks",
        "ltd",
        "m",
        "mainly",
        "many",
        "may",
        "maybe",
        "me",
        "mean",
        "meanwhile",
        "merely",
        "might",
        "more",
        "moreover",
        "most",
        "mostly",
        "much",
        "must",
        "my",
        "myself",
        "n",
        "name",
        "namely",
        "nd",
        "near",
        "nearly",
        "necessary",
        "need",
        "needs",
        "neither",
        "never",
        "nevertheless",
        "new",
        "next",
        "nine",
        "no",
        "nobody",
        "non",
        "none",
        "noone",
        "nor",
        "normally",
        "not",
        "nothing",
        "novel",
        "now",
        "nowhere",
        "o",
        "obviously",
        "of",
        "off",
        "often",
        "oh",
        "ok",
        "okay",
        "old",
        "on",
        "once",
        "one",
        "ones",
        "only",
        "onto",
        "or",
        "other",
        "others",
        "otherwise",
        "ought",
        "our",
        "ours",
        "ourselves",
        "out",
        "outside",
        "over",
        "overall",
        "own",
        "p",
        "particular",
        "particularly",
        "per",
        "perhaps",
        "placed",
        "please",
        "plus",
        "possible",
        "presumably",
        "probably",
        "provides",
        "q",
        "que",
        "quite",
        "qv",
        "r",
        "rather",
        "rd",
        "re",
        "really",
        "reasonably",
        "regarding",
        "regardless",
        "regards",
        "relatively",
        "respectively",
        "right",
        "s",
        "said",
        "same",
        "saw",
        "say",
        "saying",
        "says",
        "second",
        "secondly",
        "see",
        "seeing",
        "seem",
        "seemed",
        "seeming",
        "seems",
        "seen",
        "self",
        "selves",
        "sensible",
        "sent",
        "serious",
        "seriously",
        "seven",
        "several",
        "shall",
        "she",
        "should",
        "shouldn't",
        "since",
        "six",
        "so",
        "some",
        "somebody",
        "somehow",
        "someone",
        "something",
        "sometime",
        "sometimes",
        "somewhat",
        "somewhere",
        "soon",
        "sorry",
        "specified",
        "specify",
        "specifying",
        "still",
        "sub",
        "such",
        "sup",
        "sure",
        "t",
        "t's",
        "take",
        "taken",
        "tell",
        "tends",
        "th",
        "than",
        "thank",
        "thanks",
        "thanx",
        "that",
        "that's",
        "thats",
        "the",
        "their",
        "theirs",
        "them",
        "themselves",
        "then",
        "thence",
        "there",
        "there's",
        "thereafter",
        "thereby",
        "therefore",
        "therein",
        "theres",
        "thereupon",
        "these",
        "they",
        "they'd",
        "they'll",
        "they're",
        "they've",
        "think",
        "third",
        "this",
        "thorough",
        "thoroughly",
        "those",
        "though",
        "three",
        "through",
        "throughout",
        "thru",
        "thus",
        "to",
        "together",
        "too",
        "took",
        "toward",
        "towards",
        "tried",
        "tries",
        "truly",
        "try",
        "trying",
        "twice",
        "two",
        "u",
        "un",
        "under",
        "unfortunately",
        "unless",
        "unlikely",
        "until",
        "unto",
        "up",
        "upon",
        "us",
        "use",
        "used",
        "useful",
        "uses",
        "using",
        "usually",
        "uucp",
        "v",
        "value",
        "various",
        "very",
        "via",
        "viz",
        "vs",
        "w",
        "want",
        "wants",
        "was",
        "wasn't",
        "way",
        "we",
        "we'd",
        "we'll",
        "we're",
        "we've",
        "welcome",
        "well",
        "went",
        "were",
        "weren't",
        "what",
        "what's",
        "whatever",
        "when",
        "whence",
        "whenever",
        "where",
        "where's",
        "whereafter",
        "whereas",
        "whereby",
        "wherein",
        "whereupon",
        "wherever",
        "whether",
        "which",
        "while",
        "whither",
        "who",
        "who's",
        "whoever",
        "whole",
        "whom",
        "whose",
        "why",
        "will",
        "willing",
        "wish",
        "with",
        "within",
        "without",
        "won't",
        "wonder",
        "would",
        "would",
        "wouldn't",
        "x",
        "y",
        "yes",
        "yet",
        "you",
        "you'd",
        "you'll",
        "you're",
        "you've",
        "your",
        "yours",
        "yourself",
        "yourselves",
        "z",
        "zero"
    ]
};
},{}],8:[function(require,module,exports){
//  via https://stop-words.googlecode.com/svn/trunk/stop-words/stop-words/stop-words-spanish.txt
module.exports = {
    stopwords: [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '_',
        'a',
        'actualmente',
        'acuerdo',
        'adelante',
        'ademas',
        'adem├ís',
        'adrede',
        'afirm├│',
        'agreg├│',
        'ahi',
        'ahora',
        'ah├¡',
        'al',
        'algo',
        'alguna',
        'algunas',
        'alguno',
        'algunos',
        'alg├║n',
        'alli',
        'all├¡',
        'alrededor',
        'ambos',
        'ampleamos',
        'antano',
        'anta├▒o',
        'ante',
        'anterior',
        'antes',
        'apenas',
        'aproximadamente',
        'aquel',
        'aquella',
        'aquellas',
        'aquello',
        'aquellos',
        'aqui',
        'aqu├⌐l',
        'aqu├⌐lla',
        'aqu├⌐llas',
        'aqu├⌐llos',
        'aqu├¡',
        'arriba',
        'arribaabajo',
        'asegur├│',
        'asi',
        'as├¡',
        'atras',
        'aun',
        'aunque',
        'ayer',
        'a├▒adi├│',
        'a├║n',
        'b',
        'bajo',
        'bastante',
        'bien',
        'breve',
        'buen',
        'buena',
        'buenas',
        'bueno',
        'buenos',
        'c',
        'cada',
        'casi',
        'cerca',
        'cierta',
        'ciertas',
        'cierto',
        'ciertos',
        'cinco',
        'claro',
        'coment├│',
        'como',
        'con',
        'conmigo',
        'conocer',
        'conseguimos',
        'conseguir',
        'considera',
        'consider├│',
        'consigo',
        'consigue',
        'consiguen',
        'consigues',
        'contigo',
        'contra',
        'cosas',
        'creo',
        'cual',
        'cuales',
        'cualquier',
        'cuando',
        'cuanta',
        'cuantas',
        'cuanto',
        'cuantos',
        'cuatro',
        'cuenta',
        'cu├íl',
        'cu├íles',
        'cu├índo',
        'cu├ínta',
        'cu├íntas',
        'cu├ínto',
        'cu├íntos',
        'c├│mo',
        'd',
        'da',
        'dado',
        'dan',
        'dar',
        'de',
        'debajo',
        'debe',
        'deben',
        'debido',
        'decir',
        'dej├│',
        'del',
        'delante',
        'demasiado',
        'dem├ís',
        'dentro',
        'deprisa',
        'desde',
        'despacio',
        'despues',
        'despu├⌐s',
        'detras',
        'detr├ís',
        'dia',
        'dias',
        'dice',
        'dicen',
        'dicho',
        'dieron',
        'diferente',
        'diferentes',
        'dijeron',
        'dijo',
        'dio',
        'donde',
        'dos',
        'durante',
        'd├¡a',
        'd├¡as',
        'd├│nde',
        'e',
        'ejemplo',
        'el',
        'ella',
        'ellas',
        'ello',
        'ellos',
        'embargo',
        'empleais',
        'emplean',
        'emplear',
        'empleas',
        'empleo',
        'en',
        'encima',
        'encuentra',
        'enfrente',
        'enseguida',
        'entonces',
        'entre',
        'era',
        'erais',
        'eramos',
        'eran',
        'eras',
        'eres',
        'es',
        'esa',
        'esas',
        'ese',
        'eso',
        'esos',
        'esta',
        'estaba',
        'estabais',
        'estaban',
        'estabas',
        'estad',
        'estada',
        'estadas',
        'estado',
        'estados',
        'estais',
        'estamos',
        'estan',
        'estando',
        'estar',
        'estaremos',
        'estar├í',
        'estar├ín',
        'estar├ís',
        'estar├⌐',
        'estar├⌐is',
        'estar├¡a',
        'estar├¡ais',
        'estar├¡amos',
        'estar├¡an',
        'estar├¡as',
        'estas',
        'este',
        'estemos',
        'esto',
        'estos',
        'estoy',
        'estuve',
        'estuviera',
        'estuvierais',
        'estuvieran',
        'estuvieras',
        'estuvieron',
        'estuviese',
        'estuvieseis',
        'estuviesen',
        'estuvieses',
        'estuvimos',
        'estuviste',
        'estuvisteis',
        'estuvi├⌐ramos',
        'estuvi├⌐semos',
        'estuvo',
        'est├í',
        'est├íbamos',
        'est├íis',
        'est├ín',
        'est├ís',
        'est├⌐',
        'est├⌐is',
        'est├⌐n',
        'est├⌐s',
        'ex',
        'excepto',
        'existe',
        'existen',
        'explic├│',
        'expres├│',
        'f',
        'fin',
        'final',
        'fue',
        'fuera',
        'fuerais',
        'fueran',
        'fueras',
        'fueron',
        'fuese',
        'fueseis',
        'fuesen',
        'fueses',
        'fui',
        'fuimos',
        'fuiste',
        'fuisteis',
        'fu├⌐ramos',
        'fu├⌐semos',
        'g',
        'general',
        'gran',
        'grandes',
        'gueno',
        'h',
        'ha',
        'haber',
        'habia',
        'habida',
        'habidas',
        'habido',
        'habidos',
        'habiendo',
        'habla',
        'hablan',
        'habremos',
        'habr├í',
        'habr├ín',
        'habr├ís',
        'habr├⌐',
        'habr├⌐is',
        'habr├¡a',
        'habr├¡ais',
        'habr├¡amos',
        'habr├¡an',
        'habr├¡as',
        'hab├⌐is',
        'hab├¡a',
        'hab├¡ais',
        'hab├¡amos',
        'hab├¡an',
        'hab├¡as',
        'hace',
        'haceis',
        'hacemos',
        'hacen',
        'hacer',
        'hacerlo',
        'haces',
        'hacia',
        'haciendo',
        'hago',
        'han',
        'has',
        'hasta',
        'hay',
        'haya',
        'hayamos',
        'hayan',
        'hayas',
        'hay├íis',
        'he',
        'hecho',
        'hemos',
        'hicieron',
        'hizo',
        'horas',
        'hoy',
        'hube',
        'hubiera',
        'hubierais',
        'hubieran',
        'hubieras',
        'hubieron',
        'hubiese',
        'hubieseis',
        'hubiesen',
        'hubieses',
        'hubimos',
        'hubiste',
        'hubisteis',
        'hubi├⌐ramos',
        'hubi├⌐semos',
        'hubo',
        'i',
        'igual',
        'incluso',
        'indic├│',
        'informo',
        'inform├│',
        'intenta',
        'intentais',
        'intentamos',
        'intentan',
        'intentar',
        'intentas',
        'intento',
        'ir',
        'j',
        'junto',
        'k',
        'l',
        'la',
        'lado',
        'largo',
        'las',
        'le',
        'lejos',
        'les',
        'lleg├│',
        'lleva',
        'llevar',
        'lo',
        'los',
        'luego',
        'lugar',
        'm',
        'mal',
        'manera',
        'manifest├│',
        'mas',
        'mayor',
        'me',
        'mediante',
        'medio',
        'mejor',
        'mencion├│',
        'menos',
        'menudo',
        'mi',
        'mia',
        'mias',
        'mientras',
        'mio',
        'mios',
        'mis',
        'misma',
        'mismas',
        'mismo',
        'mismos',
        'modo',
        'momento',
        'mucha',
        'muchas',
        'mucho',
        'muchos',
        'muy',
        'm├ís',
        'm├¡',
        'm├¡a',
        'm├¡as',
        'm├¡o',
        'm├¡os',
        'n',
        'nada',
        'nadie',
        'ni',
        'ninguna',
        'ningunas',
        'ninguno',
        'ningunos',
        'ning├║n',
        'no',
        'nos',
        'nosotras',
        'nosotros',
        'nuestra',
        'nuestras',
        'nuestro',
        'nuestros',
        'nueva',
        'nuevas',
        'nuevo',
        'nuevos',
        'nunca',
        'o',
        'ocho',
        'os',
        'otra',
        'otras',
        'otro',
        'otros',
        'p',
        'pais',
        'para',
        'parece',
        'parte',
        'partir',
        'pasada',
        'pasado',
        'pa├¼s',
        'peor',
        'pero',
        'pesar',
        'poca',
        'pocas',
        'poco',
        'pocos',
        'podeis',
        'podemos',
        'poder',
        'podria',
        'podriais',
        'podriamos',
        'podrian',
        'podrias',
        'podr├í',
        'podr├ín',
        'podr├¡a',
        'podr├¡an',
        'poner',
        'por',
        'por qu├⌐',
        'porque',
        'posible',
        'primer',
        'primera',
        'primero',
        'primeros',
        'principalmente',
        'pronto',
        'propia',
        'propias',
        'propio',
        'propios',
        'proximo',
        'pr├│ximo',
        'pr├│ximos',
        'pudo',
        'pueda',
        'puede',
        'pueden',
        'puedo',
        'pues',
        'q',
        'qeu',
        'que',
        'qued├│',
        'queremos',
        'quien',
        'quienes',
        'quiere',
        'quiza',
        'quizas',
        'quiz├í',
        'quiz├ís',
        'qui├⌐n',
        'qui├⌐nes',
        'qu├⌐',
        'r',
        'raras',
        'realizado',
        'realizar',
        'realiz├│',
        'repente',
        'respecto',
        's',
        'sabe',
        'sabeis',
        'sabemos',
        'saben',
        'saber',
        'sabes',
        'sal',
        'salvo',
        'se',
        'sea',
        'seamos',
        'sean',
        'seas',
        'segun',
        'segunda',
        'segundo',
        'seg├║n',
        'seis',
        'ser',
        'sera',
        'seremos',
        'ser├í',
        'ser├ín',
        'ser├ís',
        'ser├⌐',
        'ser├⌐is',
        'ser├¡a',
        'ser├¡ais',
        'ser├¡amos',
        'ser├¡an',
        'ser├¡as',
        'se├íis',
        'se├▒al├│',
        'si',
        'sido',
        'siempre',
        'siendo',
        'siete',
        'sigue',
        'siguiente',
        'sin',
        'sino',
        'sobre',
        'sois',
        'sola',
        'solamente',
        'solas',
        'solo',
        'solos',
        'somos',
        'son',
        'soy',
        'soyos',
        'su',
        'supuesto',
        'sus',
        'suya',
        'suyas',
        'suyo',
        'suyos',
        's├⌐',
        's├¡',
        's├│lo',
        't',
        'tal',
        'tambien',
        'tambi├⌐n',
        'tampoco',
        'tan',
        'tanto',
        'tarde',
        'te',
        'temprano',
        'tendremos',
        'tendr├í',
        'tendr├ín',
        'tendr├ís',
        'tendr├⌐',
        'tendr├⌐is',
        'tendr├¡a',
        'tendr├¡ais',
        'tendr├¡amos',
        'tendr├¡an',
        'tendr├¡as',
        'tened',
        'teneis',
        'tenemos',
        'tener',
        'tenga',
        'tengamos',
        'tengan',
        'tengas',
        'tengo',
        'teng├íis',
        'tenida',
        'tenidas',
        'tenido',
        'tenidos',
        'teniendo',
        'ten├⌐is',
        'ten├¡a',
        'ten├¡ais',
        'ten├¡amos',
        'ten├¡an',
        'ten├¡as',
        'tercera',
        'ti',
        'tiempo',
        'tiene',
        'tienen',
        'tienes',
        'toda',
        'todas',
        'todavia',
        'todav├¡a',
        'todo',
        'todos',
        'total',
        'trabaja',
        'trabajais',
        'trabajamos',
        'trabajan',
        'trabajar',
        'trabajas',
        'trabajo',
        'tras',
        'trata',
        'trav├⌐s',
        'tres',
        'tu',
        'tus',
        'tuve',
        'tuviera',
        'tuvierais',
        'tuvieran',
        'tuvieras',
        'tuvieron',
        'tuviese',
        'tuvieseis',
        'tuviesen',
        'tuvieses',
        'tuvimos',
        'tuviste',
        'tuvisteis',
        'tuvi├⌐ramos',
        'tuvi├⌐semos',
        'tuvo',
        'tuya',
        'tuyas',
        'tuyo',
        'tuyos',
        't├║',
        'u',
        'ultimo',
        'un',
        'una',
        'unas',
        'uno',
        'unos',
        'usa',
        'usais',
        'usamos',
        'usan',
        'usar',
        'usas',
        'uso',
        'usted',
        'ustedes',
        'v',
        'va',
        'vais',
        'valor',
        'vamos',
        'van',
        'varias',
        'varios',
        'vaya',
        'veces',
        'ver',
        'verdad',
        'verdadera',
        'verdadero',
        'vez',
        'vosotras',
        'vosotros',
        'voy',
        'vuestra',
        'vuestras',
        'vuestro',
        'vuestros',
        'w',
        'x',
        'y',
        'ya',
        'yo',
        'z',
        '├⌐l',
        '├⌐ramos',
        '├⌐sa',
        '├⌐sas',
        '├⌐se',
        '├⌐sos',
        '├⌐sta',
        '├⌐stas',
        '├⌐ste',
        '├⌐stos',
        '├║ltima',
        '├║ltimas',
        '├║ltimo',
        '├║ltimos'
    ]

};

},{}],9:[function(require,module,exports){
/**
 * Created by jan on 9-3-15.
 */
// French stopwords
// via https://code.google.com/p/stop-words/

module.exports = {
    stopwords: [
        "a",
        "├á",
        "├ó",
        "abord",
        "afin",
        "ah",
        "ai",
        "aie",
        "ainsi",
        "allaient",
        "allo",
        "all├┤",
        "allons",
        "apr├¿s",
        "assez",
        "attendu",
        "au",
        "aucun",
        "aucune",
        "aujourd",
        "aujourd'hui",
        "auquel",
        "aura",
        "auront",
        "aussi",
        "autre",
        "autres",
        "aux",
        "auxquelles",
        "auxquels",
        "avaient",
        "avais",
        "avait",
        "avant",
        "avec",
        "avoir",
        "ayant",
        "b",
        "bah",
        "beaucoup",
        "bien",
        "bigre",
        "boum",
        "bravo",
        "brrr",
        "c",
        "├ºa",
        "car",
        "ce",
        "ceci",
        "cela",
        "celle",
        "celle-ci",
        "celle-l├á",
        "celles",
        "celles-ci",
        "celles-l├á",
        "celui",
        "celui-ci",
        "celui-l├á",
        "cent",
        "cependant",
        "certain",
        "certaine",
        "certaines",
        "certains",
        "certes",
        "ces",
        "cet",
        "cette",
        "ceux",
        "ceux-ci",
        "ceux-l├á",
        "chacun",
        "chaque",
        "cher",
        "ch├¿re",
        "ch├¿res",
        "chers",
        "chez",
        "chiche",
        "chut",
        "ci",
        "cinq",
        "cinquantaine",
        "cinquante",
        "cinquanti├¿me",
        "cinqui├¿me",
        "clac",
        "clic",
        "combien",
        "comme",
        "comment",
        "compris",
        "concernant",
        "contre",
        "couic",
        "crac",
        "d",
        "da",
        "dans",
        "de",
        "debout",
        "dedans",
        "dehors",
        "del├á",
        "depuis",
        "derri├¿re",
        "des",
        "d├¿s",
        "d├⌐sormais",
        "desquelles",
        "desquels",
        "dessous",
        "dessus",
        "deux",
        "deuxi├¿me",
        "deuxi├¿mement",
        "devant",
        "devers",
        "devra",
        "diff├⌐rent",
        "diff├⌐rente",
        "diff├⌐rentes",
        "diff├⌐rents",
        "dire",
        "divers",
        "diverse",
        "diverses",
        "dix",
        "dix-huit",
        "dixi├¿me",
        "dix-neuf",
        "dix-sept",
        "doit",
        "doivent",
        "donc",
        "dont",
        "douze",
        "douzi├¿me",
        "dring",
        "du",
        "duquel",
        "durant",
        "e",
        "effet",
        "eh",
        "elle",
        "elle-m├¬me",
        "elles",
        "elles-m├¬mes",
        "en",
        "encore",
        "entre",
        "envers",
        "environ",
        "es",
        "├¿s",
        "est",
        "et",
        "etant",
        "├⌐taient",
        "├⌐tais",
        "├⌐tait",
        "├⌐tant",
        "etc",
        "├⌐t├⌐",
        "etre",
        "├¬tre",
        "eu",
        "euh",
        "eux",
        "eux-m├¬mes",
        "except├⌐",
        "f",
        "fa├ºon",
        "fais",
        "faisaient",
        "faisant",
        "fait",
        "feront",
        "fi",
        "flac",
        "floc",
        "font",
        "g",
        "gens",
        "h",
        "ha",
        "h├⌐",
        "hein",
        "h├⌐las",
        "hem",
        "hep",
        "hi",
        "ho",
        "hol├á",
        "hop",
        "hormis",
        "hors",
        "hou",
        "houp",
        "hue",
        "hui",
        "huit",
        "huiti├¿me",
        "hum",
        "hurrah",
        "i",
        "il",
        "ils",
        "importe",
        "j",
        "je",
        "jusqu",
        "jusque",
        "k",
        "l",
        "la",
        "l├á",
        "laquelle",
        "las",
        "le",
        "lequel",
        "les",
        "l├¿s",
        "lesquelles",
        "lesquels",
        "leur",
        "leurs",
        "longtemps",
        "lorsque",
        "lui",
        "lui-m├¬me",
        "m",
        "ma",
        "maint",
        "mais",
        "malgr├⌐",
        "me",
        "m├¬me",
        "m├¬mes",
        "merci",
        "mes",
        "mien",
        "mienne",
        "miennes",
        "miens",
        "mille",
        "mince",
        "moi",
        "moi-m├¬me",
        "moins",
        "mon",
        "moyennant",
        "n",
        "na",
        "ne",
        "n├⌐anmoins",
        "neuf",
        "neuvi├¿me",
        "ni",
        "nombreuses",
        "nombreux",
        "non",
        "nos",
        "notre",
        "n├┤tre",
        "n├┤tres",
        "nous",
        "nous-m├¬mes",
        "nul",
        "o",
        "o|",
        "├┤",
        "oh",
        "oh├⌐",
        "ol├⌐",
        "oll├⌐",
        "on",
        "ont",
        "onze",
        "onzi├¿me",
        "ore",
        "ou",
        "o├╣",
        "ouf",
        "ouias",
        "oust",
        "ouste",
        "outre",
        "p",
        "paf",
        "pan",
        "par",
        "parmi",
        "partant",
        "particulier",
        "particuli├¿re",
        "particuli├¿rement",
        "pas",
        "pass├⌐",
        "pendant",
        "personne",
        "peu",
        "peut",
        "peuvent",
        "peux",
        "pff",
        "pfft",
        "pfut",
        "pif",
        "plein",
        "plouf",
        "plus",
        "plusieurs",
        "plut├┤t",
        "pouah",
        "pour",
        "pourquoi",
        "premier",
        "premi├¿re",
        "premi├¿rement",
        "pr├¿s",
        "proche",
        "psitt",
        "puisque",
        "q",
        "qu",
        "quand",
        "quant",
        "quanta",
        "quant-├á-soi",
        "quarante",
        "quatorze",
        "quatre",
        "quatre-vingt",
        "quatri├¿me",
        "quatri├¿mement",
        "que",
        "quel",
        "quelconque",
        "quelle",
        "quelles",
        "quelque",
        "quelques",
        "quelqu'un",
        "quels",
        "qui",
        "quiconque",
        "quinze",
        "quoi",
        "quoique",
        "r",
        "revoici",
        "revoil├á",
        "rien",
        "s",
        "sa",
        "sacrebleu",
        "sans",
        "sapristi",
        "sauf",
        "se",
        "seize",
        "selon",
        "sept",
        "septi├¿me",
        "sera",
        "seront",
        "ses",
        "si",
        "sien",
        "sienne",
        "siennes",
        "siens",
        "sinon",
        "six",
        "sixi├¿me",
        "soi",
        "soi-m├¬me",
        "soit",
        "soixante",
        "son",
        "sont",
        "sous",
        "stop",
        "suis",
        "suivant",
        "sur",
        "surtout",
        "t",
        "ta",
        "tac",
        "tant",
        "te",
        "t├⌐",
        "tel",
        "telle",
        "tellement",
        "telles",
        "tels",
        "tenant",
        "tes",
        "tic",
        "tien",
        "tienne",
        "tiennes",
        "tiens",
        "toc",
        "toi",
        "toi-m├¬me",
        "ton",
        "touchant",
        "toujours",
        "tous",
        "tout",
        "toute",
        "toutes",
        "treize",
        "trente",
        "tr├¿s",
        "trois",
        "troisi├¿me",
        "troisi├¿mement",
        "trop",
        "tsoin",
        "tsouin",
        "tu",
        "u",
        "un",
        "une",
        "unes",
        "uns",
        "v",
        "va",
        "vais",
        "vas",
        "v├⌐",
        "vers",
        "via",
        "vif",
        "vifs",
        "vingt",
        "vivat",
        "vive",
        "vives",
        "vlan",
        "voici",
        "voil├á",
        "vont",
        "vos",
        "votre",
        "v├┤tre",
        "v├┤tres",
        "vous",
        "vous-m├¬mes",
        "vu",
        "w",
        "x",
        "y",
        "z",
        "zut",
        "∩╗┐alors",
        "aucuns",
        "bon",
        "devrait",
        "dos",
        "droite",
        "d├⌐but",
        "essai",
        "faites",
        "fois",
        "force",
        "haut",
        "ici",
        "juste",
        "maintenant",
        "mine",
        "mot",
        "nomm├⌐s",
        "nouveaux",
        "parce",
        "parole",
        "personnes",
        "pi├¿ce",
        "plupart",
        "seulement",
        "soyez",
        "sujet",
        "tandis",
        "valeur",
        "voie",
        "voient",
        "├⌐tat",
        "├⌐tions"

    ]

};

},{}],10:[function(require,module,exports){
//  via http://www.ranks.nl/stopwords/galician
module.exports = {
    stopwords: [
        'a',
        'a├¡nda',
        'al├¡',
        'aquel',
        'aquela',
        'aquelas',
        'aqueles',
        'aquilo',
        'aqu├¡',
        'ao',
        'aos',
        'as',
        'as├¡',
        '├í',
        'ben',
        'cando',
        'che',
        'co',
        'coa',
        'comigo',
        'con',
        'connosco',
        'contigo',
        'convosco',
        'coas',
        'cos',
        'cun',
        'cuns',
        'cunha',
        'cunhas',
        'da',
        'dalgunha',
        'dalgunhas',
        'dalg├║n',
        'dalg├║ns',
        'das',
        'de',
        'del',
        'dela',
        'delas',
        'deles',
        'desde',
        'deste',
        'do',
        'dos',
        'dun',
        'duns',
        'dunha',
        'dunhas',
        'e',
        'el',
        'ela',
        'elas',
        'eles',
        'en',
        'era',
        'eran',
        'esa',
        'esas',
        'ese',
        'eses',
        'esta',
        'estar',
        'estaba',
        'est├í',
        'est├ín',
        'este',
        'estes',
        'estiven',
        'estou',
        'eu',
        '├⌐',
        'facer',
        'foi',
        'foron',
        'fun',
        'hab├¡a',
        'hai',
        'iso',
        'isto',
        'la',
        'las',
        'lle',
        'lles',
        'lo',
        'los',
        'mais',
        'me',
        'meu',
        'meus',
        'min',
        'mi├▒a',
        'mi├▒as',
        'moi',
        'na',
        'nas',
        'neste',
        'nin',
        'no',
        'non',
        'nos',
        'nosa',
        'nosas',
        'noso',
        'nosos',
        'n├│s',
        'nun',
        'nunha',
        'nuns',
        'nunhas',
        'o',
        'os',
        'ou',
        '├│',
        '├│s',
        'para',
        'pero',
        'pode',
        'pois',
        'pola',
        'polas',
        'polo',
        'polos',
        'por',
        'que',
        'se',
        'sen├│n',
        'ser',
        'seu',
        'seus',
        'sexa',
        'sido',
        'sobre',
        's├║a',
        's├║as',
        'tam├⌐n',
        'tan',
        'te',
        'ten',
        'te├▒en',
        'te├▒o',
        'ter',
        'teu',
        'teus',
        'ti',
        'tido',
        'ti├▒a',
        'tiven',
        't├║a',
        't├║as',
        'un',
        'unha',
        'unhas',
        'uns',
        'vos',
        'vosa',
        'vosas',
        'voso',
        'vosos',
        'v├│s'
    ]
};

},{}],11:[function(require,module,exports){
/**
 * Created by jan on 9-3-15.
 */
// Italian stopwords
// via https://code.google.com/p/stop-words/

module.exports = {
    stopwords: [
        "a",
        "adesso",
        "ai",
        "al",
        "alla",
        "allo",
        "allora",
        "altre",
        "altri",
        "altro",
        "anche",
        "ancora",
        "avere",
        "aveva",
        "avevano",
        "ben",
        "buono",
        "che",
        "chi",
        "cinque",
        "comprare",
        "con",
        "consecutivi",
        "consecutivo",
        "cosa",
        "cui",
        "da",
        "del",
        "della",
        "dello",
        "dentro",
        "deve",
        "devo",
        "di",
        "doppio",
        "due",
        "e",
        "ecco",
        "fare",
        "fine",
        "fino",
        "fra",
        "gente",
        "giu",
        "ha",
        "hai",
        "hanno",
        "ho",
        "il",
        "indietro",
        "invece",
        "io",
        "la",
        "lavoro",
        "le",
        "lei",
        "lo",
        "loro",
        "lui",
        "lungo",
        "ma",
        "me",
        "meglio",
        "molta",
        "molti",
        "molto",
        "nei",
        "nella",
        "no",
        "noi",
        "nome",
        "nostro",
        "nove",
        "nuovi",
        "nuovo",
        "o",
        "oltre",
        "ora",
        "otto",
        "peggio",
        "pero",
        "persone",
        "piu",
        "poco",
        "primo",
        "promesso",
        "qua",
        "quarto",
        "quasi",
        "quattro",
        "quello",
        "questo",
        "qui",
        "quindi",
        "quinto",
        "rispetto",
        "sara",
        "secondo",
        "sei",
        "sembra",
        "sembrava",
        "senza",
        "sette",
        "sia",
        "siamo",
        "siete",
        "solo",
        "sono",
        "sopra",
        "soprattutto",
        "sotto",
        "stati",
        "stato",
        "stesso",
        "su",
        "subito",
        "sul",
        "sulla",
        "tanto",
        "te",
        "tempo",
        "terzo",
        "tra",
        "tre",
        "triplo",
        "ultimo",
        "un",
        "una",
        "uno",
        "va",
        "vai",
        "voi",
        "volte",
        "vostro",
        "a",
        "abbastanza",
        "accidenti",
        "ad",
        "affinche",
        "agli",
        "ahime",
        "ahim├â",
        "alcuna",
        "alcuni",
        "alcuno",
        "all",
        "alle",
        "altrimenti",
        "altrui",
        "anni",
        "anno",
        "ansa",
        "assai",
        "attesa",
        "avanti",
        "avendo",
        "avente",
        "aver",
        "avete",
        "avuta",
        "avute",
        "avuti",
        "avuto",
        "basta",
        "bene",
        "benissimo",
        "berlusconi",
        "brava",
        "bravo",
        "c",
        "casa",
        "caso",
        "cento",
        "certa",
        "certe",
        "certi",
        "certo",
        "chicchessia",
        "chiunque",
        "ci",
        "ciascuna",
        "ciascuno",
        "cima",
        "cio",
        "ci├â",
        "cioe",
        "cio├â",
        "circa",
        "citta",
        "citt├â",
        "codesta",
        "codesti",
        "codesto",
        "cogli",
        "coi",
        "col",
        "colei",
        "coll",
        "coloro",
        "colui",
        "come",
        "concernente",
        "consiglio",
        "contro",
        "cortesia",
        "cos",
        "cosi",
        "cos├â",
        "d",
        "dagli",
        "dai",
        "dal",
        "dall",
        "dalla",
        "dalle",
        "dallo",
        "davanti",
        "degli",
        "dei",
        "dell",
        "delle",
        "detto",
        "dice",
        "dietro",
        "dire",
        "dirimpetto",
        "dopo",
        "dove",
        "dovra",
        "dovr├â",
        "dunque",
        "durante",
        "├â",
        "ed",
        "egli",
        "ella",
        "eppure",
        "era",
        "erano",
        "esse",
        "essendo",
        "esser",
        "essere",
        "essi",
        "ex",
        "fa",
        "fatto",
        "favore",
        "fin",
        "finalmente",
        "finche",
        "forse",
        "fuori",
        "gia",
        "gi├â",
        "giacche",
        "giorni",
        "giorno",
        "gli",
        "gliela",
        "gliele",
        "glieli",
        "glielo",
        "gliene",
        "governo",
        "grande",
        "grazie",
        "gruppo",
        "i",
        "ieri",
        "improvviso",
        "in",
        "infatti",
        "insieme",
        "intanto",
        "intorno",
        "l",
        "l├â",
        "li",
        "lontano",
        "macche",
        "magari",
        "mai",
        "male",
        "malgrado",
        "malissimo",
        "medesimo",
        "mediante",
        "meno",
        "mentre",
        "mesi",
        "mezzo",
        "mi",
        "mia",
        "mie",
        "miei",
        "mila",
        "miliardi",
        "milioni",
        "ministro",
        "mio",
        "moltissimo",
        "mondo",
        "nazionale",
        "ne",
        "negli",
        "nel",
        "nell",
        "nelle",
        "nello",
        "nemmeno",
        "neppure",
        "nessuna",
        "nessuno",
        "niente",
        "non",
        "nondimeno",
        "nostra",
        "nostre",
        "nostri",
        "nulla",
        "od",
        "oggi",
        "ogni",
        "ognuna",
        "ognuno",
        "oppure",
        "ore",
        "osi",
        "ossia",
        "paese",
        "parecchi",
        "parecchie",
        "parecchio",
        "parte",
        "partendo",
        "peccato",
        "per",
        "perche",
        "perch├â",
        "percio",
        "perci├â",
        "perfino",
        "per├â",
        "piedi",
        "pieno",
        "piglia",
        "pi├â",
        "po",
        "pochissimo",
        "poi",
        "poiche",
        "press",
        "prima",
        "proprio",
        "puo",
        "pu├â",
        "pure",
        "purtroppo",
        "qualche",
        "qualcuna",
        "qualcuno",
        "quale",
        "quali",
        "qualunque",
        "quando",
        "quanta",
        "quante",
        "quanti",
        "quanto",
        "quantunque",
        "quel",
        "quella",
        "quelli",
        "quest",
        "questa",
        "queste",
        "questi",
        "riecco",
        "salvo",
        "sar├â",
        "sarebbe",
        "scopo",
        "scorso",
        "se",
        "seguente",
        "sempre",
        "si",
        "solito",
        "sta",
        "staranno",
        "stata",
        "state",
        "sua",
        "successivo",
        "sue",
        "sugli",
        "sui",
        "sull",
        "sulle",
        "sullo",
        "suo",
        "suoi",
        "tale",
        "talvolta",
        "ti",
        "torino",
        "tranne",
        "troppo",
        "tu",
        "tua",
        "tue",
        "tuo",
        "tuoi",
        "tutta",
        "tuttavia",
        "tutte",
        "tutti",
        "tutto",
        "uguali",
        "uomo",
        "vale",
        "varia",
        "varie",
        "vario",
        "verso",
        "vi",
        "via",
        "vicino",
        "visto",
        "vita",
        "volta",
        "vostra",
        "vostre",
        "vostri"
    ]
};

},{}],12:[function(require,module,exports){
/**
 * Created by jan on 9-3-15.
 */
// Dutch stopwords
// via https://code.google.com/p/stop-words/



module.exports = {
    stopwords:[
        "aan",
        "af",
        "al",
        "als",
        "bij",
        "dan",
        "dat",
        "die",
        "dit",
        "een",
        "en",
        "er",
        "had",
        "heb",
        "hem",
        "het",
        "hij",
        "hoe",
        "hun",
        "ik",
        "in",
        "is",
        "je",
        "kan",
        "me",
        "men",
        "met",
        "mij",
        "nog",
        "nu",
        "of",
        "ons",
        "ook",
        "te",
        "tot",
        "uit",
        "van",
        "was",
        "wat",
        "we",
        "wel",
        "wij",
        "zal",
        "ze",
        "zei",
        "zij",
        "zo",
        "zou",
        "aan",
        "aangaande",
        "aangezien",
        "achter",
        "achterna",
        "afgelopen",
        "al",
        "aldaar",
        "aldus",
        "alhoewel",
        "alias",
        "alle",
        "allebei",
        "alleen",
        "alsnog",
        "altijd",
        "altoos",
        "ander",
        "andere",
        "anders",
        "anderszins",
        "behalve",
        "behoudens",
        "beide",
        "beiden",
        "ben",
        "beneden",
        "bent",
        "bepaald",
        "betreffende",
        "bij",
        "binnen",
        "binnenin",
        "boven",
        "bovenal",
        "bovendien",
        "bovengenoemd",
        "bovenstaand",
        "bovenvermeld",
        "buiten",
        "daar",
        "daarheen",
        "daarin",
        "daarna",
        "daarnet",
        "daarom",
        "daarop",
        "daarvanlangs",
        "dan",
        "dat",
        "de",
        "die",
        "dikwijls",
        "dit",
        "door",
        "doorgaand",
        "dus",
        "echter",
        "eer",
        "eerdat",
        "eerder",
        "eerlang",
        "eerst",
        "elk",
        "elke",
        "en",
        "enig",
        "enigszins",
        "enkel",
        "er",
        "erdoor",
        "even",
        "eveneens",
        "evenwel",
        "gauw",
        "gedurende",
        "geen",
        "gehad",
        "gekund",
        "geleden",
        "gelijk",
        "gemoeten",
        "gemogen",
        "geweest",
        "gewoon",
        "gewoonweg",
        "haar",
        "had",
        "hadden",
        "hare",
        "heb",
        "hebben",
        "hebt",
        "heeft",
        "hem",
        "hen",
        "het",
        "hierbeneden",
        "hierboven",
        "hij",
        "hoe",
        "hoewel",
        "hun",
        "hunne",
        "ik",
        "ikzelf",
        "in",
        "inmiddels",
        "inzake",
        "is",
        "jezelf",
        "jij",
        "jijzelf",
        "jou",
        "jouw",
        "jouwe",
        "juist",
        "jullie",
        "kan",
        "klaar",
        "kon",
        "konden",
        "krachtens",
        "kunnen",
        "kunt",
        "later",
        "liever",
        "maar",
        "mag",
        "meer",
        "met",
        "mezelf",
        "mij",
        "mijn",
        "mijnent",
        "mijner",
        "mijzelf",
        "misschien",
        "mocht",
        "mochten",
        "moest",
        "moesten",
        "moet",
        "moeten",
        "mogen",
        "na",
        "naar",
        "nadat",
        "net",
        "niet",
        "noch",
        "nog",
        "nogal",
        "nu",
        "of",
        "ofschoon",
        "om",
        "omdat",
        "omhoog",
        "omlaag",
        "omstreeks",
        "omtrent",
        "omver",
        "onder",
        "ondertussen",
        "ongeveer",
        "ons",
        "onszelf",
        "onze",
        "ook",
        "op",
        "opnieuw",
        "opzij",
        "over",
        "overeind",
        "overigens",
        "pas",
        "precies",
        "reeds",
        "rond",
        "rondom",
        "sedert",
        "sinds",
        "sindsdien",
        "slechts",
        "sommige",
        "spoedig",
        "steeds",
        "tamelijk",
        "tenzij",
        "terwijl",
        "thans",
        "tijdens",
        "toch",
        "toen",
        "toenmaals",
        "toenmalig",
        "tot",
        "totdat",
        "tussen",
        "uit",
        "uitgezonderd",
        "vaakwat",
        "van",
        "vandaan",
        "vanuit",
        "vanwege",
        "veeleer",
        "verder",
        "vervolgens",
        "vol",
        "volgens",
        "voor",
        "vooraf",
        "vooral",
        "vooralsnog",
        "voorbij",
        "voordat",
        "voordezen",
        "voordien",
        "voorheen",
        "voorop",
        "vooruit",
        "vrij",
        "vroeg",
        "waar",
        "waarom",
        "wanneer",
        "want",
        "waren",
        "was",
        "weer",
        "weg",
        "wegens",
        "wel",
        "weldra",
        "welk",
        "welke",
        "wie",
        "wiens",
        "wier",
        "wij",
        "wijzelf",
        "zal",
        "ze",
        "zelfs",
        "zichzelf",
        "zij",
        "zijn",
        "zijne",
        "zo",
        "zodra",
        "zonder",
        "zou",
        "zouden",
        "zowat",
        "zulke",
        "zullen",
        "zult"
    ]
};


},{}],13:[function(require,module,exports){
// via http://hackage.haskell.org/package/glider-nlp-0.1/docs/src/Glider-NLP-Language-Polish-StopWords.html
module.exports = {
    stopwords:[
        "a",
"aby",
"ach",
"acz",
"aczkolwiek",
"aj",
"albo",
"ale",
"alez",
"ale┼╝",
"ani",
"az",
"a┼╝",
"bardziej",
"bardzo",
"bo",
"bowiem",
"by",
"byli",
"bynajmniej",
"byc",
"by─ç",
"byl",
"by┼é",
"byla",
"bylo",
"byly",
"by┼éa",
"by┼éo",
"by┼éy",
"bedzie",
"b─Ödzie",
"beda",
"b─Öd─à",
"cali",
"cala",
"ca┼éa",
"caly",
"ca┼éy",
"ci",
"cie",
"ci─Ö",
"ciebie",
"co",
"cokolwiek",
"cos",
"co┼¢",
"czasami",
"czasem",
"czemu",
"czy",
"czyli",
"daleko",
"dla",
"dlaczego",
"dlatego",
"do",
"dobrze",
"dokad",
"dok─àd",
"dosc",
"do┼¢─ç",
"duzo",
"du┼╝o",
"dwa",
"dwaj",
"dwie",
"dwoje",
"dzis",
"dzi┼¢",
"dzisiaj",
"gdy",
"gdyby",
"gdyz",
"gdy┼╝",
"gdzie",
"gdziekolwiek",
"gdzies",
"gdzie┼¢",
"go",
"i",
"ich",
"ile",
"im",
"inna",
"inne",
"inny",
"innych",
"iz",
"i┼╝",
"ja",
"j─à",
"jak",
"jakas",
"jaka┼¢",
"jakby",
"jaki",
"jakichs",
"jakich┼¢",
"jakie",
"jakis",
"jaki┼¢",
"jakiz",
"jaki┼╝",
"jakkolwiek",
"jako",
"jakos",
"jako┼¢",
"je",
"jeden",
"jedna",
"jedno",
"jednak",
"jednakze",
"jednak┼╝e",
"jego",
"jej",
"jemu",
"jest",
"jestem",
"jeszcze",
"jesli",
"je┼¢li",
"jezeli",
"je┼╝eli",
"juz",
"ju┼╝",
"kazdy",
"ka┼╝dy",
"kiedy",
"kilka",
"kims",
"kim┼¢",
"kto",
"ktokolwiek",
"ktos",
"kto┼¢",
"ktora",
"ktore",
"kt├│re",
"ktorego",
"ktorej",
"ktory",
"ktorych",
"ktorym",
"ktorzy",
"kt├│ra",
"kt├│rego",
"kt├│rej",
"kt├│ry",
"kt├│rych",
"kt├│rym",
"kt├│rzy",
"ku",
"lat",
"lecz",
"lub",
"ma",
"maj─à",
"ma┼éo",
"mam",
"mi",
"mimo",
"miedzy",
"mi─Ödzy",
"mna",
"mn─à",
"mnie",
"moga",
"mog─à",
"moi",
"moim",
"moja",
"moje",
"moze",
"mo┼╝e",
"mozliwe",
"mozna",
"mo┼╝liwe",
"mo┼╝na",
"moj",
"m├│j",
"mu",
"musi",
"my",
"na",
"nad",
"nam",
"nami",
"nas",
"nasi",
"nasz",
"nasza",
"nasze",
"naszego",
"naszych",
"natomiast",
"natychmiast",
"nawet",
"nia",
"ni─à",
"nic",
"nich",
"nie",
"niech",
"niego",
"niej",
"niemu",
"nigdy",
"nim",
"nimi",
"niz",
"ni┼╝",
"no",
"o",
"obok",
"od",
"oko┼éo",
"on",
"ona",
"one",
"oni",
"ono",
"oraz",
"oto",
"owszem",
"pan",
"pana",
"pani",
"po",
"pod",
"podczas",
"pomimo",
"ponad",
"poniewaz",
"poniewa┼╝",
"powinien",
"powinna",
"powinni",
"powinno",
"poza",
"prawie",
"przeciez",
"przecie┼╝",
"przed",
"przede",
"przedtem",
"przez",
"przy",
"roku",
"rowniez",
"r├│wnie┼╝",
"sam",
"sama",
"s─à",
"sie",
"si─Ö",
"skad",
"sk─àd",
"sobie",
"soba",
"sob─à",
"sposob",
"spos├│b",
"swoje",
"ta",
"tak",
"taka",
"taki",
"takie",
"takze",
"tak┼╝e",
"tam",
"te",
"tego",
"tej",
"ten",
"teraz",
"te┼╝",
"to",
"toba",
"tob─à",
"tobie",
"totez",
"tote┼╝",
"trzeba",
"tu",
"tutaj",
"twoi",
"twoim",
"twoja",
"twoje",
"twym",
"twoj",
"tw├│j",
"ty",
"tych",
"tylko",
"tym",
"u",
"w",
"wam",
"wami",
"was",
"wasz",
"wasza",
"wasze",
"we",
"wed┼éug",
"wiele",
"wielu",
"wi─Öc",
"wi─Öcej",
"wszyscy",
"wszystkich",
"wszystkie",
"wszystkim",
"wszystko",
"wtedy",
"wy",
"wlasnie",
"w┼éa┼¢nie",
"z",
"za",
"zapewne",
"zawsze",
"ze",
"znowu",
"znow",
"zn├│w",
"zostal",
"zosta┼é",
"zaden",
"zadna",
"zadne",
"zadnych",
"ze",
"zeby",
"┼╝aden",
"┼╝adna",
"┼╝adne",
"┼╝adnych",
"┼╝e",
"┼╝eby"
    ]
};

},{}],14:[function(require,module,exports){
/**
 * Created by rodrigo on 01/10/15.
 */

//Portuguese (BRAZIL) stopwords
// via https://sites.google.com/site/kevinbouge/stopwords-lists
module.exports = {
    stopwords: [
        "a",
        "├á",
        "adeus",
        "agora",
        "a├¡",
        "ainda",
        "al├⌐m",
        "algo",
        "algumas",
        "alguns",
        "ali",
        "ano",
        "anos",
        "antes",
        "ao",
        "aos",
        "apenas",
        "apoio",
        "ap├│s",
        "aquela",
        "aquelas",
        "aquele",
        "aqueles",
        "aqui",
        "aquilo",
        "├írea",
        "as",
        "├ás",
        "assim",
        "at├⌐",
        "atr├ís",
        "atrav├⌐s",
        "baixo",
        "bastante",
        "bem",
        "boa",
        "boas",
        "bom",
        "bons",
        "breve",
        "c├í",
        "cada",
        "catorze",
        "cedo",
        "cento",
        "certamente",
        "certeza",
        "cima",
        "cinco",
        "coisa",
        "com",
        "como",
        "conselho",
        "contra",
        "custa",
        "da",
        "d├í",
        "d├úo",
        "daquela",
        "daquelas",
        "daquele",
        "daqueles",
        "dar",
        "das",
        "de",
        "debaixo",
        "demais",
        "dentro",
        "depois",
        "desde",
        "dessa",
        "dessas",
        "desse",
        "desses",
        "desta",
        "destas",
        "deste",
        "destes",
        "deve",
        "dever├í",
        "dez",
        "dezanove",
        "dezasseis",
        "dezassete",
        "dezoito",
        "dia",
        "diante",
        "diz",
        "dizem",
        "dizer",
        "do",
        "dois",
        "dos",
        "doze",
        "duas",
        "d├║vida",
        "e",
        "├⌐",
        "ela",
        "elas",
        "ele",
        "eles",
        "em",
        "embora",
        "entre",
        "era",
        "├⌐s",
        "essa",
        "essas",
        "esse",
        "esses",
        "esta",
        "est├í",
        "est├úo",
        "estar",
        "estas",
        "est├ís",
        "estava",
        "este",
        "estes",
        "esteve",
        "estive",
        "estivemos",
        "estiveram",
        "estiveste",
        "estivestes",
        "estou",
        "eu",
        "exemplo",
        "fa├ºo",
        "falta",
        "favor",
        "faz",
        "fazeis",
        "fazem",
        "fazemos",
        "fazer",
        "fazes",
        "fez",
        "fim",
        "final",
        "foi",
        "fomos",
        "for",
        "foram",
        "forma",
        "foste",
        "fostes",
        "fui",
        "geral",
        "grande",
        "grandes",
        "grupo",
        "h├í",
        "hoje",
        "hora",
        "horas",
        "isso",
        "isto",
        "j├í",
        "l├í",
        "lado",
        "local",
        "logo",
        "longe",
        "lugar",
        "maior",
        "maioria",
        "mais",
        "mal",
        "mas",
        "m├íximo",
        "me",
        "meio",
        "menor",
        "menos",
        "m├¬s",
        "meses",
        "meu",
        "meus",
        "mil",
        "minha",
        "minhas",
        "momento",
        "muito",
        "muitos",
        "na",
        "nada",
        "n├úo",
        "naquela",
        "naquelas",
        "naquele",
        "naqueles",
        "nas",
        "nem",
        "nenhuma",
        "nessa",
        "nessas",
        "nesse",
        "nesses",
        "nesta",
        "nestas",
        "neste",
        "nestes",
        "n├¡vel",
        "no",
        "noite",
        "nome",
        "nos",
        "n├│s",
        "nossa",
        "nossas",
        "nosso",
        "nossos",
        "nova",
        "novas",
        "nove",
        "novo",
        "novos",
        "num",
        "numa",
        "n├║mero",
        "nunca",
        "o",
        "obra",
        "obrigada",
        "obrigado",
        "oitava",
        "oitavo",
        "oito",
        "onde",
        "ontem",
        "onze",
        "os",
        "ou",
        "outra",
        "outras",
        "outro",
        "outros",
        "para",
        "parece",
        "parte",
        "partir",
        "paucas",
        "pela",
        "pelas",
        "pelo",
        "pelos",
        "perto",
        "pode",
        "p├┤de",
        "podem",
        "poder",
        "p├╡e",
        "p├╡em",
        "ponto",
        "pontos",
        "por",
        "porque",
        "porqu├¬",
        "posi├º├úo",
        "poss├¡vel",
        "possivelmente",
        "posso",
        "pouca",
        "pouco",
        "poucos",
        "primeira",
        "primeiras",
        "primeiro",
        "primeiros",
        "pr├│pria",
        "pr├│prias",
        "pr├│prio",
        "pr├│prios",
        "pr├│xima",
        "pr├│ximas",
        "pr├│ximo",
        "pr├│ximos",
        "puderam",
        "qu├íis",
        "qual",
        "quando",
        "quanto",
        "quarta",
        "quarto",
        "quatro",
        "que",
        "qu├¬",
        "quem",
        "quer",
        "quereis",
        "querem",
        "queremas",
        "queres",
        "quero",
        "quest├úo",
        "quinta",
        "quinto",
        "quinze",
        "rela├º├úo",
        "sabe",
        "sabem",
        "s├úo",
        "se",
        "segunda",
        "segundo",
        "sei",
        "seis",
        "sem",
        "sempre",
        "ser",
        "seria",
        "sete",
        "s├⌐tima",
        "s├⌐timo",
        "seu",
        "seus",
        "sexta",
        "sexto",
        "sim",
        "sistema",
        "sob",
        "sobre",
        "sois",
        "somos",
        "sou",
        "sua",
        "suas",
        "tal",
        "talvez",
        "tamb├⌐m",
        "tanta",
        "tantas",
        "tanto",
        "t├úo",
        "tarde",
        "te",
        "tem",
        "t├¬m",
        "temos",
        "tendes",
        "tenho",
        "tens",
        "ter",
        "terceira",
        "terceiro",
        "teu",
        "teus",
        "teve",
        "tive",
        "tivemos",
        "tiveram",
        "tiveste",
        "tivestes",
        "toda",
        "todas",
        "todo",
        "todos",
        "trabalho",
        "tr├¬s",
        "treze",
        "tu",
        "tua",
        "tuas",
        "tudo",
        "um",
        "uma",
        "umas",
        "uns",
        "vai",
        "vais",
        "v├úo",
        "v├írios",
        "vem",
        "v├¬m",
        "vens",
        "ver",
        "vez",
        "vezes",
        "viagem",
        "vindo",
        "vinte",
        "voc├¬",
        "voc├¬s",
        "vos",
        "v├│s",
        "vossa",
        "vossas",
        "vosso",
        "vossos",
        "zero"
    ]
};
},{}],15:[function(require,module,exports){
/**
 * Created by jan on 9-3-15.
 */
// Russian stopwords
// via https://code.google.com/p/stop-words/

module.exports = {
    stopwords: [
        "╨░",
        "╨╡",
        "╨╕",
        "╨╢",
        "╨╝",
        "╨╛",
        "╨╜╨░",
        "╨╜╨╡",
        "╨╜╨╕",
        "╨╛╨▒",
        "╨╜╨╛",
        "╨╛╨╜",
        "╨╝╨╜╨╡",
        "╨╝╨╛╨╕",
        "╨╝╨╛╨╢",
        "╨╛╨╜╨░",
        "╨╛╨╜╨╕",
        "╨╛╨╜╨╛",
        "╨╝╨╜╨╛╨╣",
        "╨╝╨╜╨╛╨│╨╛",
        "╨╝╨╜╨╛╨│╨╛╤ç╨╕╤ü╨╗╨╡╨╜╨╜╨╛╨╡",
        "╨╝╨╜╨╛╨│╨╛╤ç╨╕╤ü╨╗╨╡╨╜╨╜╨░╤Å",
        "╨╝╨╜╨╛╨│╨╛╤ç╨╕╤ü╨╗╨╡╨╜╨╜╤ï╨╡",
        "╨╝╨╜╨╛╨│╨╛╤ç╨╕╤ü╨╗╨╡╨╜╨╜╤ï╨╣",
        "╨╝╨╜╨╛╤Ä",
        "╨╝╨╛╨╣",
        "╨╝╨╛╨│",
        "╨╝╨╛╨│╤â╤é",
        "╨╝╨╛╨╢╨╜╨╛",
        "╨╝╨╛╨╢╨╡╤é",
        "╨╝╨╛╨╢╤à╨╛",
        "╨╝╨╛╤Ç",
        "╨╝╨╛╤Å",
        "╨╝╨╛╤æ",
        "╨╝╨╛╤ç╤î",
        "╨╜╨░╨┤",
        "╨╜╨╡╨╡",
        "╨╛╨▒╨░",
        "╨╜╨░╨╝",
        "╨╜╨╡╨╝",
        "╨╜╨░╨╝╨╕",
        "╨╜╨╕╨╝╨╕",
        "╨╝╨╕╨╝╨╛",
        "╨╜╨╡╨╝╨╜╨╛╨│╨╛",
        "╨╛╨┤╨╜╨╛╨╣",
        "╨╛╨┤╨╜╨╛╨│╨╛",
        "╨╝╨╡╨╜╨╡╨╡",
        "╨╛╨┤╨╜╨░╨╢╨┤╤ï",
        "╨╛╨┤╨╜╨░╨║╨╛",
        "╨╝╨╡╨╜╤Å",
        "╨╜╨╡╨╝╤â",
        "╨╝╨╡╨╜╤î╤ê╨╡",
        "╨╜╨╡╨╣",
        "╨╜╨░╨▓╨╡╤Ç╤à╤â",
        "╨╜╨╡╨│╨╛",
        "╨╜╨╕╨╢╨╡",
        "╨╝╨░╨╗╨╛",
        "╨╜╨░╨┤╨╛",
        "╨╛╨┤╨╕╨╜",
        "╨╛╨┤╨╕╨╜╨╜╨░╨┤╤å╨░╤é╤î",
        "╨╛╨┤╨╕╨╜╨╜╨░╨┤╤å╨░╤é╤ï╨╣",
        "╨╜╨░╨╖╨░╨┤",
        "╨╜╨░╨╕╨▒╨╛╨╗╨╡╨╡",
        "╨╜╨╡╨┤╨░╨▓╨╜╨╛",
        "╨╝╨╕╨╗╨╗╨╕╨╛╨╜╨╛╨▓",
        "╨╜╨╡╨┤╨░╨╗╨╡╨║╨╛",
        "╨╝╨╡╨╢╨┤╤â",
        "╨╜╨╕╨╖╨║╨╛",
        "╨╝╨╡╨╗╤Å",
        "╨╜╨╡╨╗╤î╨╖╤Å",
        "╨╜╨╕╨▒╤â╨┤╤î",
        "╨╜╨╡╨┐╤Ç╨╡╤Ç╤ï╨▓╨╜╨╛",
        "╨╜╨░╨║╨╛╨╜╨╡╤å",
        "╨╜╨╕╨║╨╛╨│╨┤╨░",
        "╨╜╨╕╨║╤â╨┤╨░",
        "╨╜╨░╤ü",
        "╨╜╨░╤ê",
        "╨╜╨╡╤é",
        "╨╜╨╡╤Ä",
        "╨╜╨╡╤æ",
        "╨╜╨╕╤à",
        "╨╝╨╕╤Ç╨░",
        "╨╜╨░╤ê╨░",
        "╨╜╨░╤ê╨╡",
        "╨╜╨░╤ê╨╕",
        "╨╜╨╕╤ç╨╡╨│╨╛",
        "╨╜╨░╤ç╨░╨╗╨░",
        "╨╜╨╡╤Ç╨╡╨┤╨║╨╛",
        "╨╜╨╡╤ü╨║╨╛╨╗╤î╨║╨╛",
        "╨╛╨▒╤ï╤ç╨╜╨╛",
        "╨╛╨┐╤Å╤é╤î",
        "╨╛╨║╨╛╨╗╨╛",
        "╨╝╤ï",
        "╨╜╤â",
        "╨╜╤à",
        "╨╛╤é",
        "╨╛╤é╨╛╨▓╤ü╤Ä╨┤╤â",
        "╨╛╤ü╨╛╨▒╨╡╨╜╨╜╨╛",
        "╨╜╤â╨╢╨╜╨╛",
        "╨╛╤ç╨╡╨╜╤î",
        "╨╛╤é╤ü╤Ä╨┤╨░",
        "╨▓",
        "╨▓╨╛",
        "╨▓╨╛╨╜",
        "╨▓╨╜╨╕╨╖",
        "╨▓╨╜╨╕╨╖╤â",
        "╨▓╨╛╨║╤Ç╤â╨│",
        "╨▓╨╛╤é",
        "╨▓╨╛╤ü╨╡╨╝╨╜╨░╨┤╤å╨░╤é╤î",
        "╨▓╨╛╤ü╨╡╨╝╨╜╨░╨┤╤å╨░╤é╤ï╨╣",
        "╨▓╨╛╤ü╨╡╨╝╤î",
        "╨▓╨╛╤ü╤î╨╝╨╛╨╣",
        "╨▓╨▓╨╡╤Ç╤à",
        "╨▓╨░╨╝",
        "╨▓╨░╨╝╨╕",
        "╨▓╨░╨╢╨╜╨╛╨╡",
        "╨▓╨░╨╢╨╜╨░╤Å",
        "╨▓╨░╨╢╨╜╤ï╨╡",
        "╨▓╨░╨╢╨╜╤ï╨╣",
        "╨▓╨┤╨░╨╗╨╕",
        "╨▓╨╡╨╖╨┤╨╡",
        "╨▓╨╡╨┤╤î",
        "╨▓╨░╤ü",
        "╨▓╨░╤ê",
        "╨▓╨░╤ê╨░",
        "╨▓╨░╤ê╨╡",
        "╨▓╨░╤ê╨╕",
        "╨▓╨┐╤Ç╨╛╤ç╨╡╨╝",
        "╨▓╨╡╤ü╤î",
        "╨▓╨┤╤Ç╤â╨│",
        "╨▓╤ï",
        "╨▓╤ü╨╡",
        "╨▓╤é╨╛╤Ç╨╛╨╣",
        "╨▓╤ü╨╡╨╝",
        "╨▓╤ü╨╡╨╝╨╕",
        "╨▓╤Ç╨╡╨╝╨╡╨╜╨╕",
        "╨▓╤Ç╨╡╨╝╤Å",
        "╨▓╤ü╨╡╨╝╤â",
        "╨▓╤ü╨╡╨│╨╛",
        "╨▓╤ü╨╡╨│╨┤╨░",
        "╨▓╤ü╨╡╤à",
        "╨▓╤ü╨╡╤Ä",
        "╨▓╤ü╤Ä",
        "╨▓╤ü╤Å",
        "╨▓╤ü╤æ",
        "╨▓╤ü╤Ä╨┤╤â",
        "╨│",
        "╨│╨╛╨┤",
        "╨│╨╛╨▓╨╛╤Ç╨╕╨╗",
        "╨│╨╛╨▓╨╛╤Ç╨╕╤é",
        "╨│╨╛╨┤╨░",
        "╨│╨╛╨┤╤â",
        "╨│╨┤╨╡",
        "╨┤╨░",
        "╨╡╨╡",
        "╨╖╨░",
        "╨╕╨╖",
        "╨╗╨╕",
        "╨╢╨╡",
        "╨╕╨╝",
        "╨┤╨╛",
        "╨┐╨╛",
        "╨╕╨╝╨╕",
        "╨┐╨╛╨┤",
        "╨╕╨╜╨╛╨│╨┤╨░",
        "╨┤╨╛╨▓╨╛╨╗╤î╨╜╨╛",
        "╨╕╨╝╨╡╨╜╨╜╨╛",
        "╨┤╨╛╨╗╨│╨╛",
        "╨┐╨╛╨╖╨╢╨╡",
        "╨▒╨╛╨╗╨╡╨╡",
        "╨┤╨╛╨╗╨╢╨╜╨╛",
        "╨┐╨╛╨╢╨░╨╗╤â╨╣╤ü╤é╨░",
        "╨╖╨╜╨░╤ç╨╕╤é",
        "╨╕╨╝╨╡╤é╤î",
        "╨▒╨╛╨╗╤î╤ê╨╡",
        "╨┐╨╛╨║╨░",
        "╨╡╨╝╤â",
        "╨╕╨╝╤Å",
        "╨┐╨╛╤Ç",
        "╨┐╨╛╤Ç╨░",
        "╨┐╨╛╤é╨╛╨╝",
        "╨┐╨╛╤é╨╛╨╝╤â",
        "╨┐╨╛╤ü╨╗╨╡",
        "╨┐╨╛╤ç╨╡╨╝╤â",
        "╨┐╨╛╤ç╤é╨╕",
        "╨┐╨╛╤ü╤Ç╨╡╨┤╨╕",
        "╨╡╨╣",
        "╨┤╨▓╨░",
        "╨┤╨▓╨╡",
        "╨┤╨▓╨╡╨╜╨░╨┤╤å╨░╤é╤î",
        "╨┤╨▓╨╡╨╜╨░╨┤╤å╨░╤é╤ï╨╣",
        "╨┤╨▓╨░╨┤╤å╨░╤é╤î",
        "╨┤╨▓╨░╨┤╤å╨░╤é╤ï╨╣",
        "╨┤╨▓╤â╤à",
        "╨╡╨│╨╛",
        "╨┤╨╡╨╗",
        "╨╕╨╗╨╕",
        "╨▒╨╡╨╖",
        "╨┤╨╡╨╜╤î",
        "╨╖╨░╨╜╤Å╤é",
        "╨╖╨░╨╜╤Å╤é╨░",
        "╨╖╨░╨╜╤Å╤é╨╛",
        "╨╖╨░╨╜╤Å╤é╤ï",
        "╨┤╨╡╨╣╤ü╤é╨▓╨╕╤é╨╡╨╗╤î╨╜╨╛",
        "╨┤╨░╨▓╨╜╨╛",
        "╨┤╨╡╨▓╤Å╤é╨╜╨░╨┤╤å╨░╤é╤î",
        "╨┤╨╡╨▓╤Å╤é╨╜╨░╨┤╤å╨░╤é╤ï╨╣",
        "╨┤╨╡╨▓╤Å╤é╤î",
        "╨┤╨╡╨▓╤Å╤é╤ï╨╣",
        "╨┤╨░╨╢╨╡",
        "╨░╨╗╨╗╨╛",
        "╨╢╨╕╨╖╨╜╤î",
        "╨┤╨░╨╗╨╡╨║╨╛",
        "╨▒╨╗╨╕╨╖╨║╨╛",
        "╨╖╨┤╨╡╤ü╤î",
        "╨┤╨░╨╗╤î╤ê╨╡",
        "╨┤╨╗╤Å",
        "╨╗╨╡╤é",
        "╨╖╨░╤é╨╛",
        "╨┤╨░╤Ç╨╛╨╝",
        "╨┐╨╡╤Ç╨▓╤ï╨╣",
        "╨┐╨╡╤Ç╨╡╨┤",
        "╨╖╨░╤é╨╡╨╝",
        "╨╖╨░╤ç╨╡╨╝",
        "╨╗╨╕╤ê╤î",
        "╨┤╨╡╤ü╤Å╤é╤î",
        "╨┤╨╡╤ü╤Å╤é╤ï╨╣",
        "╨╡╤Ä",
        "╨╡╤æ",
        "╨╕╤à",
        "╨▒╤ï",
        "╨╡╤ë╨╡",
        "╨┐╤Ç╨╕",
        "╨▒╤ï╨╗",
        "╨┐╤Ç╨╛",
        "╨┐╤Ç╨╛╤å╨╡╨╜╤é╨╛╨▓",
        "╨┐╤Ç╨╛╤é╨╕╨▓",
        "╨┐╤Ç╨╛╤ü╤é╨╛",
        "╨▒╤ï╨▓╨░╨╡╤é",
        "╨▒╤ï╨▓╤î",
        "╨╡╤ü╨╗╨╕",
        "╨╗╤Ä╨┤╨╕",
        "╨▒╤ï╨╗╨░",
        "╨▒╤ï╨╗╨╕",
        "╨▒╤ï╨╗╨╛",
        "╨▒╤â╨┤╨╡╨╝",
        "╨▒╤â╨┤╨╡╤é",
        "╨▒╤â╨┤╨╡╤é╨╡",
        "╨▒╤â╨┤╨╡╤ê╤î",
        "╨┐╤Ç╨╡╨║╤Ç╨░╤ü╨╜╨╛",
        "╨▒╤â╨┤╤â",
        "╨▒╤â╨┤╤î",
        "╨▒╤â╨┤╤é╨╛",
        "╨▒╤â╨┤╤â╤é",
        "╨╡╤ë╤æ",
        "╨┐╤Å╤é╨╜╨░╨┤╤å╨░╤é╤î",
        "╨┐╤Å╤é╨╜╨░╨┤╤å╨░╤é╤ï╨╣",
        "╨┤╤Ç╤â╨│╨╛",
        "╨┤╤Ç╤â╨│╨╛╨╡",
        "╨┤╤Ç╤â╨│╨╛╨╣",
        "╨┤╤Ç╤â╨│╨╕╨╡",
        "╨┤╤Ç╤â╨│╨░╤Å",
        "╨┤╤Ç╤â╨│╨╕╤à",
        "╨╡╤ü╤é╤î",
        "╨┐╤Å╤é╤î",
        "╨▒╤ï╤é╤î",
        "╨╗╤â╤ç╤ê╨╡",
        "╨┐╤Å╤é╤ï╨╣",
        "╨║",
        "╨║╨╛╨╝",
        "╨║╨╛╨╜╨╡╤ç╨╜╨╛",
        "╨║╨╛╨╝╤â",
        "╨║╨╛╨│╨╛",
        "╨║╨╛╨│╨┤╨░",
        "╨║╨╛╤é╨╛╤Ç╨╛╨╣",
        "╨║╨╛╤é╨╛╤Ç╨╛╨│╨╛",
        "╨║╨╛╤é╨╛╤Ç╨░╤Å",
        "╨║╨╛╤é╨╛╤Ç╤ï╨╡",
        "╨║╨╛╤é╨╛╤Ç╤ï╨╣",
        "╨║╨╛╤é╨╛╤Ç╤ï╤à",
        "╨║╨╡╨╝",
        "╨║╨░╨╢╨┤╨╛╨╡",
        "╨║╨░╨╢╨┤╨░╤Å",
        "╨║╨░╨╢╨┤╤ï╨╡",
        "╨║╨░╨╢╨┤╤ï╨╣",
        "╨║╨░╨╢╨╡╤é╤ü╤Å",
        "╨║╨░╨║",
        "╨║╨░╨║╨╛╨╣",
        "╨║╨░╨║╨░╤Å",
        "╨║╤é╨╛",
        "╨║╤Ç╨╛╨╝╨╡",
        "╨║╤â╨┤╨░",
        "╨║╤Ç╤â╨│╨╛╨╝",
        "╤ü",
        "╤é",
        "╤â",
        "╤Å",
        "╤é╨░",
        "╤é╨╡",
        "╤â╨╢",
        "╤ü╨╛",
        "╤é╨╛",
        "╤é╨╛╨╝",
        "╤ü╨╜╨╛╨▓╨░",
        "╤é╨╛╨╝╤â",
        "╤ü╨╛╨▓╤ü╨╡╨╝",
        "╤é╨╛╨│╨╛",
        "╤é╨╛╨│╨┤╨░",
        "╤é╨╛╨╢╨╡",
        "╤ü╨╛╨▒╨╛╨╣",
        "╤é╨╛╨▒╨╛╨╣",
        "╤ü╨╛╨▒╨╛╤Ä",
        "╤é╨╛╨▒╨╛╤Ä",
        "╤ü╨╜╨░╤ç╨░╨╗╨░",
        "╤é╨╛╨╗╤î╨║╨╛",
        "╤â╨╝╨╡╤é╤î",
        "╤é╨╛╤é",
        "╤é╨╛╤Ä",
        "╤à╨╛╤Ç╨╛╤ê╨╛",
        "╤à╨╛╤é╨╡╤é╤î",
        "╤à╨╛╤ç╨╡╤ê╤î",
        "╤à╨╛╤é╤î",
        "╤à╨╛╤é╤Å",
        "╤ü╨▓╨╛╨╡",
        "╤ü╨▓╨╛╨╕",
        "╤é╨▓╨╛╨╣",
        "╤ü╨▓╨╛╨╡╨╣",
        "╤ü╨▓╨╛╨╡╨│╨╛",
        "╤ü╨▓╨╛╨╕╤à",
        "╤ü╨▓╨╛╤Ä",
        "╤é╨▓╨╛╤Å",
        "╤é╨▓╨╛╤æ",
        "╤Ç╨░╨╖",
        "╤â╨╢╨╡",
        "╤ü╨░╨╝",
        "╤é╨░╨╝",
        "╤é╨╡╨╝",
        "╤ç╨╡╨╝",
        "╤ü╨░╨╝╨░",
        "╤ü╨░╨╝╨╕",
        "╤é╨╡╨╝╨╕",
        "╤ü╨░╨╝╨╛",
        "╤Ç╨░╨╜╨╛",
        "╤ü╨░╨╝╨╛╨╝",
        "╤ü╨░╨╝╨╛╨╝╤â",
        "╤ü╨░╨╝╨╛╨╣",
        "╤ü╨░╨╝╨╛╨│╨╛",
        "╤ü╨╡╨╝╨╜╨░╨┤╤å╨░╤é╤î",
        "╤ü╨╡╨╝╨╜╨░╨┤╤å╨░╤é╤ï╨╣",
        "╤ü╨░╨╝╨╕╨╝",
        "╤ü╨░╨╝╨╕╨╝╨╕",
        "╤ü╨░╨╝╨╕╤à",
        "╤ü╨░╨╝╤â",
        "╤ü╨╡╨╝╤î",
        "╤ç╨╡╨╝╤â",
        "╤Ç╨░╨╜╤î╤ê╨╡",
        "╤ü╨╡╨╣╤ç╨░╤ü",
        "╤ç╨╡╨│╨╛",
        "╤ü╨╡╨│╨╛╨┤╨╜╤Å",
        "╤ü╨╡╨▒╨╡",
        "╤é╨╡╨▒╨╡",
        "╤ü╨╡╨░╨╛╨╣",
        "╤ç╨╡╨╗╨╛╨▓╨╡╨║",
        "╤Ç╨░╨╖╨▓╨╡",
        "╤é╨╡╨┐╨╡╤Ç╤î",
        "╤ü╨╡╨▒╤Å",
        "╤é╨╡╨▒╤Å",
        "╤ü╨╡╨┤╤î╨╝╨╛╨╣",
        "╤ü╨┐╨░╤ü╨╕╨▒╨╛",
        "╤ü╨╗╨╕╤ê╨║╨╛╨╝",
        "╤é╨░╨║",
        "╤é╨░╨║╨╛╨╡",
        "╤é╨░╨║╨╛╨╣",
        "╤é╨░╨║╨╕╨╡",
        "╤é╨░╨║╨╢╨╡",
        "╤é╨░╨║╨░╤Å",
        "╤ü╨╕╤à",
        "╤é╨╡╤à",
        "╤ç╨░╤ë╨╡",
        "╤ç╨╡╤é╨▓╨╡╤Ç╤é╤ï╨╣",
        "╤ç╨╡╤Ç╨╡╨╖",
        "╤ç╨░╤ü╤é╨╛",
        "╤ê╨╡╤ü╤é╨╛╨╣",
        "╤ê╨╡╤ü╤é╨╜╨░╨┤╤å╨░╤é╤î",
        "╤ê╨╡╤ü╤é╨╜╨░╨┤╤å╨░╤é╤ï╨╣",
        "╤ê╨╡╤ü╤é╤î",
        "╤ç╨╡╤é╤ï╤Ç╨╡",
        "╤ç╨╡╤é╤ï╤Ç╨╜╨░╨┤╤å╨░╤é╤î",
        "╤ç╨╡╤é╤ï╤Ç╨╜╨░╨┤╤å╨░╤é╤ï╨╣",
        "╤ü╨║╨╛╨╗╤î╨║╨╛",
        "╤ü╨║╨░╨╖╨░╨╗",
        "╤ü╨║╨░╨╖╨░╨╗╨░",
        "╤ü╨║╨░╨╖╨░╤é╤î",
        "╤é╤â",
        "╤é╤ï",
        "╤é╤Ç╨╕",
        "╤ì╤é╨░",
        "╤ì╤é╨╕",
        "╤ç╤é╨╛",
        "╤ì╤é╨╛",
        "╤ç╤é╨╛╨▒",
        "╤ì╤é╨╛╨╝",
        "╤ì╤é╨╛╨╝╤â",
        "╤ì╤é╨╛╨╣",
        "╤ì╤é╨╛╨│╨╛",
        "╤ç╤é╨╛╨▒╤ï",
        "╤ì╤é╨╛╤é",
        "╤ü╤é╨░╨╗",
        "╤é╤â╨┤╨░",
        "╤ì╤é╨╕╨╝",
        "╤ì╤é╨╕╨╝╨╕",
        "╤Ç╤Å╨┤╨╛╨╝",
        "╤é╤Ç╨╕╨╜╨░╨┤╤å╨░╤é╤î",
        "╤é╤Ç╨╕╨╜╨░╨┤╤å╨░╤é╤ï╨╣",
        "╤ì╤é╨╕╤à",
        "╤é╤Ç╨╡╤é╨╕╨╣",
        "╤é╤â╤é",
        "╤ì╤é╤â",
        "╤ü╤â╤é╤î",
        "╤ç╤â╤é╤î",
        "╤é╤ï╤ü╤Å╤ç"
    ]
};

},{}],16:[function(require,module,exports){
/**
 * Created by jan on 9-3-15.
 */
// Swedish stopwords
// http://www.ranks.nl/stopwords/swedish
// https://github.com/AlexGustafsson

module.exports = {
    stopwords: [
        "aderton",
        "adertonde",
        "adj├╢",
        "aldrig",
        "alla",
        "allas",
        "allt",
        "alltid",
        "allts├Ñ",
        "├ñn",
        "andra",
        "andras",
        "annan",
        "annat",
        "├ñnnu",
        "artonde",
        "artonn",
        "├Ñtminstone",
        "att",
        "├Ñtta",
        "├Ñttio",
        "├Ñttionde",
        "├Ñttonde",
        "av",
        "├ñven",
        "b├Ñda",
        "b├Ñdas",
        "bakom",
        "bara",
        "b├ñst",
        "b├ñttre",
        "beh├╢va",
        "beh├╢vas",
        "beh├╢vde",
        "beh├╢vt",
        "beslut",
        "beslutat",
        "beslutit",
        "bland",
        "blev",
        "bli",
        "blir",
        "blivit",
        "bort",
        "borta",
        "bra",
        "d├Ñ",
        "dag",
        "dagar",
        "dagarna",
        "dagen",
        "d├ñr",
        "d├ñrf├╢r",
        "de",
        "del",
        "delen",
        "dem",
        "den",
        "deras",
        "dess",
        "det",
        "detta",
        "dig",
        "din",
        "dina",
        "dit",
        "ditt",
        "dock",
        "du",
        "efter",
        "eftersom",
        "elfte",
        "eller",
        "elva",
        "en",
        "enkel",
        "enkelt",
        "enkla",
        "enligt",
        "er",
        "era",
        "ert",
        "ett",
        "ettusen",
        "f├Ñ",
        "fanns",
        "f├Ñr",
        "f├Ñtt",
        "fem",
        "femte",
        "femtio",
        "femtionde",
        "femton",
        "femtonde",
        "fick",
        "fin",
        "finnas",
        "finns",
        "fj├ñrde",
        "fjorton",
        "fjortonde",
        "fler",
        "flera",
        "flesta",
        "f├╢ljande",
        "f├╢r",
        "f├╢re",
        "f├╢rl├Ñt",
        "f├╢rra",
        "f├╢rsta",
        "fram",
        "framf├╢r",
        "fr├Ñn",
        "fyra",
        "fyrtio",
        "fyrtionde",
        "g├Ñ",
        "g├ñlla",
        "g├ñller",
        "g├ñllt",
        "g├Ñr",
        "g├ñrna",
        "g├Ñtt",
        "genast",
        "genom",
        "gick",
        "gjorde",
        "gjort",
        "god",
        "goda",
        "godare",
        "godast",
        "g├╢r",
        "g├╢ra",
        "gott",
        "ha",
        "hade",
        "haft",
        "han",
        "hans",
        "har",
        "h├ñr",
        "heller",
        "hellre",
        "helst",
        "helt",
        "henne",
        "hennes",
        "hit",
        "h├╢g",
        "h├╢ger",
        "h├╢gre",
        "h├╢gst",
        "hon",
        "honom",
        "hundra",
        "hundraen",
        "hundraett",
        "hur",
        "i",
        "ibland",
        "idag",
        "ig├Ñr",
        "igen",
        "imorgon",
        "in",
        "inf├╢r",
        "inga",
        "ingen",
        "ingenting",
        "inget",
        "innan",
        "inne",
        "inom",
        "inte",
        "inuti",
        "ja",
        "jag",
        "j├ñmf├╢rt",
        "kan",
        "kanske",
        "knappast",
        "kom",
        "komma",
        "kommer",
        "kommit",
        "kr",
        "kunde",
        "kunna",
        "kunnat",
        "kvar",
        "l├ñnge",
        "l├ñngre",
        "l├Ñngsam",
        "l├Ñngsammare",
        "l├Ñngsammast",
        "l├Ñngsamt",
        "l├ñngst",
        "l├Ñngt",
        "l├ñtt",
        "l├ñttare",
        "l├ñttast",
        "legat",
        "ligga",
        "ligger",
        "lika",
        "likst├ñlld",
        "likst├ñllda",
        "lilla",
        "lite",
        "liten",
        "litet",
        "man",
        "m├Ñnga",
        "m├Ñste",
        "med",
        "mellan",
        "men",
        "mer",
        "mera",
        "mest",
        "mig",
        "min",
        "mina",
        "mindre",
        "minst",
        "mitt",
        "mittemot",
        "m├╢jlig",
        "m├╢jligen",
        "m├╢jligt",
        "m├╢jligtvis",
        "mot",
        "mycket",
        "n├Ñgon",
        "n├Ñgonting",
        "n├Ñgot",
        "n├Ñgra",
        "n├ñr",
        "n├ñsta",
        "ned",
        "nederst",
        "nedersta",
        "nedre",
        "nej",
        "ner",
        "ni",
        "nio",
        "nionde",
        "nittio",
        "nittionde",
        "nitton",
        "nittonde",
        "n├╢dv├ñndig",
        "n├╢dv├ñndiga",
        "n├╢dv├ñndigt",
        "n├╢dv├ñndigtvis",
        "nog",
        "noll",
        "nr",
        "nu",
        "nummer",
        "och",
        "ocks├Ñ",
        "ofta",
        "oftast",
        "olika",
        "olikt",
        "om",
        "oss",
        "├╢ver",
        "├╢vermorgon",
        "├╢verst",
        "├╢vre",
        "p├Ñ",
        "rakt",
        "r├ñtt",
        "redan",
        "redigera",
        "s├Ñ",
        "sade",
        "s├ñga",
        "s├ñger",
        "sagt",
        "samma",
        "s├ñmre",
        "s├ñmst",
        "se",
        "sedan",
        "senare",
        "senast",
        "sent",
        "sex",
        "sextio",
        "sextionde",
        "sexton",
        "sextonde",
        "sig",
        "sin",
        "sina",
        "sist",
        "sista",
        "siste",
        "sitt",
        "sj├ñtte",
        "sju",
        "sjunde",
        "sjuttio",
        "sjuttionde",
        "sjutton",
        "sjuttonde",
        "ska",
        "skall",
        "skulle",
        "slutligen",
        "sm├Ñ",
        "sm├Ñtt",
        "snart",
        "som",
        "stor",
        "stora",
        "st├╢rre",
        "st├╢rst",
        "stort",
        "tack",
        "tidig",
        "tidigare",
        "tidigast",
        "tidigt",
        "till",
        "tills",
        "tillsammans",
        "tio",
        "tionde",
        "tjugo",
        "tjugoen",
        "tjugoett",
        "tjugonde",
        "tjugotre",
        "tjugotv├Ñ",
        "tjungo",
        "tolfte",
        "tolv",
        "tre",
        "tredje",
        "trettio",
        "trettionde",
        "tretton",
        "trettonde",
        "tv├Ñ",
        "tv├Ñhundra",
        "under",
        "upp",
        "ur",
        "urs├ñkt",
        "ut",
        "utan",
        "utanf├╢r",
        "ute",
        "vad",
        "v├ñnster",
        "v├ñnstra",
        "v├Ñr",
        "vara",
        "v├Ñra",
        "varf├╢r",
        "varifr├Ñn",
        "varit",
        "varken",
        "v├ñrre",
        "vars├Ñgod",
        "vart",
        "v├Ñrt",
        "vem",
        "vems",
        "verkligen",
        "vi",
        "vid",
        "vidare",
        "viktig",
        "viktigare",
        "viktigast",
        "viktigt",
        "vilka",
        "vilken",
        "vilket",
        "vill",
        "├ñr",
        "├Ñr",

        "├ñven",
        "dessa",
        "wikitext",
        "wikipedia",
        "tyngre",
        "tung",
        "tyngst",
        "kall",
        "var",
        "minimum",
        "min",
        "max",
        "maximum",
        "├╢kning",
        "├╢ka",
        "kallar",
        "hj├ñlp",
        "anv├ñnder",
        "betydligt",
        "s├ñtt",
        "denna",
        "detta",
        "det",
        "hj├ñlpa",
        "anv├ñnds",
        "best├Ñr",
        "tr├ñnger",
        "igenom",
        "denna",
        "ut├╢ka",
        "utarmat",
        "ungef├ñr",
        "sprids",
        "betydligt",
        "omgivande",
        "via",
        "huvudartikel",
        "exempel",
        "exempelvis",
        "vanligt",
        "per",
        "st├╢rsta",
        "stor",
        "ord",
        "ordet",
        "kallas",
        "p├Ñb├╢rjad",
        "h├╢ra",
        "fr├ñmst",
        "ihop",
        "antalet",
        "the",
        "uttryck",
        "uttrycket",
        "├ñndra",
        "presenteras",
        "presenterades",
        "t├ñnka",
        "delar",
        "s├╢ka",
        "h├ñmta",
        "inneh├Ñll",
        "definera",
        "anv├ñnda",
        "pekar",
        "ist├ñllet",
        "st├ñllet",
        "pekar",
        "standard",
        "vanligaste",
        "heter",
        "precist",
        "felaktigt",
        "k├ñllor",
        "h├╢ga",
        "mottagare",
        "eng",
        "bildade",
        "bytte",
        "bildades",
        "grundades",
        "svar",
        "betyder",
        "betydelse",
        "m├╢jligheter",
        "m├╢jlig",
        "m├╢jlighet",
        "syfte",
        "gamla",
        "tio├Ñrig",
        "├Ñr",
        "├╢verg├Ñngsperiod",
        "ers├ñttas",
        "anv├ñndes",
        "anv├ñnds",
        "utg├╢rs",
        "drygt",
        "alla",
        "allt",
        "allts├Ñ",
        "andra",
        "att",
        "bara",
        "bli",
        "blir",
        "borde",
        "bra",
        "mitt",
        "ser",
        "dem",
        "den",
        "denna",
        "det",
        "detta",
        "dig",
        "din",
        "dock",
        "dom",
        "d├ñr",
        "edit",
        "efter",
        "eftersom",
        "eller",
        "ett",
        "fast",
        "fel",
        "fick",
        "finns",
        "fram",
        "fr├Ñn",
        "f├Ñr",
        "f├Ñtt",
        "f├╢r",
        "f├╢rsta",
        "genom",
        "ger",
        "g├Ñr",
        "g├╢r",
        "g├╢ra",
        "hade",
        "han",
        "har",
        "hela",
        "helt",
        "honom",
        "hur",
        "h├ñr",
        "iaf",
        "igen",
        "ingen",
        "inget",
        "inte",
        "jag",
        "kan",
        "kanske",
        "kommer",
        "lika",
        "lite",
        "man",
        "med",
        "men",
        "mer",
        "mig",
        "min",
        "mot",
        "mycket",
        "m├Ñnga",
        "m├Ñste",
        "nog",
        "n├ñr",
        "n├Ñgon",
        "n├Ñgot",
        "n├Ñgra",
        "n├Ñn",
        "n├Ñt",
        "och",
        "ocks├Ñ",
        "r├ñtt",
        "samma",
        "sedan",
        "sen",
        "sig",
        "sin",
        "sj├ñlv",
        "ska",
        "skulle",
        "som",
        "s├ñtt",
        "tar",
        "till",
        "tror",
        "tycker",
        "typ",
        "upp",
        "utan",
        "vad",
        "var",
        "vara",
        "vet",
        "vid",
        "vilket",
        "vill",
        "v├ñl",
        "├ñven",
        "├╢ver",
        "f├╢rekommer",
        "varierar",
        "representera",
        "representerar",
        "itu",
        "p├Ñb├╢rjades",
        "le",
        "├Ñtg├ñrder",
        "├Ñtg├ñrd",
        "s├Ñdant",
        "s├ñrskilt",
        "eftersom",
        "som",
        "efter",
        "syftet",
        "syfte",
        "ersatts",
        "ers├ñtts",
        "ersatt",
        "ers├ñtt",
        "tagits",
        "byter",
        "ben├ñmningar",
        "ler",
        "├ñrvs",
        "├ñrv",
        "├ñrvd",
        "januari",
        "februari",
        "mars",
        "april",
        "maj",
        "juni",
        "juli",
        "augusti",
        "september",
        "oktober",
        "november",
        "december",
        "on",
        "├╢vriga",
        "anv├ñnts",
        "anv├ñnd",
        "anv├ñnds",
        "anv├ñnt",
        "syftar",
        "ex",
        "sv├Ñrt",
        "sv├Ñr",
        "l├ñtt",
        "l├ñtta",
        "l├ñttast",
        "l├ñttare",
        "sv├Ñrare",
        "sv├Ñrast",
        "list",
        "anv├ñndningsomr├Ñde",
        "anv├ñndningsomr├Ñden",
        "vissa",
        "ii",
        "hembyggda",
        "krav",
        "lugnt",
        "├ñnd├Ñ",
        "stycken",
        "styck",
        "l├Ñnga",
        "korta",
        "sm├Ñ",
        "stora",
        "smala",
        "tjocka",
        "b├╢rjan",
        "tungt",
        "l├ñtt",
        "tim",
        "st",
        "kg",
        "km",
        "tid",
        "ny",
        "gammal",
        "nyare",
        "antal",
        "snabbare",
        "b├╢rjade",
        "ansvar",
        "ansvarar",
        "b├Ñde",
        "ca",
        "l├Ñg",
        "h├╢g",
        "ro",
        "ton",
        "kap",
        "of",
        "and",
        "vars",
        "kr/km",
        "r├╢r",
        "g├ñllande",
        "placeras",
        "placerades",
        "t├ñckt",
        "samt",
        "hos",
        "s├Ñdana",
        "endast",
        "tillst├Ñnd",
        "beror",
        "p├Ñ",
        "marken",
        "minska",
        "orsaker",
        "l├╢sningar",
        "problem",
        "namn",
        "f├╢rv├ñntas",
        "f├╢rv├ñntan",
        "f├╢rv├ñntats",
        "varning",
        "utf├ñrdas",
        "utf├ñrda",
        "km/h",
        "n├Ñdde",
        "stod",
        "omr├Ñdet",
        "omr├Ñden",
        "k├ñlla",
        "beh├╢vs",
        "drabbade",
        "drabbat",
        "which",
        "top",
        "that",
        "l├ñgre",
        "allm├ñnt",
        "drog",
        "drar",
        "enorma",
        "├ñnda",
        "enda",
        "officiella",
        "bekr├ñftats",
        "bekr├ñftas",
        "fall",
        "sjunker",
        "ned├Ñt",
        "v├ñrms",
        "samtidigt",
        "efterf├╢ljd",
        "problematik",
        "upp├Ñt",
        "utom",
        "f├╢rutom",
        "h├╢rnet",
        "s├╢t",
        "salt",
        "svag",
        "stark",
        "ren",
        "smutsig",
        "f├╢rr",
        "tiden",
        "m├Ñngdag",
        "tisdag",
        "onsdag",
        "torsdag",
        "fredag",
        "l├╢rdag",
        "s├╢ndag",
        "m├Ñndagar",
        "tisdagar",
        "onsdagar",
        "torsdagar",
        "fredagar",
        "l├╢rdagar",
        "s├╢ndagar",
        "efterlikna",
        "som",
        "lik",
        "bergis",
        "bekymmer",
        "s├Ñ",
        "lista",
        "dig",
        "dej",
        "mig",
        "mej",
        "fri",
        "vanlig",
        "ovanlig",
        "s├ñllan",
        "ofta",
        "avskiljs",
        "use",
        "sl├ñkte",
        "sl├ñktet",
        "sl├ñkt",
        "kategori",
        "kategoriseras",
        "rensas",
        "renas",
        "timmar",
        "minuter",
        "sekunder"
    ]
};

},{}],17:[function(require,module,exports){
module.exports = {
	danish: require("./da").stopwords,
	dutch: require("./nl").stopwords,
	english: require("./en").stopwords,
	french: require("./fr").stopwords,
	galician: require("./gl").stopwords,
	german: require("./de").stopwords,
	italian: require("./it").stopwords,
	polish: require("./pl").stopwords,
	portuguese: require("./pt").stopwords,
	russian: require("./ru").stopwords,
	spanish: require("./es").stopwords,
	swedish: require("./se").stopwords
};

},{"./da":5,"./de":6,"./en":7,"./es":8,"./fr":9,"./gl":10,"./it":11,"./nl":12,"./pl":13,"./pt":14,"./ru":15,"./se":16}],18:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],19:[function(require,module,exports){
module.exports={
  "_from": "tesseract.js",
  "_id": "tesseract.js@1.0.10",
  "_inBundle": false,
  "_integrity": "sha1-4RqWrnYUeTnZIY+I4of7aUFLHl0=",
  "_location": "/tesseract.js",
  "_phantomChildren": {},
  "_requested": {
    "type": "tag",
    "registry": true,
    "raw": "tesseract.js",
    "name": "tesseract.js",
    "escapedName": "tesseract.js",
    "rawSpec": "",
    "saveSpec": null,
    "fetchSpec": "latest"
  },
  "_requiredBy": [
    "#USER",
    "/"
  ],
  "_resolved": "https://registry.npmjs.org/tesseract.js/-/tesseract.js-1.0.10.tgz",
  "_shasum": "e11a96ae76147939d9218f88e287fb69414b1e5d",
  "_spec": "tesseract.js",
  "_where": "C:\\Users\\josep\\Desktop\\HCI",
  "author": "",
  "browser": {
    "./src/node/index.js": "./src/browser/index.js"
  },
  "bugs": {
    "url": "https://github.com/naptha/tesseract.js/issues"
  },
  "bundleDependencies": false,
  "dependencies": {
    "file-type": "^3.8.0",
    "is-url": "^1.2.2",
    "jpeg-js": "^0.2.0",
    "level-js": "^2.2.4",
    "node-fetch": "^1.6.3",
    "object-assign": "^4.1.0",
    "png.js": "^0.2.1",
    "tesseract.js-core": "^1.0.2"
  },
  "deprecated": false,
  "description": "Pure Javascript Multilingual OCR",
  "devDependencies": {
    "babel-preset-es2015": "^6.16.0",
    "babelify": "^7.3.0",
    "browserify": "^13.1.0",
    "envify": "^3.4.1",
    "http-server": "^0.9.0",
    "pako": "^1.0.3",
    "watchify": "^3.7.0"
  },
  "homepage": "https://github.com/naptha/tesseract.js",
  "license": "Apache-2.0",
  "main": "src/index.js",
  "name": "tesseract.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/naptha/tesseract.js.git"
  },
  "scripts": {
    "build": "browserify src/index.js -t [ babelify --presets [ es2015 ] ] -o dist/tesseract.js --standalone Tesseract && browserify src/browser/worker.js -t [ babelify --presets [ es2015 ] ] -o dist/worker.js",
    "release": "npm run build && git commit -am 'new release' && git push && git tag `jq -r '.version' package.json` && git push origin --tags && npm publish",
    "start": "watchify src/index.js  -t [ envify --NODE_ENV development ] -t [ babelify --presets [ es2015 ] ] -o dist/tesseract.dev.js --standalone Tesseract & watchify src/browser/worker.js  -t [ envify --NODE_ENV development ] -t [ babelify --presets [ es2015 ] ] -o dist/worker.dev.js & http-server -p 7355",
    "test": "echo \"Error: no test specified\" & exit 1"
  },
  "version": "1.0.10"
}

},{}],20:[function(require,module,exports){
(function (process){
var defaultOptions = {
    // workerPath: 'https://cdn.rawgit.com/naptha/tesseract.js/0.2.0/dist/worker.js',
    corePath: 'https://cdn.rawgit.com/naptha/tesseract.js-core/0.1.0/index.js',    
    langPath: 'https://cdn.rawgit.com/naptha/tessdata/gh-pages/3.02/',
}

if (process.env.NODE_ENV === "development") {
    console.debug('Using Development Configuration')
    defaultOptions.workerPath = location.protocol + '//' + location.host + '/dist/worker.dev.js?nocache=' + Math.random().toString(36).slice(3)
}else{
    var version = require('../../package.json').version;
    defaultOptions.workerPath = 'https://cdn.rawgit.com/naptha/tesseract.js/' + version + '/dist/worker.js'
}

exports.defaultOptions = defaultOptions;


exports.spawnWorker = function spawnWorker(instance, workerOptions){
    if(window.Blob && window.URL){
        var blob = new Blob(['importScripts("' + workerOptions.workerPath + '");'])
        var worker = new Worker(window.URL.createObjectURL(blob));
    }else{
        var worker = new Worker(workerOptions.workerPath)
    }

    worker.onmessage = function(e){
        var packet = e.data;
        instance._recv(packet)
    }
    return worker
}

exports.terminateWorker = function(instance){
    instance.worker.terminate()
}

exports.sendPacket = function sendPacket(instance, packet){
    loadImage(packet.payload.image, function(img){
        packet.payload.image = img
        instance.worker.postMessage(packet) 
    })
}


function loadImage(image, cb){
    if(typeof image === 'string'){
        if(/^\#/.test(image)){
            // element css selector
            return loadImage(document.querySelector(image), cb)
        }else if(/(blob|data)\:/.test(image)){
            // data url
            var im = new Image
            im.src = image;
            im.onload = e => loadImage(im, cb);
            return
        }else{
            var xhr = new XMLHttpRequest();
            xhr.open('GET', image, true)
            xhr.responseType = "blob";
            xhr.onload = e => loadImage(xhr.response, cb);
            xhr.onerror = function(e){
                if(/^https?:\/\//.test(image) && !/^https:\/\/crossorigin.me/.test(image)){
                    console.debug('Attempting to load image with CORS proxy')
                    loadImage('https://crossorigin.me/' + image, cb)
                }
            }
            xhr.send(null)
            return
        }
    }else if(image instanceof File){
        // files
        var fr = new FileReader()
        fr.onload = e => loadImage(fr.result, cb);
        fr.readAsDataURL(image)
        return
    }else if(image instanceof Blob){
        return loadImage(URL.createObjectURL(image), cb)
    }else if(image.getContext){
        // canvas element
        return loadImage(image.getContext('2d'), cb)
    }else if(image.tagName == "IMG" || image.tagName == "VIDEO"){
        // image element or video element
        var c = document.createElement('canvas');
        c.width  = image.naturalWidth  || image.videoWidth;
        c.height = image.naturalHeight || image.videoHeight;
        var ctx = c.getContext('2d');
        ctx.drawImage(image, 0, 0);
        return loadImage(ctx, cb)
    }else if(image.getImageData){
        // canvas context
        var data = image.getImageData(0, 0, image.canvas.width, image.canvas.height);
        return loadImage(data, cb)
    }else{
        return cb(image)
    }
    throw new Error('Missing return in loadImage cascade')

}

}).call(this,require('_process'))
},{"../../package.json":19,"_process":1}],21:[function(require,module,exports){
// The result of dump.js is a big JSON tree
// which can be easily serialized (for instance
// to be sent from a webworker to the main app
// or through Node's IPC), but we want
// a (circular) DOM-like interface for walking
// through the data. 

module.exports = function circularize(page){
    page.paragraphs = []
    page.lines = []
    page.words = []
    page.symbols = []

    page.blocks.forEach(function(block){
        block.page = page;

        block.lines = []
        block.words = []
        block.symbols = []

        block.paragraphs.forEach(function(para){
            para.block = block;
            para.page = page;

            para.words = []
            para.symbols = []
            
            para.lines.forEach(function(line){
                line.paragraph = para;
                line.block = block;
                line.page = page;

                line.symbols = []

                line.words.forEach(function(word){
                    word.line = line;
                    word.paragraph = para;
                    word.block = block;
                    word.page = page;
                    word.symbols.forEach(function(sym){
                        sym.word = word;
                        sym.line = line;
                        sym.paragraph = para;
                        sym.block = block;
                        sym.page = page;
                        
                        sym.line.symbols.push(sym)
                        sym.paragraph.symbols.push(sym)
                        sym.block.symbols.push(sym)
                        sym.page.symbols.push(sym)
                    })
                    word.paragraph.words.push(word)
                    word.block.words.push(word)
                    word.page.words.push(word)
                })
                line.block.lines.push(line)
                line.page.lines.push(line)
            })
            para.page.paragraphs.push(para)
        })
    })
    return page
}
},{}],22:[function(require,module,exports){
const adapter = require('../node/index.js')

let jobCounter = 0;

module.exports = class TesseractJob {
    constructor(instance){
        this.id = 'Job-' + (++jobCounter) + '-' + Math.random().toString(16).slice(3, 8)

        this._instance = instance;
        this._resolve = []
        this._reject = []
        this._progress = []
        this._finally = []
    }

    then(resolve, reject){
        if(this._resolve.push){
            this._resolve.push(resolve) 
        }else{
            resolve(this._resolve)
        }

        if(reject) this.catch(reject);
        return this;
    }
    catch(reject){
        if(this._reject.push){
            this._reject.push(reject) 
        }else{
            reject(this._reject)
        }
        return this;
    }
    progress(fn){
        this._progress.push(fn)
        return this;
    }
    finally(fn) {
        this._finally.push(fn)
        return this;  
    }
    _send(action, payload){
        adapter.sendPacket(this._instance, {
            jobId: this.id,
            action: action,
            payload: payload
        })
    }

    _handle(packet){
        var data = packet.data;
        let runFinallyCbs = false;

        if(packet.status === 'resolve'){
            if(this._resolve.length === 0) console.log(data);
            this._resolve.forEach(fn => {
                var ret = fn(data);
                if(ret && typeof ret.then == 'function'){
                    console.warn('TesseractJob instances do not chain like ES6 Promises. To convert it into a real promise, use Promise.resolve.')
                }
            })
            this._resolve = data;
            this._instance._dequeue()
            runFinallyCbs = true;
        }else if(packet.status === 'reject'){
            if(this._reject.length === 0) console.error(data);
            this._reject.forEach(fn => fn(data))
            this._reject = data;
            this._instance._dequeue()
            runFinallyCbs = true;
        }else if(packet.status === 'progress'){
            this._progress.forEach(fn => fn(data))
        }else{
            console.warn('Message type unknown', packet.status)
        }

        if (runFinallyCbs) {
            this._finally.forEach(fn => fn(data));
        }
    }
}

},{"../node/index.js":20}],23:[function(require,module,exports){
const adapter = require('./node/index.js')
const circularize = require('./common/circularize.js')
const TesseractJob = require('./common/job');
const objectAssign = require('object-assign');
const version = require('../package.json').version;

function create(workerOptions){
	workerOptions = workerOptions || {};
	var worker = new TesseractWorker(objectAssign({}, adapter.defaultOptions, workerOptions))
	worker.create = create;
	worker.version = version;
	return worker;
}

class TesseractWorker {
	constructor(workerOptions){
		this.worker = null;
		this.workerOptions = workerOptions;
		this._currentJob = null;
		this._queue = []
	}

	recognize(image, options){
		return this._delay(job => {
			if(typeof options === 'string'){
				options = { lang: options };
			}else{
				options = options || {}
				options.lang = options.lang || 'eng';	
			}
			
			job._send('recognize', { image: image, options: options, workerOptions: this.workerOptions })
		})
	}
	detect(image, options){
		options = options || {}
		return this._delay(job => {
			job._send('detect', { image: image, options: options, workerOptions: this.workerOptions })
		})
	}

	terminate(){ 
		if(this.worker) adapter.terminateWorker(this);
		this.worker = null;
	}

	_delay(fn){
		if(!this.worker) this.worker = adapter.spawnWorker(this, this.workerOptions);

		var job = new TesseractJob(this);
		this._queue.push(e => {
			this._queue.shift()
			this._currentJob = job;
			fn(job)
		})
		if(!this._currentJob) this._dequeue();
		return job
	}

	_dequeue(){
		this._currentJob = null;
		if(this._queue.length > 0){
			this._queue[0]()
		}
	}

	_recv(packet){

        if(packet.status === 'resolve' && packet.action === 'recognize'){
            packet.data = circularize(packet.data);
        }

		if(this._currentJob.id === packet.jobId){
			this._currentJob._handle(packet)
		}else{
			console.warn('Job ID ' + packet.jobId + ' not known.')
		}
	}
}

var DefaultTesseract = create()

module.exports = DefaultTesseract
},{"../package.json":19,"./common/circularize.js":21,"./common/job":22,"./node/index.js":20,"object-assign":18}],24:[function(require,module,exports){
//  Underscore.string
//  (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>
//  Underscore.string is freely distributable under the terms of the MIT license.
//  Documentation: https://github.com/epeli/underscore.string
//  Some code is borrowed from MooTools and Alexandru Marasteanu.
//  Version '2.3.2'

!function(root, String){
  'use strict';

  // Defining helper functions.

  var nativeTrim = String.prototype.trim;
  var nativeTrimRight = String.prototype.trimRight;
  var nativeTrimLeft = String.prototype.trimLeft;

  var parseNumber = function(source) { return source * 1 || 0; };

  var strRepeat = function(str, qty){
    if (qty < 1) return '';
    var result = '';
    while (qty > 0) {
      if (qty & 1) result += str;
      qty >>= 1, str += str;
    }
    return result;
  };

  var slice = [].slice;

  var defaultToWhiteSpace = function(characters) {
    if (characters == null)
      return '\\s';
    else if (characters.source)
      return characters.source;
    else
      return '[' + _s.escapeRegExp(characters) + ']';
  };

  // Helper for toBoolean
  function boolMatch(s, matchers) {
    var i, matcher, down = s.toLowerCase();
    matchers = [].concat(matchers);
    for (i = 0; i < matchers.length; i += 1) {
      matcher = matchers[i];
      if (!matcher) continue;
      if (matcher.test && matcher.test(s)) return true;
      if (matcher.toLowerCase() === down) return true;
    }
  }

  var escapeChars = {
    lt: '<',
    gt: '>',
    quot: '"',
    amp: '&',
    apos: "'"
  };

  var reversedEscapeChars = {};
  for(var key in escapeChars) reversedEscapeChars[escapeChars[key]] = key;
  reversedEscapeChars["'"] = '#39';

  // sprintf() for JavaScript 0.7-beta1
  // http://www.diveintojavascript.com/projects/javascript-sprintf
  //
  // Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
  // All rights reserved.

  var sprintf = (function() {
    function get_type(variable) {
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    var str_repeat = strRepeat;

    var str_format = function() {
      if (!str_format.cache.hasOwnProperty(arguments[0])) {
        str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
      }
      return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
    };

    str_format.format = function(parse_tree, argv) {
      var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
      for (i = 0; i < tree_length; i++) {
        node_type = get_type(parse_tree[i]);
        if (node_type === 'string') {
          output.push(parse_tree[i]);
        }
        else if (node_type === 'array') {
          match = parse_tree[i]; // convenience purposes only
          if (match[2]) { // keyword argument
            arg = argv[cursor];
            for (k = 0; k < match[2].length; k++) {
              if (!arg.hasOwnProperty(match[2][k])) {
                throw new Error(sprintf('[_.sprintf] property "%s" does not exist', match[2][k]));
              }
              arg = arg[match[2][k]];
            }
          } else if (match[1]) { // positional argument (explicit)
            arg = argv[match[1]];
          }
          else { // positional argument (implicit)
            arg = argv[cursor++];
          }

          if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
            throw new Error(sprintf('[_.sprintf] expecting number but found %s', get_type(arg)));
          }
          switch (match[8]) {
            case 'b': arg = arg.toString(2); break;
            case 'c': arg = String.fromCharCode(arg); break;
            case 'd': arg = parseInt(arg, 10); break;
            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
            case 'o': arg = arg.toString(8); break;
            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
            case 'u': arg = Math.abs(arg); break;
            case 'x': arg = arg.toString(16); break;
            case 'X': arg = arg.toString(16).toUpperCase(); break;
          }
          arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
          pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
          pad_length = match[6] - String(arg).length;
          pad = match[6] ? str_repeat(pad_character, pad_length) : '';
          output.push(match[5] ? arg + pad : pad + arg);
        }
      }
      return output.join('');
    };

    str_format.cache = {};

    str_format.parse = function(fmt) {
      var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
      while (_fmt) {
        if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
          parse_tree.push(match[0]);
        }
        else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
          parse_tree.push('%');
        }
        else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
          if (match[2]) {
            arg_names |= 1;
            var field_list = [], replacement_field = match[2], field_match = [];
            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
              field_list.push(field_match[1]);
              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else {
                  throw new Error('[_.sprintf] huh?');
                }
              }
            }
            else {
              throw new Error('[_.sprintf] huh?');
            }
            match[2] = field_list;
          }
          else {
            arg_names |= 2;
          }
          if (arg_names === 3) {
            throw new Error('[_.sprintf] mixing positional and named placeholders is not (yet) supported');
          }
          parse_tree.push(match);
        }
        else {
          throw new Error('[_.sprintf] huh?');
        }
        _fmt = _fmt.substring(match[0].length);
      }
      return parse_tree;
    };

    return str_format;
  })();



  // Defining underscore.string

  var _s = {

    VERSION: '2.3.0',

    isBlank: function(str){
      if (str == null) str = '';
      return (/^\s*$/).test(str);
    },

    stripTags: function(str){
      if (str == null) return '';
      return String(str).replace(/<\/?[^>]+>/g, '');
    },

    capitalize : function(str){
      str = str == null ? '' : String(str);
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    chop: function(str, step){
      if (str == null) return [];
      str = String(str);
      step = ~~step;
      return step > 0 ? str.match(new RegExp('.{1,' + step + '}', 'g')) : [str];
    },

    clean: function(str){
      return _s.strip(str).replace(/\s+/g, ' ');
    },

    count: function(str, substr){
      if (str == null || substr == null) return 0;

      str = String(str);
      substr = String(substr);

      var count = 0,
        pos = 0,
        length = substr.length;

      while (true) {
        pos = str.indexOf(substr, pos);
        if (pos === -1) break;
        count++;
        pos += length;
      }

      return count;
    },

    chars: function(str) {
      if (str == null) return [];
      return String(str).split('');
    },

    swapCase: function(str) {
      if (str == null) return '';
      return String(str).replace(/\S/g, function(c){
        return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
      });
    },

    escapeHTML: function(str) {
      if (str == null) return '';
      return String(str).replace(/[&<>"']/g, function(m){ return '&' + reversedEscapeChars[m] + ';'; });
    },

    unescapeHTML: function(str) {
      if (str == null) return '';
      return String(str).replace(/\&([^;]+);/g, function(entity, entityCode){
        var match;

        if (entityCode in escapeChars) {
          return escapeChars[entityCode];
        } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
          return String.fromCharCode(parseInt(match[1], 16));
        } else if (match = entityCode.match(/^#(\d+)$/)) {
          return String.fromCharCode(~~match[1]);
        } else {
          return entity;
        }
      });
    },

    escapeRegExp: function(str){
      if (str == null) return '';
      return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
    },

    splice: function(str, i, howmany, substr){
      var arr = _s.chars(str);
      arr.splice(~~i, ~~howmany, substr);
      return arr.join('');
    },

    insert: function(str, i, substr){
      return _s.splice(str, i, 0, substr);
    },

    include: function(str, needle){
      if (needle === '') return true;
      if (str == null) return false;
      return String(str).indexOf(needle) !== -1;
    },

    join: function() {
      var args = slice.call(arguments),
        separator = args.shift();

      if (separator == null) separator = '';

      return args.join(separator);
    },

    lines: function(str) {
      if (str == null) return [];
      return String(str).split("\n");
    },

    reverse: function(str){
      return _s.chars(str).reverse().join('');
    },

    startsWith: function(str, starts){
      if (starts === '') return true;
      if (str == null || starts == null) return false;
      str = String(str); starts = String(starts);
      return str.length >= starts.length && str.slice(0, starts.length) === starts;
    },

    endsWith: function(str, ends){
      if (ends === '') return true;
      if (str == null || ends == null) return false;
      str = String(str); ends = String(ends);
      return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
    },

    succ: function(str){
      if (str == null) return '';
      str = String(str);
      return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length-1) + 1);
    },

    titleize: function(str){
      if (str == null) return '';
      str  = String(str).toLowerCase();
      return str.replace(/(?:^|\s|-)\S/g, function(c){ return c.toUpperCase(); });
    },

    camelize: function(str){
      return _s.trim(str).replace(/[-_\s]+(.)?/g, function(match, c){ return c ? c.toUpperCase() : ""; });
    },

    underscored: function(str){
      return _s.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
    },

    dasherize: function(str){
      return _s.trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
    },

    classify: function(str){
      return _s.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
    },

    humanize: function(str){
      return _s.capitalize(_s.underscored(str).replace(/_id$/,'').replace(/_/g, ' '));
    },

    trim: function(str, characters){
      if (str == null) return '';
      if (!characters && nativeTrim) return nativeTrim.call(str);
      characters = defaultToWhiteSpace(characters);
      return String(str).replace(new RegExp('\^' + characters + '+|' + characters + '+$', 'g'), '');
    },

    ltrim: function(str, characters){
      if (str == null) return '';
      if (!characters && nativeTrimLeft) return nativeTrimLeft.call(str);
      characters = defaultToWhiteSpace(characters);
      return String(str).replace(new RegExp('^' + characters + '+'), '');
    },

    rtrim: function(str, characters){
      if (str == null) return '';
      if (!characters && nativeTrimRight) return nativeTrimRight.call(str);
      characters = defaultToWhiteSpace(characters);
      return String(str).replace(new RegExp(characters + '+$'), '');
    },

    truncate: function(str, length, truncateStr){
      if (str == null) return '';
      str = String(str); truncateStr = truncateStr || '...';
      length = ~~length;
      return str.length > length ? str.slice(0, length) + truncateStr : str;
    },

    /**
     * _s.prune: a more elegant version of truncate
     * prune extra chars, never leaving a half-chopped word.
     * @author github.com/rwz
     */
    prune: function(str, length, pruneStr){
      if (str == null) return '';

      str = String(str); length = ~~length;
      pruneStr = pruneStr != null ? String(pruneStr) : '...';

      if (str.length <= length) return str;

      var tmpl = function(c){ return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' '; },
        template = str.slice(0, length+1).replace(/.(?=\W*\w*$)/g, tmpl); // 'Hello, world' -> 'HellAA AAAAA'

      if (template.slice(template.length-2).match(/\w\w/))
        template = template.replace(/\s*\S+$/, '');
      else
        template = _s.rtrim(template.slice(0, template.length-1));

      return (template+pruneStr).length > str.length ? str : str.slice(0, template.length)+pruneStr;
    },

    words: function(str, delimiter) {
      if (_s.isBlank(str)) return [];
      return _s.trim(str, delimiter).split(delimiter || /\s+/);
    },

    pad: function(str, length, padStr, type) {
      str = str == null ? '' : String(str);
      length = ~~length;

      var padlen  = 0;

      if (!padStr)
        padStr = ' ';
      else if (padStr.length > 1)
        padStr = padStr.charAt(0);

      switch(type) {
        case 'right':
          padlen = length - str.length;
          return str + strRepeat(padStr, padlen);
        case 'both':
          padlen = length - str.length;
          return strRepeat(padStr, Math.ceil(padlen/2)) + str
                  + strRepeat(padStr, Math.floor(padlen/2));
        default: // 'left'
          padlen = length - str.length;
          return strRepeat(padStr, padlen) + str;
        }
    },

    lpad: function(str, length, padStr) {
      return _s.pad(str, length, padStr);
    },

    rpad: function(str, length, padStr) {
      return _s.pad(str, length, padStr, 'right');
    },

    lrpad: function(str, length, padStr) {
      return _s.pad(str, length, padStr, 'both');
    },

    sprintf: sprintf,

    vsprintf: function(fmt, argv){
      argv.unshift(fmt);
      return sprintf.apply(null, argv);
    },

    toNumber: function(str, decimals) {
      if (!str) return 0;
      str = _s.trim(str);
      if (!str.match(/^-?\d+(?:\.\d+)?$/)) return NaN;
      return parseNumber(parseNumber(str).toFixed(~~decimals));
    },

    numberFormat : function(number, dec, dsep, tsep) {
      if (isNaN(number) || number == null) return '';

      number = number.toFixed(~~dec);
      tsep = typeof tsep == 'string' ? tsep : ',';

      var parts = number.split('.'), fnums = parts[0],
        decimals = parts[1] ? (dsep || '.') + parts[1] : '';

      return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
    },

    strRight: function(str, sep){
      if (str == null) return '';
      str = String(str); sep = sep != null ? String(sep) : sep;
      var pos = !sep ? -1 : str.indexOf(sep);
      return ~pos ? str.slice(pos+sep.length, str.length) : str;
    },

    strRightBack: function(str, sep){
      if (str == null) return '';
      str = String(str); sep = sep != null ? String(sep) : sep;
      var pos = !sep ? -1 : str.lastIndexOf(sep);
      return ~pos ? str.slice(pos+sep.length, str.length) : str;
    },

    strLeft: function(str, sep){
      if (str == null) return '';
      str = String(str); sep = sep != null ? String(sep) : sep;
      var pos = !sep ? -1 : str.indexOf(sep);
      return ~pos ? str.slice(0, pos) : str;
    },

    strLeftBack: function(str, sep){
      if (str == null) return '';
      str += ''; sep = sep != null ? ''+sep : sep;
      var pos = str.lastIndexOf(sep);
      return ~pos ? str.slice(0, pos) : str;
    },

    toSentence: function(array, separator, lastSeparator, serial) {
      separator = separator || ', ';
      lastSeparator = lastSeparator || ' and ';
      var a = array.slice(), lastMember = a.pop();

      if (array.length > 2 && serial) lastSeparator = _s.rtrim(separator) + lastSeparator;

      return a.length ? a.join(separator) + lastSeparator + lastMember : lastMember;
    },

    toSentenceSerial: function() {
      var args = slice.call(arguments);
      args[3] = true;
      return _s.toSentence.apply(_s, args);
    },

    slugify: function(str) {
      if (str == null) return '';

      var from  = "─à├á├í├ñ├ó├ú├Ñ├ª─â─ç─Ö├¿├⌐├½├¬├¼├¡├»├«┼é┼ä├▓├│├╢├┤├╡├╕┼¢╚Ö╚¢├╣├║├╝├╗├▒├º┼╝┼║",
          to    = "aaaaaaaaaceeeeeiiiilnoooooosstuuuunczz",
          regex = new RegExp(defaultToWhiteSpace(from), 'g');

      str = String(str).toLowerCase().replace(regex, function(c){
        var index = from.indexOf(c);
        return to.charAt(index) || '-';
      });

      return _s.dasherize(str.replace(/[^\w\s-]/g, ''));
    },

    surround: function(str, wrapper) {
      return [wrapper, str, wrapper].join('');
    },

    quote: function(str, quoteChar) {
      return _s.surround(str, quoteChar || '"');
    },

    unquote: function(str, quoteChar) {
      quoteChar = quoteChar || '"';
      if (str[0] === quoteChar && str[str.length-1] === quoteChar)
        return str.slice(1,str.length-1);
      else return str;
    },

    exports: function() {
      var result = {};

      for (var prop in this) {
        if (!this.hasOwnProperty(prop) || prop.match(/^(?:include|contains|reverse)$/)) continue;
        result[prop] = this[prop];
      }

      return result;
    },

    repeat: function(str, qty, separator){
      if (str == null) return '';

      qty = ~~qty;

      // using faster implementation if separator is not needed;
      if (separator == null) return strRepeat(String(str), qty);

      // this one is about 300x slower in Google Chrome
      for (var repeat = []; qty > 0; repeat[--qty] = str) {}
      return repeat.join(separator);
    },

    naturalCmp: function(str1, str2){
      if (str1 == str2) return 0;
      if (!str1) return -1;
      if (!str2) return 1;

      var cmpRegex = /(\.\d+)|(\d+)|(\D+)/g,
        tokens1 = String(str1).toLowerCase().match(cmpRegex),
        tokens2 = String(str2).toLowerCase().match(cmpRegex),
        count = Math.min(tokens1.length, tokens2.length);

      for(var i = 0; i < count; i++) {
        var a = tokens1[i], b = tokens2[i];

        if (a !== b){
          var num1 = parseInt(a, 10);
          if (!isNaN(num1)){
            var num2 = parseInt(b, 10);
            if (!isNaN(num2) && num1 - num2)
              return num1 - num2;
          }
          return a < b ? -1 : 1;
        }
      }

      if (tokens1.length === tokens2.length)
        return tokens1.length - tokens2.length;

      return str1 < str2 ? -1 : 1;
    },

    levenshtein: function(str1, str2) {
      if (str1 == null && str2 == null) return 0;
      if (str1 == null) return String(str2).length;
      if (str2 == null) return String(str1).length;

      str1 = String(str1); str2 = String(str2);

      var current = [], prev, value;

      for (var i = 0; i <= str2.length; i++)
        for (var j = 0; j <= str1.length; j++) {
          if (i && j)
            if (str1.charAt(j - 1) === str2.charAt(i - 1))
              value = prev;
            else
              value = Math.min(current[j], current[j - 1], prev) + 1;
          else
            value = i + j;

          prev = current[j];
          current[j] = value;
        }

      return current.pop();
    },

    toBoolean: function(str, trueValues, falseValues) {
      if (typeof str === "number") str = "" + str;
      if (typeof str !== "string") return !!str;
      str = _s.trim(str);
      if (boolMatch(str, trueValues || ["true", "1"])) return true;
      if (boolMatch(str, falseValues || ["false", "0"])) return false;
    }
  };

  // Aliases

  _s.strip    = _s.trim;
  _s.lstrip   = _s.ltrim;
  _s.rstrip   = _s.rtrim;
  _s.center   = _s.lrpad;
  _s.rjust    = _s.lpad;
  _s.ljust    = _s.rpad;
  _s.contains = _s.include;
  _s.q        = _s.quote;
  _s.toBool   = _s.toBoolean;

  // Exporting

  // CommonJS module is defined
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      module.exports = _s;

    exports._s = _s;
  }

  // Register as a named module with AMD.
  if (typeof define === 'function' && define.amd)
    define('underscore.string', [], function(){ return _s; });


  // Integrate with Underscore.js if defined
  // or create our own underscore object.
  root._ = root._ || {};
  root._.string = root._.str = _s;
}(this, String);

},{}],25:[function(require,module,exports){
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result ΓÇö either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/FisherΓÇôYates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}]},{},[2]);
