
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
var phoneInfo;
app.get('/info/:info', function (request, response) {
	phoneInfo  = request.params.info;
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




/////  CHECK CALENDAR EVENTS  /////
var newresults;
app.get('/calendar', function (req, res) {
  res.send('Calendar response');
  getNextEventChoreo.execute(
	    getNextEventInputs,
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


/////  PARSE CALENDAR & COMPARE  /////
function calendarResults(results) {
	obj = JSON.parse(results); 
	console.log(obj['start']);
	// for (var i=0;i<obj['items'].length;i++) {
	// 	// console.log(obj['items'][i]['start']);
	// 	console.log('hi');
	// }

	var startTime = Date.parse(obj.start.dateTime);
	console.log(startTime);
	//var date2 = Date.parse(obj.items[1].start.dateTime);
	// console.log(date1 < date2);
	// console.log(date1);	
}

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
	args: '7'
}

// function trainScraper(train) {
// 	var scraper = new PythonShell('scrape.py', options);
// 		scraper.on('message', function(message){
// 			var status = JSON.stringify(message['title']);
// 			console.log(status);
// 	  	});	
// }


function trainScraper(train, callback) {
	var scraper = new PythonShell('scrape.py', options);
		scraper.on('message', function(message){
			var status = JSON.stringify(message['title']);
			// console.log(status);
			callback(status);
	  	});	
}


function delayCheck(lat,lon,train) 
	trainScraper(train,function(status){
		console.log("status: " + status);
	})
	weathertest(lat,lon,function(probability){
		console.log("probability: " + probability);
 	});
}


// var j = schedule.scheduleJob('* * * * *', function(){
//     delayCheck(40.7127,-74.0059,7);
// });



app.get('/train', function (req, res) {
	res.send('checking for delays response');
	delayCheck(40.7127,-74.0059,7);
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



