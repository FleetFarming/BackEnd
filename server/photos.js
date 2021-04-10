const express = require("express");
const { connection } = require("./db.js");
const app = express();
const Busboy = require('busboy');
const AWS = require('aws-sdk');
const {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} = process.env
const BUCKET_NAME = "fleetfarmingimages"
//If using S3 buckets, give bucket used :GetObject permission in policies


module.exports = function(app) {

    app.post('/api/saveImage/:userId', (req, res) => {
        let {profilePicture} = req.body//True or false for if its the profile picture
        let {userId} = req.params
        var busboy = new Busboy({ headers: req.headers });
        let sqlGallery = "INSERT INTO `photos` (user_id, photo_url, is_profile_picture) VALUES(?, ?, ?)"
        let sqlProfile = "UPDATE `photos` SET photo_url = ? WHERE(user_id = ? AND is_profile_picture = ?)"

        function uploadToS3(file) {
            let s3bucket = new AWS.S3({
              accessKeyId: AWS_ACCESS_KEY_ID,
              secretAccessKey: AWS_SECRET_ACCESS_KEY,
              Bucket: BUCKET_NAME
            });
            s3bucket.createBucket(function () {
                var params = {
                  Bucket: BUCKET_NAME,
                  Key: file.name,
                  Body: file.data,
                  ContentDisposition:"inline"
                };
                s3bucket.upload(params, function (err, data) {
                  if (err) {
                    console.log('error in callback');
                    console.log(err);
                  }
                  console.log('success');
                  console.log(data);
                  if(profilePicture == 1) {
                    console.log("test")
                    connection.query(sqlProfile, [data.Location, userId, 1], (err, results) => {
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
                    connection.query(sqlGallery, [userId, data.Location, 0], (err, results) => {
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
                });
            });
          }

        busboy.on('finish', function() {
            console.log('Upload finished');
            const file = req.files.image;
            console.log(file);
            uploadToS3(file);
        });
        req.pipe(busboy);
    })

    app.get('/api/getGallery/:userId', (req, res) => {
        let {userId} = req.params
        let sql = "SELECT * FROM photos WHERE (user_id = ? AND is_profile_picture = ?)"

        connection.query(sql, [userId, 0], (err, results) => {
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

    app.get('/api/getProfilePicture/:userId', (req, res) => {
        let {userId} = req.params
        let sql = "SELECT * FROM photos WHERE (user_id = ? AND is_profile_picture = ?)"

        connection.query(sql, [userId, 1], (err, results) => {
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