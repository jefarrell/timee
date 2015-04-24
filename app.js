
var express = require('express');
var Forecast = require('forecast')
var PythonShell = require('python-shell');
var schedule = require('node-schedule');
var app = express();


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at http://%s:%s', host, port);
});


/////  INFO FROM PHONE  /////
var incoming;
var phoneInfo;
app.get('/info/:info', function (req, res) {
	incoming  = req.params.info;
	//send a response to the client:
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("You sent me: " + incoming);
	res.end();
	console.log(incoming);
});

app.get('/phoneInfo', function (req, res) {
	 if (!incoming) {
	 	phoneInfo = "no info";
	 } else {
	 	phoneInfo = incoming
	 }
	 res.send(phoneInfo);
	 console.log("info: " + phoneInfo);
	 // parse the phone info here? 
	 var split = phoneInfo.split(";");
	 console.log("split: " + split);
	 app.set('phoneInfo', phoneInfo);
});




/////  CHECK CALENDAR EVENTS  /////
/////  NEEDS A TRY TO SEE IF THERE IS A NEXT EVENT  /////
app.get('/calendar', function (req, res) {
  res.send('Calendar response');
  getNextEventChoreo.execute(
	    getNextEventInputs,
	    function(results){
	    	var newresults = results.get_Response();
	    	obj = JSON.parse(newresults);
	    	var calTime = Date.parse(obj.start.dateTime);
	    	console.log("calendar Time is: " + calTime)

	    	var phoneTimes = req.app.get('phoneInfo');
	    	console.log("testing: " + phoneTimes);

	    	// Compare and send the times here;
	    	// should I parse the phone info here?

	    	//app.set earliest time 
	    },
	    function(error){
	    	console.log(error.type);
	    	console.log(error.message);
	    }
	);
});





/////  CHECK THE WEATHER  /////
var forecast = new Forecast({
	service:'forecast.io',
	key: 'YOURKEY',
	units: 'farenheit',
	cache:false
});

function weathertest(lat,lon, callback) {
	forecast.get([lat,lon], function(err, weather){
		if(err) return console.dir(err);
		var probability = (weather['currently']['precipProbability']);
		callback(probability);
	});
}


// Need to update with info from phone
/////  CHECK THE MTA  /////
var train;
var options = {
	mode : 'json',
	// args : [train]
	args: 'D'
}



/////  MTA WEBSCRAPER  /////
function trainScraper(callback) {
	var scraper = new PythonShell('scrape.py', options);
		scraper.on('message', function(message){
			var status = message;
			//var status = JSON.stringify(message);
			// var status = JSON.stringify(message['title']);
			//console.log(JSON.stringify(message));
			callback(status);
	  	});	
}

/////  CHECK WEATHER AND TRAIN FOR DELAYS  //////
var delays = [];
function delayCheck(lat,lon) {
	// delays = [null,null]
	trainScraper(function(status){
		var message = status['title'];
		console.log(message);
		var match = '"Current Status: Good Service"';
		if (message.toLowerCase() === match.toLowerCase()) {
		// if (status === match) {
			//console.log("no delay");
			delays[0] = 0;

		} else {

			delays[0] = status;
			//console.log("delay: " + status);
		}
	})

	weathertest(lat,lon,function(probability){
		//console.log("probability: " + probability);
		if (probability > 0.75) {
			delays[1] = 1;
			//console.log("weather delay");
		
		} else { 

			delays[1] = 0;
			//console.log("no weather delay");
		}
 	});
}






app.get('/delay',function (req, res) {
	// Need to update with info from phone
	delayCheck(40.7127,-74.0059);
	res.end();
});


/////  ROUTE FOR ARDUINO YUN  /////
app.get('/arduinoCheck', function (req, res) {
	res.send('request from arduino');
	//delayCheck(40.7127,-74.0059);
	// delayCheck(40.7127,-74.0059,function(delays){
	// 	console.log("delays test: " + delays);
	// });
	if (delays[0] =! 0) {
		delays[0] = 1;
		
	}
	
});

/////  ROUTE FOR PHONE APP  /////
app.get('/phoneCheck', function (req,res){
	res.send('request from phone');
	// delayCheck(40.7127,-74.0059);
	console.log(delays);
})






/////  Google Calendar Integration  /////

//Initialize Temboo session
var tsession = require("temboo/core/temboosession");
var session = new tsession.TembooSession("yourname", "yourapp", "yourid");

var Google = require("temboo/Library/Google/Calendar");



 var getNextEventChoreo = new Google.GetNextEvent(session);

// // Instantiate and populate the input set for the choreo
 var getNextEventInputs = getNextEventChoreo.newInputSet();

// // Set credential to use for execution
getNextEventInputs.setCredential("GoogleCalendarAccount");


// Set inputs
getNextEventInputs.set_ClientSecret("yoursecret");
getNextEventInputs.set_CalendarID("yourcalendarid");
getNextEventInputs.set_RefreshToken("yourrefreshtoken");
getNextEventInputs.set_ClientID("yourclientid");

/////  End Calendar  //////



