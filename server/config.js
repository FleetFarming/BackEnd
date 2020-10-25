require('dotenv').config();
module.exports =  {
  server_port: process.env.SERVER_PORT,
  db_username: process.env.DB_USERNAME,
  db_pwd: process.env.DB_PASSWORD,
  db_name: process.env.DB_NAME,
  db_port: process.env.DB_PORT,
}
