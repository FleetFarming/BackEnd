let mysql = require("mysql");
let config = require("./config.js");
let connection = mysql.createConnection({
  host: "localhost",
  user: config.db_username,
  password: config.db_pwd,
  database: config.db_name,
  port: config.db_port,
});

connection.connect((err) => {
  if (err) {
    return console.error(
      "==============================\nError in connecting Database\n============================== " +
        err.message
    );
  }
  console.log(
    "==============================\nConnected to the MySQL server.\n=============================="
  );
});

exports.connection = connection;
