const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config.js");
const app = express();
const { connection } = require("./db.js");
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// add cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/api/getUserId", (req, res) => {
  let { email, password } = req.body;
  let sql = "SELECT user_id FROM accounts WHERE email=? and password=?";

  connection.query(sql, [email, password], (err, results) => {
    if (err) {
      console.log("error: ", err);
      res.status(500).send({
        message: err.message || "Error Occured In Logging In",
      });
    } else res.status(200).send(results);
  });
});

// app.post("/api/getUserId", (req, res) => {
//   console.log("login info: ", [req.body])
//   res.send("hey i got your login info")
// })

// app.post('/api/saveUser', (req, res) => {
const test = () => {
  // console.log("req.body", req.body);
  // const { firstName, lastName } = req.body;
  // console.log("username, password: ", username, password);
  let sql =
    // "BEGIN\n" +
    "INSERT INTO `accounts` (`username`, `password`)\n" +
    "VALUES('test', 'test');\n" +
    "INSERT INTO `useraccount1` (`firstName`, `lastName`)\n" +
    "VALUES('test', 'test');\n";
  // "COMMIT;"

  let sql1 =
    "INSERT INTO `accounts` (`username`, `password`) VALUES ('hello', 'world');\n" +
    "INSERT INTO `useraccount1` (`firstName`, `lastName`) VALUES ('hello', 'world')\n";

  connection.query(
    "Select user_id from accounts where username='test' and password='test'; Select * from useraccount1 where firstName = '1' and lastName = 'test' ",
    [],
    (err, results) => {
      if (err) console.log(err);
      console.log(results);
    }
  );
};
// });

app.listen(port, () => console.log(`Listening on port ${port}`));

console.log("Process: ", config);
// test();
