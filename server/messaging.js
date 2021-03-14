const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config.js");
const { connection } = require("./db.js");
const app = express();


module.exports = function(app) {


app.post('/api/CreateMessage', (req, res) => {
    var convo_id = null; //Used later if the message starts a new conversation
    const {body, subject, conversation, recipient, sender_id} = req.body
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let message_date = (year + "-" + month + "-" + date)
    let sql = "INSERT INTO `conversation` (`subject`, `sender_name`,\n" +
    "`recipient_name`) VALUES(?, (SELECT profile_name FROM profiledata WHERE user_id = ?), ?);"
    let messageSql = "INSERT INTO `messages` (`send_date`, `message`, `conversation_id`, `sender_id`,\n" +
    "`recipient_id`) VALUES (?, ?, ?, ?, (SELECT user_id FROM profiledata WHERE profile_name = ?));"

    // if (conversation == 0) {
    //     connection.query(sql, [subject, sender_id, recipient], (err, results) => {
    //         if (err) {
    //             console.log("error: ", err);
    //             res.status(500).send({
    //               message: err.message || "An error has occured ",
    //             });
    //         } else {
    //             convo_id = results.insertId;
    //             console.log("results: ",results)
    //             connection.query(messageSql, [message_date, body, convo_id, sender_id, recipient], (err, results) => {
    //                 if (err) {
    //                     console.log("Error: ", err);
    //                     res.status(500).send({
    //                         message: err.message || "An error has occured",
    //                     });
    //                 } else {
    //                     console.log("results: ", results)
    //                     res.status(200).send(results);
    //                 }
    //             })
    //           }
    //     })
    // } else {
    //     connection.query(messageSql, [message_date, body, conversation, sender_id, recipient], (err, results) => {
    //         if (err) {
    //             console.log("Error: ", err);
    //             res.status(500).send({
    //                 message: err.message || "An error has occured",
    //             });
    //         } else {
    //             console.log("results: ", results)
    //             res.status(200).send(results);
    //         }
    //     })
    // }
})

app.get('/api/getMessages/:userId', (req, res) => {
    console.log("req param", req.params)
    let {userId} = req.params

    let sql = "SELECT * FROM messages WHERE sender_id OR recipient_id = ?"

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.log("Error: ", err);
            res.status(500).send({
                message: err.message || "An error has occured",
            });
        } else {
            console.log("results: ", results)
            res.status(200).send(results);
        }
    })
})

}