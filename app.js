
var express = require('express');
var Forecast = require('forecast')
var PythonShell = require('python-shell');
var app = express();


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at http://%s:%s', host, port);
});


/////  INFO FROM CLOCK  /////
var temp;
var clockInfo;
app.get('/clockInfo/:clockInfo', function (req, res) {
	temp  = req.params.info;
	//send a response to the client:
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("You're sending: " + temp);
	res.end();
	console.log(temp);
});

app.get('/fromClock', function (req, res) {
	 if (!incoming) {
	 	clockInfo = "no info";
	 } else {
	 	clockInfo = temp
	 }
	 res.send(clockInfo);
	 console.log("info from clock: " + clockInfo);
	 app.set('clockInfo', clockInfo);
});





/////  INFO FROM PHONE  /////
var incoming;
var phoneInfo;
app.get('/info/:test/', function (req, res) {
	incoming  = req.params.test;
	console.log("req: " + req.params.test);
	//send a response to the client:
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("You're sending: " + incoming);
	res.end();
	
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
	 	var splitter = phoneInfo.split(";");
	 	console.log("split: " + splitter);
	 	app.set('phoneInfo', phoneInfo);





	 // phoneTest = '15:00;40;7';
	 // var splitter = phoneTest.split(";")
	 // app.set('phoneInfo', splitter[2]);
	 // console.log(splitter[1]);
	 	
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

	    // Get the next calendar event time, split it down to the hour
  			var tempTime = obj.start.dateTime.split('T')[1];
  			var calTime = tempTime.split('-')[0].split(':')[0]-1;
  			console.log("next calendar time : " + calTime);

  		/////  test parsing pseudocode  /////
	    	var phonePlaceholder = req.app.get('phoneInfo');
	    	var placeholder2 = JSON.stringify(phonePlaceholder);
	    	var fromPhone = placeholder2.split(',');
	    	console.log("from phone: " + fromPhone);
	    	
	    	var phoneAlarm = fromPhone[0];
	    	var extraTime = fromPhone[1];
	    	var lat = fromPhone[2];
	    	var lon = fromPhone[3];
	    	var trainLine = fromPhone[4][0];
	    	console.log("loc:" + lat + ", " + lon);
	    	console.log("train: " + trainLine);
	    	app.set('trainName', trainLine);
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
var tester = app.get('phoneInfo');





/////  MTA WEBSCRAPER  /////
function trainScraper(callback) {
	var placeholder = app.get('phoneInfo');
	var userTrain = placeholder.split(",")[4];
	console.log("trainscraper train: " + userTrain);
	var options = {
	mode : 'json',
	args: userTrain
}

	var scraper = new PythonShell('scrape.py', options);
		scraper.on('message', function(message){
			var status = message;
			//var status = JSON.stringify(message);
			//var status = JSON.stringify(message['title']);
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
		console.log("status title: " + message);
		var match = "Current Status: Good Service";
		if (message.toLowerCase() == match.toLowerCase()) {
		// if (status === match) {
			console.log("no train delay");
			delays[0] = 0;

		} else {

			var delayMessage = status['title']
			console.log("train delay: " + delayMessage);
		}
	})

	weathertest(lat,lon,function(probability){
		if (probability > 0.75) {
			delays[1] = 1;
			console.log("weather delay");
		} else { 
			delays[1] = 0;
			console.log("no weather delay");
		}
 	});
}






app.get('/delay',function (req, res) {
	// Need to update with info from phone
	var hold = req.app.get('phoneInfo')
	holdParse = hold.split(",");
	var lat = holdParse[2];
	var lon = holdParse[3];

	//delayCheck(40.7127,-74.0059);
	delayCheck(lat,lon);
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
	console.log("delays: " + delays);
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



