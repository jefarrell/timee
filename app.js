
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
	incoming  = request.params.info;
	//send a response to the client:
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write("You sent me: " + incoming);
	response.end();
	console.log(incoming);
});

app.get('/phoneInfo', function (req, res) {
	 if (!incoming) {
	 	phoneInfo = "no info";
	 } else {
	 	phoneInfo = incoming
	 }
	 res.send(phoneInfo);
	 console.log("info: " + phoneInfo)
	 // parse the phone info here? 
	 app.set('phoneInfo', phoneInfo);
});




/////  CHECK CALENDAR EVENTS  /////
/////  NEEDS A TRY TO SEE IF THERE IS A NEXT EVENT  /////
//var newresults;
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

	    	
	    },
	    function(error){
	    	console.log(error.type);
	    	console.log(error.message);
	    }
	);
});


// /////  PARSE CALENDAR  /////  maybe not needed
// function calendarResults(results, callback) {
// 	obj = JSON.parse(results); 
// 	console.log(obj['start']);
// 	var startTime = Date.parse(obj.start.dateTime);
// 	callback(startTime);
// }



/////  CHECK THE WEATHER  /////
var forecast = new Forecast({
	service:'forecast.io',
	key: 'yourkey',
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



/////  CHECK THE MTA  /////
var train;
var options = {
	mode : 'json',
	// args : [train]
	args: '1'
}

// function trainScraper(train) {
// 	var scraper = new PythonShell('scrape.py', options);
// 		scraper.on('message', function(message){
// 			//var status = JSON.stringify(message['title']);
// 			var status = JSON.stringify(message);
// 			console.log(status);
// 	  	});	
// }


function trainScraper(callback) {
	var scraper = new PythonShell('scrape.py', options);
		scraper.on('message', function(message){
			var status = JSON.stringify(message['title']);
			console.log(JSON.stringify(message));
			callback(status);
	  	});	
}


function delayCheck(lat,lon) {
	trainScraper(function(status){
		if (status[0] != "Current Status: Good Status") {
			console.log("delay dude: " + status);
		} else {
			console.log("no delay dude")
		}
	})

	weathertest(lat,lon,function(probability){
		console.log("probability: " + probability);
		if (probability > 0.75) {
			console.log("weather delay");
		} else {
			console.log("no weather delay");
		}
 	});
}



/////  CRON SCHEDULE TO RUN TEST  /////
/////  Actually needs to happen on Arduino  /////
// var j = schedule.scheduleJob('1 1 * * *', function(){
//     delayCheck(40.7127,-74.0059,7);
// });



app.get('/delays', function (req, res) {
	res.send('checking for delays response');
	delayCheck(40.7127,-74.0059);
});








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



