//import { Mongoose } from 'mongoose';

const mysql=require('mysql');
const express=require('express');
var app=express();
const bodyparser=require('body-parser');
const jwt=require('jsonwebtoken');
const LOGOUT=require('express-passport-logout');
app.use(bodyparser.json());
const accountSid='AC5084d9d3c8af2b586aa4241ebe8bd5b7';
const authToken='ea0ad68f4a89c1b259976b497008d4d5';
const client=require('twilio')(accountSid,authToken);
const MessagingResponse=require('twilio').twiml.MessagingResponse;
const mongoose=require('mongoose');
const twiml = new MessagingResponse();

var options = ["Headache", "Dizziness", "Nausea", "Fatigue", "Sadness", "None"]; //in db
var step = 0;  //in db
var symptom = ''; //in db
var symptomid = 0; //in db
var count = 0;  //in db


let MessageSchema=new mongoose.Schema({
    phoneNumber:String,
    symptomName1:String,
    symptomName2:String,
    symptomName3:String
})

let Message=mongoose.model('Message',MessageSchema);

app.use(bodyparser.urlencoded({extended:false}))
mongoose.connect('mongodb://gautham:hydrogen01@ds155414.mlab.com:55414/smsdb',
{useMongoClient:true}).then(()=>{console.log('Mongoose db connected');
})




app.listen(7000,()=>console.log('Express server is running at port: 7000'));


//TEST APPLICATION


let TestSchema=new mongoose.Schema({
    phoneNumberFrom:String,
    phoneNumberTo:String,
    body:String,
    steps:String,
    symptomsList:Array,
    symptomids:String,
    count:Number,
    Userresponse:String
})

let Test=mongoose.model('Test',TestSchema);


