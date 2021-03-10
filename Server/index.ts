import express from 'express';
import bodyParser = require('body-parser');
import { tempData } from './temp-data';
import { serverAPIPort, APIPath } from '@fed-exam/config';
import {ResPonse} from'./temp-data';
import {Request} from './types.d'
import { Ticket } from '../client/src/api';
console.log('starting server', { serverAPIPort, APIPath });

const app = express();



app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

const sort=(data:Ticket[],sortway:string)=>{
  sortway=='date'? 
  data.sort((a,b)=> (a.creationTime-b.creationTime)>0?-1:1):(
    sortway=='date1'? 
  data.sort((a,b)=>  (a.creationTime-b.creationTime)>0?1:-1):(
    sortway=='mail'? 
  data.sort((a,b)=> a.userEmail.localeCompare(b.userEmail)>0?1:-1 ):(
    sortway=='mail1'? 
  data.sort((a,b)=> a.userEmail.localeCompare(b.userEmail)>0?-1:1 ):(
    sortway=='title'? 
   data.sort((a,b)=>(a.title.localeCompare(b.title)>0)?1:-1):(
    sortway=='title1'? 
   data.sort((a,b)=>(a.title.localeCompare(b.title)>0)?-1:1):
   data)))));

   return data;
}

app.get(APIPath, (req, res) => {
  
  // @ts-ignore
  const params:Request = req.query;
  let PAGE_SIZE = params.pagesize;
  const page: number =  params.page || 1;
  var sorttempData=tempData;
  
 


  if(params.date===""){
    if(params.date==""){
      console.log("check");
      sorttempData = sort(tempData.slice(0),params.sortype)
    }else{
      console.log("check1");
       sorttempData= tempData.filter((t)=>t.userEmail==params.date)
    }
  }else if(params.sortype=='date'&&params.date>0){
    console.log("check3");
            sorttempData= tempData.filter((t)=>t.creationTime>params.date)
      }else if(params.sortype=='date1'&&params.date>0){
        console.log("check5");
         sorttempData= tempData.filter((t)=>t.creationTime<params.date)
      }
      if(params.val!=""){
        sorttempData=sorttempData.filter((t)=> (t.title.toLowerCase() + t.content.toLowerCase()).includes(params.val.toLowerCase()))
      }                    
  const paginatedData = sorttempData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    


  const respose = {tickets:paginatedData,length:tempData.length} as ResPonse

  res.send(respose);
});

app.listen(serverAPIPort);
console.log('server running', serverAPIPort)

