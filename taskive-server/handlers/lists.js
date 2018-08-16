const db = require('../models');
const User = require('../models/user')
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const { getSelectedList , setSelectedList } = require('../Parser')
const  Parser = require('../Parser');

let selectedList = null;


exports.testingDB = async (name, from) => {
    try {
        console.log('from: ' + from);
        //let user = await getUserFromDB(from);
        //console.log('user: ' + user);
        const result = await User.find();
        console.log('result: ' + result);
    } 
    catch(err)
    {
      console.log('err in testingDB: ' + err);
    }
}

exports.createListSMS = async (name, from) => { // WORKING
   
    try 
    {
        let user = await getUserFromDB(from);
        if(user == null)
        {
            return 'error finding account';
        }

        User.findByIdAndUpdate(user._id,
            {$push: {lists: {listName: name}}},
            {safe: true, upsert: true},
            function(err, doc) {
                if(err)
                {
                console.log(err);
                return 'error adding ' + name;
                }
                else
                {
                    return name + ' added.'
                }
            }
        );
   
    }
    catch (err)
    {
        console.log(`error at createListsSMS: ${err}`)
        return 'error adding ' + name;
    }
}

exports.createUserSMS = async (firstName, lastName, from) => { // WORKING
    console.log('firstname: ' +firstName);
    console.log(`lastName ${lastName}`)
    console.log(`from ${from}`)
   
    try 
    {
       // let user = await getUserFromDB(from);
        let user = await User.create({
            firstName: firstName,
            lastName: lastName,
            number: from

        });

     return firstName + ' added.'
    }
    catch (err)
    {
        console.log(`error at createUsercanSMS: ${err}`)
        return 'error adding ' + firstName;
    }
}
 
let getUserFromDB = async (userNumber) => {

    try {
    const Users = await User.find(); 
    let result = null;
    for(let i = 0; i < Users.length; i ++)
    {
        console.log(Users[i])
        if(Users[i].number == userNumber)
        {
            result = Users[i];
        }
    }

    console.log('result: ' + result)
    return result;
    } 
    catch(err)
    {
        console.log('error getting user: ' + err);
    }
}

exports.removeListSMS = async () => {
    try 
    {
        if(Parser.getSelectedList() != null)
        {
          selectedList = Parser.getSelectedList();
        }
        else 
        {
            return 'please select a list to remove. '
        }

        async function getListNames() 
        {
            const result = await db.List.find(); 
            return result;
        }
        let listID = getId(await getListNames());

        console.log('selectedList: ' + selectedList)
        console.log('listID: ' + listID);

        db.List.remove({_id : listID}).exec();
     

        return selectedList + " removed.";

    }
    catch (err)
    {
        console.log(`error at removeListsSMS: ${err}`)
        return next(err);
    }
}

exports.viewListsNamesSMS = async (from) => {

   // console.log('viewlistnamessmsm hit')
    // let user = await getUserFromDB(from);
    // if(user == null)
    // {
    //     return 'error finding account';
    // }

   // let list = db.List.findById(, function (err, adventure) {});

//    try 
//    {
//        if(Parser.getSelectedList() != null)
//        {
//          selectedList = Parser.getSelectedList();
//        }
//    } 
//    catch (err)
//    {
//        console.log('error in viewListNamesSMS: ' + err);
//    }
  
     console.log("view lists names hit");

     let formatResult = (user) => {
        let temp = [];
        for(let i = 0; i < user.lists.length; i ++)
            {
                // if(selectedList != null && selectedList == messages[i].name)
                // {
                //     temp.push(messages[i].name.toString() + " *");
                // }
                // else
                // {
                      temp.push(user.lists[i].listName.toString());
                // }
            }

              return "Lists: \n" + temp.join('\n');
    }

//  async function getListNames() {
//         const result = await db.List.find(); 
//         console.log("result: " + result)
//         return result;
//     }

 async function getUser() {
        const result = await User.findOne({number:from}); 
        console.log("result: " + result)
        return result;
    }


let final =  formatResult(await getUser());
console.log('final: ' + final);
return final;

}

exports.addItemSMS = async (item) => {
    selectedList = Parser.getSelectedList();
    if(selectedList == null)
    {
        return "please select a list before adding list items"
    }
    else
    {  
        try
        {

         async function getListNames() {
            const result = await db.List.find(); 
            return result;
         }

        let listID = getId(await getListNames());
        console.log('listID: ' + listID);

        db.List.findByIdAndUpdate(listID,
            {$push: {listItems: item}},
            {safe: true, upsert: true},
            function(err, doc) {
                if(err){
                console.log(err);
                }else{
                //do stuff
                }
            }
        );

        return item + " added.";
        } 
        catch (err)
        {
            console.log('error in addItemSMS ' + err);
            return "An error occured";

        }  
    }
}

exports.removeItemSMS = async (item) => {
    selectedList = Parser.getSelectedList();
    if(selectedList == null)
    {
        return "please select a list before removing list items"
    }
    else
    {  
        try 
        {
            async function getListNames() 
            {
                const result = await db.List.find(); 
                return result;
            }
            let listID = getId(await getListNames());
            console.log('listID: ' + listID);


            console.log('item: ' + item);
            
            db.List.findByIdAndUpdate(listID,
                {$pull: {listItems: item}},
                {safe: true, upsert: true},
                function(err, doc) {
                    if(err){
                    console.log('err: ' + err);
                    }else{
                    //do stuff
                    console.log('doc: ' + doc );
                    }
                }
            );
        return item + " removed.";
        }
        catch (err)
        {
            console.log('error in removeItemSMS ' + err);
            return "An error occured";

        }  
    }
}

exports.viewListsItemsSMS = async () => { 

    selectedList = Parser.getSelectedList();
    console.log("view lists items hit");

    if(selectedList == null)
    {
        return "please select a list before viewing list items"
    }
    else
    {        
   
     let formatResult = (messages) => 
     {
        let temp = [];
        for(let i = 0; i < messages.length; i ++)
            {
                if(messages[i].name.toString() == selectedList)
                {
                    temp = messages[i].listItems;
                }
            }

            if(temp.length > 0)
            {
                return "Items in " + selectedList + ": \n" + temp.join('\n');
            }
             else 
            {
                return "list [" + selectedList + "] has no items";
            }
    }

    async function getListNames() {
            const result = await db.List.find(); 
            console.log("result: " + result)
            return result;
        }

    let final = formatResult( await getListNames());
    console.log('final: ' + final);
    return final;


    }
}

let getId = (lists) => 
{
   for(let i = 0; i <lists.length; i ++)
       {
           if(lists[i].name.toString() == selectedList)
           {
               return lists[i]._id;
           }
       }
}