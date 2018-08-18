const express = require('express');
const path = require('path');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const Parser = require('./Parser');
const dotenv = require('dotenv');

dotenv.load();

const app = express();
const port = process.env.PORT || 5000;

let SID =  process.env.TWILIO_SID;
let TOKEN = process.env.TWILIO_TOKEN;
let SENDER =   process.env.TWILIO_SENDER;
let client = require('twilio')(SID, TOKEN)

app.use(bodyParser.urlencoded({ extended: false }));



// Where SMS are recieved. 
// From here, parse body, run command in body, return result
app.post('/sms', (req, res) => {
  console.log("/sms hit")
  const twiml = new MessagingResponse();
  let body = req.body.Body;
  let from = req.body.From;
  let message = Parser.Parser(body, from);

  if(message != null){
  console.log("message: " + message);
  twiml.message(message);
 
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
  console.log(body);
  } else {
    console.log('null recieved')
  }
  
});

app.get('/api/test', (req, res) => {
  console.log("/api/test hit")
  const twiml = new MessagingResponse();
  
  let message = Parser.Parser(req, res, "working");
  if(message != null)
  {
  twiml.message(message);
 
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
  } else {
    console.log('null recieved')
  }
});


// API calls
app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.use(bodyParser.json())



app.get('/api/cat-facts', (req,res) => {
  fetch('https://cat-fact.herokuapp.com/facts')
  .then(resp => resp.json())
  .then(resp => {
    console.log("catfacts: " + resp)
})
})

app.post('/api/send', (req, res) => {

  if(!SID || !TOKEN) {
    return res.json({message: 'add TWILIO_SID and TWILIO_TOKEN to .env file.'})
  }




  let client = require('twilio')(SID, TOKEN)

  // client.messages
  //       .create({
  //        to: req.body.recipient,
  //        from: SENDER,
  //        body: 'word to your mother.'
  // }, (err, responseData) => {
  //   if (!err) {
  //     res.json({
  //       From: responseData.from, 
  //       Body: responseData.body
  //     })
  //   }
  // })

  client.messages
      .create({
         body: req.body.text,
         from: SENDER,
         mediaUrl: 'https://i.ytimg.com/vi/p5Vsg1CrhrI/hqdefault.jpg',
         to: req.body.recipient,
       })
      .then(message => console.log(message.sid))
      .done();
})


app.listen(port, () => console.log(`Listening on port ${port}`));
