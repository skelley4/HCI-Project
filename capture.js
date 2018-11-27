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
  var fs = require('fs');
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