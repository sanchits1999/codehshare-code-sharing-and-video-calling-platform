const mongoose = require("mongoose")

const RoomSchema = mongoose.Schema({
    RoomName : {
        type : String,
        required : true,
        unique : true
    },
    data : {
        type : String
    }
})

mongoose.model("Room",RoomSchema)