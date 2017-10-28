var express = require("express");
var bodyParser = require("body-parser");
var twilio = require('twilio');
var keys = require("./keys");
const MongoClient = require('mongodb').MongoClient
const MessagingResponse = require('twilio').twiml.MessagingResponse;
var app = express();

app.use(bodyParser.urlencoded({extended:false}));

// Twilio Credentials
var accountSid = keys['accountSid'];
var authToken = keys['authToken'];

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

app.set('port', process.env.PORT || 8080);

//TEST FUNCTIONS
function sayHello(){
  console.log("hello");
}

function sendErrorMessage(){
    return "Sorry, we don\'t recognize that command. Send \"HELP\" to view default commands";
};

function parseMessage(a){
   var  message = a.split(" ");
   var keyCommand = message[0].toLowerCase();



   switch(keyCommand) {
    case "help":
        console.log(a);
        break;
    case "lists":
        console.log(a);
        break;
    case "show":
        console.log(a);
        break;
    case "select":
        console.log(a);
        break;
    case "add":
        console.log(a);
        break;
    case "remove":
        console.log(a);
        break;
    case "complete":
        console.log(a);
        break;
    default:
      return sendErrorMessage();
  };
};



//TEST FUNCTIONS
function sendText(){
  client.messages.create({
      body: 'Greetings! The current time is: 20:03 MST IPV5EL1VGWFMLDS',
      to: '+5598167525',  // Text this number
      from: '+13852904244' // From a valid Twilio number

  });
}


//INDEX ROUTE
app.get('/', function(req, res){
        res.send('hello world');
        sayHello();
        sendText();
        sayHello();
});


//RECIEVE MESSAGE
app.post('/message', (req, res) => {

  // Start our TwiML response.
  const twiml = new MessagingResponse();

   var msgBody = req.body.Body;

  // Add a text message.
  const msg = twiml.message(parseMessage(msgBody));//

  // Add a picture message.
//  msg.media('https://www.softpaws.com/template/images/landing_page/july_cat_image.jpg');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});




var db;

MongoClient.connect('mongodb://dbuser:rG4y8br#k^F25W7gFfnXcKaUYZhsR@ds237855.mlab.com:37855/taskivedb', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(app.get('port'), function(){
    console.log("app is running on: " + app.get('port'))
  })
});

