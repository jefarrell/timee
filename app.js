
var express = require('express');
var app = express();
var PythonShell = require('python-shell');
var status = {}
var Forecast = require('forecast')
/////  MTA arguments  /////
var train;



var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at http://%s:%s', host, port);
});


var newresults;
app.get('/calendar', function (req, res) {
  res.send('Calendar response');
  getAllEventsChoreo.execute(
	    getAllEventsInputs,
	    function(results){
	    	newresults = results.get_Response();
	    	calendarResults(newresults);
	    },
	    function(error){
	    	console.log(error.type);
	    	console.log(error.message);
	    }
	);

});

function calendarResults(results) {
	obj = JSON.parse(results); 

	// for (var i=0;i<obj['items'].length;i++) {
	// 	// console.log(obj['items'][i]['start']);
	// 	console.log('hi');
	// }

	var date1 = Date.parse(obj.items[0].start.dateTime);
	var date2 = Date.parse(obj.items[1].start.dateTime);
	console.log(date1 < date2);
	console.log(date1);
	
}

////  wrap up in node scheduler for delay wakeup check  ////
var forecast = new Forecast({
	service:'forecast.io',
	key: 'c1d4dde993f68cd4ecbee63ab39f699a',
	units: 'farenheit',
	cache:false
});

function weathertest(lat,lon) {
	forecast.get([lat,lon], function(err, weather){
		if(err) return console.dir(err);
		console.log(weather);
	});
}

var options = {
	mode : 'json',
	args : [train]
}

function trainScraper() {
	var scraper = new PythonShell('scrape.py', options);
		scraper.on('message', function(message){
			console.log(message);
	  	});
}


function delayCheck(lat,lon,train) {
	var scraper = new PythonShell('scrape.py', options);
	scraper.on('message', function(traindata){
		console.log(traindata);
  	});
}

//////////////////////////


app.get('/train', function (req, res) {
	res.send('checking for delays response');
	// getWeatherData(40.7127,74.0059);
	weathertest(40.7127,-74.0059);
	// should run wakeup check here with results
});


var phoneInfo;

app.get('/info/:info', function (request, response) {
	phoneInfo  = request.params.name;
	//send a response to the client:
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write("You sent me: " + phoneInfo);
	response.end();
	console.log(phoneInfo);
});

app.get('/phoneInfo', function (req, res) {
	 var placeholder
	 if (!phoneInfo) {
	 	placeholder = "no info";
	 } else {
	 	placeholder = phoneInfo
	 }
	 res.send(placeholder);
	 console.log("info: " + placeholder)
});




/////  Google Calendar Integration  /////

//Initialize Temboo session
var tsession = require("temboo/core/temboosession");
var session = new tsession.TembooSession("yourname", "yourapp", "yourid");

var Google = require("temboo/Library/Google/Calendar");

var getAllEventsChoreo = new Google.GetAllEvents(session);

// Instantiate and populate the input set for the choreo
var getAllEventsInputs = getAllEventsChoreo.newInputSet();

// Set inputs
getAllEventsInputs.set_ClientSecret("yoursecret");
getAllEventsInputs.set_CalendarID("yourcalendarid");
getAllEventsInputs.set_RefreshToken("yourrefreshtoken");
getAllEventsInputs.set_ClientID("yourclientid");

/////  End Calendar  //////



