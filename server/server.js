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

app.get("/api/getUserProfile/:userId", (req, res) => {
  console.log("req parem", req.params)
  const {userId} = req.params

  const sql = `select * from (select acc.user_id, acc.email, prof.profile_id,
    prof.description, prof.profile_name, prof.firstName,
    prof.lastName, addr.address_id, addr.street_name, addr.city, addr.zipcode, addr.state
    from accounts acc
      inner join profiledata prof on  prof.user_id = acc.user_id
      inner join addresses addr on addr.user_id = acc.user_id) as t where t.user_id = ?`
  // let { email, password } = req.body;
  // let sql = "SELECT user_id FROM accounts WHERE email=? and password=?";

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.log("error: ", err);
      res.status(500).send({
        message: err.message || "Error Occured In Logging In",
      });
    } else {
      console.log("results: ",results)
      res.status(200).send(results);
    }
  });
});

app.post('/api/saveUser', (req, res) => {
  console.log("req.body", req.body);
  const {email, password, firstName, lastName, city, street, zipCode, state, description} = req.body
  const profileName = `${firstName} ${lastName}`
  let sql = "INSERT INTO `accounts` (`email`, `password`)\n" +
  "VALUES(?, ?);\n" +
  "INSERT INTO `addresses` (`city`,`street_name`, `zipcode`, `state`, `user_id`)\n" +
  "VALUES(?, ?, ?, ?, (SELECT user_id FROM accounts WHERE `email` = ?));\n" +
  "INSERT INTO `profiledata` (`profile_name`,`firstName`, `lastName`, `description`, `user_id`, `address_id`)\n" +
  "VALUES(?, ?, ?, ?, (SELECT user_id FROM accounts WHERE `email` = ?),\n" +
  "(SELECT address_id FROM addresses WHERE user_id = (SELECT user_id FROM accounts WHERE `email` = ?)));\n"

  connection.query("SELECT user_id FROM `accounts` WHERE email = ?", [email], (err, results) => {
    if (err) console.log(err);
    console.log("result: ", results)
    if (results !== undefined && results.length > 0) {
      res.send({success: false, msg: "Email already existed"})
      return;
    } else {
      connection.query(sql, [email, password, city, street, zipCode, state, email, profileName, firstName, lastName, description, email, email], (err, results) => {
        if (err) console.log(err);
        console.log(results);
        connection.query("select user_id from accounts where email = ?", [email], (err, results) => {
          if (err) {
            console.log("error: ", err);
            res.status(500).send({
              message: err.message || "Error Occured In Registration",
            });
          } else {
            console.log("results: ",results)
            res.status(200).send({success: true, msg: "Registration Succeed!!", userId: results[0].user_id});
          }
        });
      })
    }
  })
});
// });

app.listen(port, () => console.log(`Listening on port ${port}`));

console.log("Process: ", config);
// test();
