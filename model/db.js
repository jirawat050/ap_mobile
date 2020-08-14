const mysql = require('mysql2');


const db = mysql.createConnection ({
    host: 'localhost', // not connact change to host = mysql
    user: 'root',
    password: 'root',
    database: 'ap_test',
    port: 3306,
   
});
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

module.exports = db
