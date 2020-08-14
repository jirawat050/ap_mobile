
var express = require('express');
var bodyParser = require('body-parser')
var router= require('./routes/router');

const http = require('http');
var app = express();


var server = http.createServer(app);





const port = process.env.PORT || 8000;



app.use(bodyParser.json({limit: '200mb'}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use('/api/',router);


app.use(bodyParser.urlencoded({ extended: false ,limit: '50mb'}));



server.listen(port, () => {

    console.log(`Server is up on ${port}`);
});

server.timeout = 0;
