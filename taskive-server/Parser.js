const { createList, createListSMS, viewListsNamesSMS } = require('./handlers/lists');
let List =   require('./models/list');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

let SID = "AC32dff523f958932d42897186ce22f286" // process.env.TWILIO_SID;
let TOKEN = "6ea5683c97d8f7b38d9d1ec2770c1143" //process.env.TWILIO_TOKEN;
let SENDER = "+13852904244" // process.env.TWILIO_SENDER

let client = require('twilio')(SID, TOKEN)


let secondCommand = '';
let currListName = '';
let selectedList = '';

exports.Parser = (req, res, body) => {
   switch (getCommand(body)){
       case "?":
       return helpScript;
   
       case "list":
       return "fetching database lists";

       case "add":
       createListSMS(secondCommand);
       return `added ${secondCommand} `;

       case "select":
       return selectList(secondCommand);

       case "view":
       console.log("view hit")
       viewListsNamesSMS().then(results => { console.log('results: ' + results); sendSMS2(req, res, results)});
       return null;

       case "add":
       console.log("add list hit");
       return "coolio";

       case "working":
       console.log("working hit")
       viewListsNamesSMS().then(results => { console.log('results2: ' + results); sendSMS2(req, res, results)});
       return null;
    
       
       default: 
       return "No trigger detected";
   } 
}

let getCommand = (text) => {

    if(!text || text == null)
    return "error";

    let message = text.split(" ");

    if(message.length > 1)
    {
      secondCommand = message[1];
    }
   
    let command = message[0].toLowerCase();
    return command;
}

let selectList = (name) => {
    currListName = name;
   return  "fetching list: " + name;
}

let viewItems = () => {
    // get list items based on current list 
    List.find({}, () => {
        if(err)
        {
            console.log(err);
            return "error finding lists";
        }
        else
        {
            console.log({name})
        }
    });


  
    
}

let sendSMS = (res, resBody) => {
    // Add a text message.
    const twiml = new MessagingResponse();
    const msg = twiml.message(resBody);//
  
    // Add a picture message.
    //  msg.media('https://www.softpaws.com/template/images/landing_page/july_cat_image.jpg');
  
    //res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  }

  let sendSMS2 = (req, res, body) => {

    console.log('req: ' + req);
    console.log('body: ' + body);
   
    try {
        client.messages
        .create({
           body: body,
           from: SENDER,
           to: '+15598167525'
         })
        .then(message => console.log(message.sid))
        .done();
    } catch (err){
        console.log("error in send sms2: " + err);
    }

  };


let helpScript = 
" Taskive: Tasks via SMS " +
" The following commands are available: " +
"\n1. \"?\": Show this message " +
"\n2. \"list\": Show your lists (current list marked with *) " +
"\n3. \"view\": View items in current lists " +
"\n4. \"select 'name' \": Select the list by 'name' " +
"\n5. \"add 'name' \": Adds 'name' as an item to current list " +
"\n6. \"add list 'name' \": Adds 'name' as a new list " +
"\n7. \"remove 'name' \": Removes 'name' as an item from current list " +
"\n8. \"remove list 'name' \": Removes list 'name', will confirm if not empty ";