app.post('/smsReceiveTest',(req,res)=>{
    
    let from=req.body.From;
    let to=req.body.To;
    let body=req.body.Body;

Test.find({phoneNumberFrom: req.body.From},(err,message)=>{

    if(message.length !==0)
{
console.log("Existing user");
Test.find({phoneNumberFrom:from},(err,data)=>{
    //console.log(data[0].steps); 
    var arraySize=data[0].symptomsList.length;
console.log('size of array is '+arraySize);
    if(body==='START'){  //WORKING //there was another condition to check step==0
        console.log('Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None');
        client.messages.create({
            to:`${from}`,
            from:`${to}`,
            body:'Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None' 
        })
         Test.update({phoneNumberFrom:from},{$set:{steps:1}}).then(result=>  {  })
            
    }//inner if ends here
    
    else if (data[0].steps==1 && body == 0){   //WORKING
        console.log('Thank you and we will check with you later' ) 
        client.messages.create({
            to:`${from}`,
            from:`${to}`,
            body:'Thank you and we will check with you later' 
        })
        Test.update({phoneNumberFrom:from},{$set:{count:0}}).then(result=>  {  })
        Test.update({phoneNumberFrom:from},{$set:{steps:1}}).then(result=>  {  })
        Test.update({phoneNumberFrom:from},{$set:{symptomids:0}}).then(result=>  {  })
        Test.update({phoneNumberFrom:from},{$set:{symptomsList:options}}).then(result=>  {  })

     }

     else if (data[0].steps==1 && (req.body.Body > 0 && req.body.Body < arraySize)) //WORKING It was <6
{  
    Test.update({phoneNumberFrom:from},{$set:{symptomids:req.body.Body-1}}).then(result=>  {
       
        Test.find({phoneNumberFrom:from},(err,data)=>{
            console.log('SYMPTOM ID IS '+data[0].symptomids)
            symptom=data[0].symptomsList[data[0].symptomids];
            console.log(symptom);
            console.log('On a scale from 0 (none) to 4 (severe), how would you rate your "'+ symptom +'" in the last 24 hours?')
            client.messages.create({
                to:`${from}`,
                from:`${to}`,
                body:'On a scale from 0 (none) to 4 (severe), how would you rate your "'+ symptom +'" in the last 24 hours?' 
            })

            Test.update({phoneNumberFrom:from},{$set:{steps:2}}).then(result=>  {  })    
       Test.update({phoneNumberFrom:from},{$set:{Userresponse:data[0].Userresponse+symptom}})
             .then(result=>{ });    
    })
    //the above code was here not inside then
      })
}

//THIS CASE OCCURS IF NUMBER IS OUT OF RANGE
else if (data[0].steps==1 && (req.body.Body < 0 || req.body.Body > arraySize-1))
{ var x='The Number you entered is invalid and should be within range '+(arraySize-1);
console.log(x);
client.messages.create({
    to:`${from}`,
    from:`${to}`,
    body:x 
})
}

else if (data[0].steps==2 && (req.body.Body < 0 || req.body.Body > 4)) //WORKING
{
  console.log('Please enter a number from 0 to 4' );
  client.messages.create({
    to:`${from}`,
    from:`${to}`,
    body:'Please enter a number from 0 to 4'
})
}

else if(data[0].steps==2) //within this there will be case statements 
{  //SEEMS WORKING TEST 0,1,2,4
    var nbr = Number(req.body.Body)
Test.update({phoneNumberFrom:from},{$set:{Userresponse:data[0].Userresponse+nbr}})
        .then(result=>{  });

    switch (nbr) 
    {
        case 0:
        console.log('You do not have a '+symptom);
        client.messages.create({
            to:`${from}`,
            from:`${to}`,
            body:'You do not have a '+symptom
        })       
        break;
        case 1:
        console.log('You have a mild '+symptom);
        client.messages.create({
            to:`${from}`,
            from:`${to}`,
            body:'You have a mild '+symptom
        })  
          break;
          case 2:
        console.log('You have a mild '+symptom);
        client.messages.create({
            to:`${from}`,
            from:`${to}`,
            body:'You have a mild '+symptom
        })  
            break;
            case 3:
      console.log('You have a moderate '+symptom);
      client.messages.create({
        to:`${from}`,
        from:`${to}`,
        body:'You have a moderate '+symptom
    })  
      break;
      case 4:
      console.log('You have a severe '+symptom);
      client.messages.create({
        to:`${from}`,
        from:`${to}`,
        body:'You have a severe '+symptom
    })  
        break;
    }  //case statement ends here
                     //RESET STEP TO 1
    Test.update({phoneNumberFrom:from},{$set:{steps:1}}).then(result=>  {    });
    
     Test.find({phoneNumberFrom:from},(err,data)=>{
        
       
        if (data[0].count<2){
            //Update the Symptoms list
            
            data[0].symptomsList.splice(data[0].symptomids,1);
            console.log('symtom id is '+data[0].symptomids);
            console.log('array is '+data[0].symptomsList);
        Test.update({phoneNumberFrom:from},
            { $set:{symptomsList:data[0].symptomsList}})
            .then(result={  
                
             });

            var str='Please indicate your symptom';
            
            for (i = 1; i < data[0].symptomsList.length; i++) {
                str += " (" + i + ")"+data[0].symptomsList[i-1] +",";
              }
              str +=" (0)None";
            console.log(str);
            client.messages.create({
                to:`${from}`,
                from:`${to}`,
                body:str
            })  
       //INCREMENT COUNTER 
    Test.update({phoneNumberFrom:from},{$set:{count:(data[0].count)+1}}).then(result=>  { 
       
    })
        }
        if(data[0].count>=2){
            console.log("Your survey is completed");
            client.messages.create({
                to:`${from}`,
                from:`${to}`,
                body:'Your survey is completed'
            }) 
            Test.update({phoneNumberFrom:from},{$set:{count:0}}).then(result=>  {  })
            Test.update({phoneNumberFrom:from},{$set:{steps:1}}).then(result=>  {  })
            Test.update({phoneNumberFrom:from},{$set:{symptomids:0}}).then(result=>  {  })
            Test.update({phoneNumberFrom:from},{$set:{symptomsList:options}}).then(result=>  {  })
     
        }
     })
}
})

}  //User Existing user logic ends here

else
{
    //New user
console.log("new user");

    if(body==='START')
    {
        console.log('Welcome new user.Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None');
        client.messages.create({
            to:`${from}`,
            from:`${to}`,
            body:'Welcome new user.Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None'
        })  
        let test=new Test();
        
        test.phoneNumberFrom=from;
        test.phoneNumberTo=to;
        test.body=body;
        test.steps=1; //it was previously zero
        test.symptomsList=["Headache", "Dizziness", "Nausea", "Fatigue", "Sadness", "None"];
        test.symptomids=0;
        test.count=0;
        test.Userresponse="";
        test.save();
    } 
}
})
res.end();
})  

