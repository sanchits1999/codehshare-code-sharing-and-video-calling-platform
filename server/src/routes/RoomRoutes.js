const express = require("express")
const mongoose = require("mongoose")
const Room = mongoose.model("Room")
const router = express.Router()

router.post("/room", (req, res) => {
    console.log(req.body.room)
    Room.findOne({ RoomName: req.body.room }).then((room) => {
        if (room === null) {
            var room = new Room({ RoomName: req.body.room, data: "" })
            room.save().then((room) => {
                res.send({
                    data: room.data,
                    error: false
                })
            }).catch((e) => {
                res.send({
                    message: e,
                    error: true
                })
            })
        }
        else {
            res.send({
                data: room.data,
                error: false
            })
        }


    }).catch((e) => {
        res.send({
            message: e,
            error: true
        })
    })
})

module.exports = router