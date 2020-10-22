const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config.js')
const app = express();
const {connection} = require('./db.js')
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// add cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api/getUsers', (req, res) => {
  let sql = "SELECT * FROM useraccount"
  connection.query(sql, (err, results, fields)=>{
    if (err) res.send(err)
    res.send(results)
  })
});

app.post('/api/saveUser', (req, res) => {
  console.log("req.body", req.body);
  const {firstName, lastName} = req.body
  console.log(typeof(firstName), lastName)
  let sql = `INSERT INTO useraccount(firstName, lastName)
             VALUES (?,?)`
  connection.query(sql, [firstName, lastName], (err, results) => {
    if (err) console.log(err);
    console.log(results);
  })
  res.send(
    `I received your POST request. This is what you sent me: ${req.body}`,
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));


console.log("Process: ",config)