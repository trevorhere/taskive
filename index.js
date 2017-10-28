var express = require("express");
var bodyParser = require("body-parser");
var ngrok = require('ngrok');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

ngrok.connect(function (err, url) {});
//var request = require("request");
//var http = require('http');
var twilio = require('twilio');
//var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({extended:false}));

// Twilio Credentials
var accountSid = 'AC32dff523f958932d42897186ce22f286';
var authToken = '6ea5683c97d8f7b38d9d1ec2770c1143';

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

app.set('port', process.env.PORT || 8080);



function sayHello(){
  console.log("hello");
}

function sendText(){
  client.messages.create({
      body: 'Greetings! The current time is: 20:03 MST IPV5EL1VGWFMLDS',
      to: '+5598167525',  // Text this number
      from: '+13852904244' // From a valid Twilio number

  });
}

//
// app.post('/message', function(req,res){
//   console.log(req.body);
//   var msgFrom = req.body.From;
//    var msgBody = req.body.Body;
//
//    sayHello();
//
//    res.send(`
//      <Response>
//       </Message>
//           Hello ${msgFrom}. You said: ${msgBody}
//       </Message>
//      </Response>
//      `);
// });

app.get('/', function(req, res){
        res.send('hello world');
        sayHello();
        sendText();
        sayHello();

});


app.post('/message', (req, res) => {

  // Start our TwiML response.
  const twiml = new MessagingResponse();

   var msgBody = req.body.Body;
   console.log(msgBody);
  // Add a text message.
  const msg = twiml.message('What is up dude?');//
// app.post('/message', function(req,res){
//   console.log(req.body);
//   var msgFrom = req.body.From;
//    var msgBody = req.body.Body;
//
//    sayHello();
//
//    res.send(`
//      <Response>
//       </Message>
//           Hello ${msgFrom}. You said: ${msgBody}
//       </Message>
//      </Response>
//      `);
// });

  // Add a picture message.
  msg.media('https://www.softpaws.com/template/images/landing_page/july_cat_image.jpg');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

    // client.messages.create({
    //     body: 'Greetings! The current time is: 20:03 MST IPV5EL1VGWFMLDS',
    //     to: '+15598167525',  // Text this number
    //     from: '+13852904244' // From a valid Twilio number
    //
    // });

    app.listen(app.get('port'), function(){
      console.log("app is running on: " + app.get('port'))
    });
