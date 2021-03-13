const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config.js");
const { connection } = require("./db.js");
const app = express();


module.exports = function(app) {

app.post('/api/createFarmObject:userID', (req, res) => {
    let {userID} = req.params
    const {groupX, groupY, shapeX, shapeY, shapeType, shapeWidth, shapeHeight, shapeRotation,
         textX, textY, textRotation, textWidth, textHeight, radius} = req.body
    let sql = "INSERT INTO `farm_layout` (`farm_id`, `groupX`, `groupY`, `shapeX`, `shapeY`, \n" +
    "`shapeType`, `shapeWidth`, `shapeHeight`, `shapeRotation`, `textX`, `textY`, \n" +
    "`textRotation`, `textWidth`, `textHeight`, `radius) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"

    connection.query(sql, [userID, groupX, groupY, shapeX, shapeY, shapeType, shapeWidth,
         shapeHeight, shapeRotation, textX, textY, textRotation, textWidth, textHeight, radius],
         (err, results) => {
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