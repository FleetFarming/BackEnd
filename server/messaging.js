const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config.js");
const { connection } = require("./db.js");
const app = express();


module.exports = function(app) {


app.post('/api/CreateMessage/:userId', (req, res) => {
    var convo_id = null; //Used later if the message starts a new conversation
    let {userId} = req.params
    const {body, subject, recipient, isNewConversation, conversationId, recipientId} = req.body
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let message_date = (year + "-" + month + "-" + date)
    let conversationSql = "INSERT INTO `conversation` (`subject`, `sender_name`,\n" +
    "`recipient_name`) VALUES(?, (SELECT profile_name FROM profiledata WHERE user_id = ?), ?);"
    let newConvoSql = "INSERT INTO `messages` (`send_date`, `message`, `conversation_id`, `sender_id`,\n" +
    "`recipient_id`, `recipient_name`, `sender_name`, `subject`) VALUES (?, ?, ?, ?, \n" +
    "?, ?, (SELECT profile_name FROM profiledata WHERE user_id = ?), ?);"
    let messageSql = "INSERT INTO `messages` (`send_date`, `message`, `conversation_id`, `sender_id`,\n" +
    "`recipient_id`, `recipient_name`, `sender_name`, `subject`) VALUES (?, ?, ?, \n" +
    "?, ?, ?, (SELECT profile_name FROM profiledata WHERE user_id = ?), ?);"

    if (isNewConversation === true) {
        console.log("conversation is new: ", isNewConversation);
        connection.query(conversationSql, [subject, userId, recipient], (err, results) => {
            if (err) {
                console.log("error: ", err);
                res.status(500).send({
                  message: err.message || "An error has occured ",
                });
            } else {
                convo_id = results.insertId;
                console.log("results: ", results)
                connection.query(newConvoSql, [message_date, body, convo_id, userId, recipientId, recipient, userId, subject], (err, results) => {
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
              }
        })
    } else {
        console.log("conversation is not new")
        connection.query(messageSql, [message_date, body, conversationId, userId, recipientId, recipient, userId, subject], (err, results) => {
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
    }
})

app.get('/api/getMessages/:userId', (req, res) => {
    let {userId} = req.params

    let sql = "SELECT * FROM messages WHERE ((sender_id = ? OR recipient_id = ?) AND (deleted_by != ?))"

    connection.query(sql, [userId, userId, userId], (err, results) => {
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

app.post('/api/deleteMessage/:userId', (req, res) => {
    let {userId} = req.params
    let {messageId} = req.body
    sqlCheck = "SELECT * FROM `messages` WHERE (message_id = ?)"
    deleteOneSql = "UPDATE `messages` SET deleted_by = ? WHERE (message_id = ?)"
    removeMessageSql = "DELETE FROM `messages` WHERE (message_id = ?)"

    connection.query(sqlCheck, [messageId], (err, results) => {
        if (err) {
            console.log("Error: ", err);
            res.status(500).send({
                message: err.message || "An error has occured",
            });
        } if (results[0].deleted_by == null) {
            connection.query(deleteOneSql, [userId, messageId], (err, results) => {
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
        } else {
            connection.query(removeMessageSql, [messageId], (err, results) => {
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
        }
    })
})

}