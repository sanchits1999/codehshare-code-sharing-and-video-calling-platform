require("./src/db/mongoose")
require("./src/models/Room")
const roomroute = require("./src/routes/RoomRoutes")
const express = require("express")
const cors = require("cors")
const app = express()

const port = 3001 || process.env.PORT

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(express.json())
app.use(roomroute)

const server = require("http").Server(app)
const io = require("socket.io").listen(server)

const users = {};

const socketToRoom = {};

io.on("connection", (socket) => {
    console.log("a user connected")
    socket.on("join room", roomID => {
    //socket.on("join", (room, callback) => {
        //socket.join(room)

        //change this if it works
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);

        //ends here

    })

    //starts here
    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    })

    //ends here

    socket.on("SendMessage", (message, callback) => {
        var room = Object.keys(socket.rooms).filter((room) => { return room != socket.id })
        socket.broadcast.to(room).emit("message", { user: socket.id, message: message })
    })


})


server.listen(port, () => {
    console.log("listening on port " + port)
})