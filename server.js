'use strict';
///app dependencies///
const express= require('express');
const pg= require('pg');
const superagent= require('superagent');
const methodOverride= require('method-override');

/////// app configuration//////
require('dotenv').config();
const PORT = process.env.PORT||3030;
const server=express();

///// app setups ///
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');

////database////
const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}} );

//////////////
/////routes////
/////////////////
server.get('/',homePageHandler);
server.post('/search',searchHandler);
server.get('/all',allProducts);
server.post('/save',getData);
server.get('/show',renderData);
server.get('/detail/:id',detailHandler);
server.put('/update/:id',updateHandler);
server.delete('/delete/:id',deleteHandler);







////////////////
/////handlers////
/////////////////
function homePageHandler(req,res){
  res.render('pages/home page');
}

function searchHandler(req,res){
  let brand = req.body.brand;
  let from = req.body.from;
  let to = req.body.to;
  let url =`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}&price_greater_than=${from}&price_less_than=${to}`;
  superagent.get(url)
  .then(result=>{
let dataBody = result.body.map((data)=>new Make(data));
res.render('pages/Product By Price',{data:dataBody});
  });
}

function allProducts(req,res){
  let url ='http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline';
  superagent.get(url)
  .then(result=>{
    let dataBody=result.body.map((data)=>new Product(data));
    res.render('pages/Maybelline Products',{data:dataBody});
  })
}


function getData(req,res){
  const {name,price,image,description}=req.body;
  let safeValues=[name,price,image,description];
  let sql='INSERT INTO make(name,price,image,description) VALUES($1,$2,$3,$4);';
  client.query(sql,safeValues)
  .then(()=>{
res.redirect('/show')
  }).catch(()=>{
    res.redirect('/show')
  });
}

function renderData(req,res){
  let sql='SELECT * FROM make;';
  client.query(sql)
  .then(result=>{
    res.render('pages/My Card',{data:result.rows});
  })
}

function detailHandler(req,res){
  let id = req.params.id;
  let sql = 'SELECT * FROM make WHERE id=$1;';
  let safeValues=[id];
  client.query(sql,safeValues)
  .then(result=>{
    res.render('pages/detail',{data:result.rows});
  })
}

function updateHandler(req,res){
  const {name,price,image,description}=req.body;
  let id = req.params.id;
  let safeValues=[name,price,image,description,id];
  let sql =`UPDATE make SET name=$1,price=$2,image=$3,description=$4 WHERE id=$5;`;
  client.query(sql,safeValues)
  .then(()=>{
    res.redirect(`/detail/${id}`);
  });


}
function deleteHandler(req,res){
  let id = req.params.id;
let sql = `DELETE FROM make WHERE id=$1;`;
let safeValues=[id];
client.query(sql,safeValues)
.then(()=>{
res.redirect('/show');
});
}



//////constructor/////
function Make(data){
  this.name=data.name;
  this.price=data.price;
  this.image=data.image_link;
  this.description=data.description;


}


function Product(data){
  this.name=data.name;
  this.price=data.price;
  this.image=data.image_link;
  this.description=data.description;

}


client.connect()
.then(()=>{
server.listen(PORT,()=>console.log(`listen on port ${PORT}`));
}).catch(error=>console.log(error));