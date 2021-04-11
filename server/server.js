const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config.js");
const app = express();
const { connection } = require("./db.js");
const port = process.env.PORT || 5000;
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const busboy = require('connect-busboy');
const busboyBodyParser = require('busboy-body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboy());
app.use(busboyBodyParser());
// add cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

require('./farm-layout')(app);
require('./messaging')(app);
require('./photos')(app);
require('./farm-layout')(app);
require('./messaging')(app);

app.post("/api/getUserId", (req, res) => {
  let { email, password } = req.body;
  let sql = "SELECT user_id, confirmed FROM accounts WHERE email=? and password=?"
  console.log("inside getUserId")
  connection.query(sql, [email, password], (err, results) => {
    if (err) {
      console.log("error: ", err);
      res.status(500).send({
        message: err.message || "Error Occured In Logging In",
      });
    } else {
      console.log("result: ", results)
      let parsed = JSON.parse(JSON.stringify(results[0]))
      // if (parsed.confirmed == 0){
      //   res.status(500).send({
      //   message: results.message || "Please confirm email address before logging in"
      //   });
      // } else {
        res.status(200).send(results);
      // }
    }
  });
});

app.get("/api/getUserProfile/:userId", (req, res) => {
  console.log("req param", req.params)
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
  const {email, password, firstName, lastName, lat, lng, city, street, zipCode, state, description} = req.body
  const profileName = `${firstName} ${lastName}`
  //Point to a picture of default profile picture in S3 to get assigned as every new users profile picture
  const defaultProfile = "https://fleetfarmingimages.s3.amazonaws.com/defaultprofile.jpg"
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let account_date = (year + "-" + month + "-" + date)

  let sql = "INSERT INTO `accounts` (`email`, `password`)\n" +
  "VALUES(?, ?);\n" +
  "INSERT INTO `addresses` (`lat`, `lng`, `city`,`street_name`, `zipcode`, `state`, `user_id`)\n" +
  "VALUES(?, ?, ?, ?, ?, ?, (SELECT user_id FROM accounts WHERE `email` = ?));\n" +
  "INSERT INTO `farms` (`user_id`)\n" +
  "VALUES((SELECT user_id FROM accounts WHERE `email` = ?));\n" +
  "INSERT INTO `profiledata` (`account_date`, `profile_name`, `firstName`, `lastName`, `description`, `user_id`, `address_id`, `farm_id`)\n" +
  "VALUES(?, ?, ?, ?, ?, (SELECT user_id FROM accounts WHERE `email` = ?),\n" +
  "(SELECT address_id FROM addresses WHERE user_id = (SELECT user_id FROM accounts WHERE `email` = ?)),\n" +
  "(SELECT farm_id FROM farms WHERE user_id = (SELECT user_id FROM accounts WHERE `email` = ?)));\n" +
  "INSERT INTO `photos` (`user_id`, photo_url, is_profile_picture) VALUES((SELECT user_id FROM accounts WHERE `email` = ?), ?, ?)"

  connection.query("SELECT user_id FROM `accounts` WHERE email = ?", [email], (err, results) => {
    if (err) console.log(err);
    console.log("result: ", results)
    if (results !== undefined && results.length > 0) {
      res.send({success: false, msg: "Email already existed"})
      return;
    } else {
      connection.query(sql, [email, password, lat, lng, city, street, zipCode, state, email, email, account_date, profileName, firstName,
         lastName, description, email, email, email, email, defaultProfile, 1], (err, results) => {
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
            sendConfirmation(email)
            res.status(200).send({success: true, msg: "Registration Succeed!!", userId: results[0].user_id});
          }
        });
      })
    }
  })
});
// });

app.get('/api/getMapData', (req, res) => {
  let sql = `SELECT profiledata.firstName, profiledata.lastName, profiledata.description
  ,profiledata.user_id, profiledata.profile_name, farms.farm_id, farms.farm_name, farms.start_date
  ,farms.farm_type, addresses.lng, addresses.lat, addresses.street_name, addresses.city,
  addresses.zipcode, addresses.state
  FROM profiledata, farms, addresses
  WHERE profiledata.user_id = farms.farm_id AND addresses.address_id = profiledata.user_id`

  connection.query(sql, (err, results) => {
    if (err) {
      console.log("error: ", err);
      res.status(500).send({
        message: err.message || "Error Retreiving Data",
      });
    } else {
      results.map(obj => {
        obj.address = {street_name: obj.street_name, city: obj.city, state: obj.state,
           zipcode: obj.zipcode}
        return obj
      })
      console.log("results: ",results)
      res.status(200).send(results);
    }
  });
});

app.get("/api/changeEmail/:userId", (req, res) => {
  console.log("req param", req.params)
  let {userId} = req.params
  let {newEmail} = req.body

  const sql = `UPDATE accounts
  SET email = ?
  WHERE user_id = ?`

  connection.query(sql, [newEmail, userId], (err, results) => {
    if (err) {
      console.log("error: ", err);
      res.status(500).send({
        message: err.message || "Error Changing Email",
      });
    } else {
      console.log("Email changed")
      res.status(200).send(results);
    }
  });
});

app.get("/api/changeAddress/:userId", (req, res) => {
  console.log("req param", req.params)
  console.log("req body", req.body)
  let {userId} = req.params
  let {street_name, zipcode, state, city} = req.body

  const sql = `UPDATE addresses
  SET street_name = ?, zipcode = ?, state = ?, city = ?
  WHERE user_id = ?`

  connection.query(sql, [street_name, zipcode, state, city, userId], (err, results) => {
    if (err) {
      console.log("error: ", err);
      res.status(500).send({
        message: err.message || "Error Changing Address",
      });
    } else {
      console.log("Address changed")
      res.status(200).send(results);
    }
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

console.log("Process: ", config);
// test();

const sendConfirmation = function(email) {

  const sql = "SELECT user_id FROM accounts WHERE email=?"
  id = 0;
  connection.query(sql, [email], (err, results) => {
    if (err) {
      console.log("error: ", err);
    } else {
      let parsed = JSON.parse(JSON.stringify(results[0]))
      console.log(results)
      id = parsed.user_id;
      console.log("id", id)
    }
  })
  console.log("id test", id)

  // let transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'fleetconfirm@gmail.com',
  //     pass: process.env.email_password
  //   }
  // });

  // let mailOptions = {
  //   from: 'fleetconfirm@gmail.com',
  //   to: email,
  //   subject: 'FleetFarming Email Confirmation',
  //   text: 'Please click this link to confirm your email'
  // }

  // transporter.sendMail(mailOptions, function(err, data) {
  //   if (err) {
  //     console.log('Error Occured');
  //   } else {
  //     console.log('Email sent');
  //   }
  // });
}

//sendConfirmation('mlombard5333@gmail.com');


