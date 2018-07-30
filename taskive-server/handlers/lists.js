const db = require('../models');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const { getSelectedList , setSelectedList } = require('../Parser')
const  Parser = require('../Parser');

let selectedList = null;

exports.createList = async function(req,res,next){
    try 
    {
        let list = await db.List.create({
            name: req.body.name
        });
     return res.status(200)
    }
    catch (err)
    {
        return next(err);
    }
}

exports.createListSMS = async (name) => {
   
    try 
    {
        let list = await db.List.create({
            name: name
        });
     return res.status(200)
    }
    catch (err)
    {
        console.log(`error at createListsSMS: ${err}`)
        return next(err);
    }
}

exports.viewListsNamesSMS = async () => {

   try 
   {
       if(Parser.getSelectedList() != null)
       {
         selectedList = Parser.getSelectedList();
       }
   } 
   catch (err)
   {
       console.log('error in viewListNamesSMS: ' + err);
   }
  
     console.log("view lists names hit");

     let formatResult = (messages) => {
        let temp = [];
        for(let i = 0; i < messages.length; i ++)
            {
                if(selectedList != null && selectedList == messages[i].name)
                {
                    temp.push(messages[i].name.toString() + " *");
                }
                else
                {
                    temp.push(messages[i].name.toString());
                }
            }

            return "Lists: \n" + temp.join('\n');
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

            // db.List.findById(listID,(err, list) => {
            //     if(err)
            //     {
            //         console.log('err: ' + err);
            //         return err;
            //     }
            //     else
            //     {
            //         console.log(list.name);
            //         console.log(list.listItems);

            //         list.listItems.push("test");
            //         list.save();
            //         console.log(list.listItems);

            //         //list.save();
            //     }
            // });

        return item + " added.";
        } 
        catch (err)
        {
            console.log('error in addItemSMS ' + err);
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