const express = require("express");
const config = require("./config.js");
const { connection } = require("./db.js");
const app = express();


module.exports = function(app) {

    app.post("/api/createFarmObject/:userId", (req, res) => {
        let {userId} = req.params
        let input = req.body.data
  
        input =  input.map(obj => {
           let tmpArray = []
           tmpArray.push(userId)
           for( i in obj) {
              tmpArray.push(obj[i])
           }
           return tmpArray
        })
  
        console.log("input: ", input)
  
        let sql = "INSERT INTO farm_layout (farm_id, groupX, groupY, shapeX, shapeY, \n" +
        "shapeType, shapeWidth, shapeHeight, shapeRotation, textX, textY, \n" +
        "textRotation, textWidth, textHeight, radius) VALUES ?"
  
        connection.query(sql, [input], function (err, result) {
            if (err) {
                console.log("error: ", err);
                    res.status(500).send({
                      message: err.message || "An error has occured ",
                    });
            } else {
                console.log(result)
                res.status(200).send(result);
            }
         });
    })

app.get('/api/getFarmLayout/:userID', (req, res) => {
    let {userID} = req.params
    let sql = "SELECT * FROM `farm_layout` WHERE `farm_id` = ?"
    console.log(userID)

    connection.query(sql, [userID], (err, results) => {
        if (err) {
            console.log("error: ", err);
                res.status(500).send({
                  message: err.message || "An error has occured ",
                });
        } else {
            console.log(results)
            res.status(200).send(results);
        }
    })
})

app.post('/api/deleteLayout/:userId', (req, res) => {
    let {userId} = req.params
    let sql = "DELETE FROM farm_layout WHERE farm_id = ?"
    
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.log("error: ", err);
                res.status(500).send({
                  message: err.message || "An error has occured ",
                });
        } else {
            console.log(results)
            res.status(200).send(results);
        }
    })
})
}