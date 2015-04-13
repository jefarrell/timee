
var express = require('express');
var app = express();
var PythonShell = require('python-shell');
var status = {}

/////  MTA arguments  /////
var options = {
	mode : 'json',
	args : ['7']
}


var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at http://%s:%s', host, port);

});


app.get('/calendar', function (req, res) {
  res.send('Calendar response');
  getAllEventsChoreo.execute(
	    getAllEventsInputs,
	    function(results){console.log(results.get_Response());},
	    function(error){console.log(error.type); console.log(error.message);}
	);
});

app.get('/train', function (req, res) {
	res.send('train response');
	var scraper = new PythonShell('scrape.py', options);
	scraper.on('message', function(message){
		console.log(message);
  	})
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



