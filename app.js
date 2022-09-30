require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./db/connectDB")
const startApp = require("./utils/startApp")
const userRoutes = require("./features/users/routes")
const noteRoutes = require("./features/notes/routes")
const quickNoteRoutes = require("./features/notes/quicknotes")
const auth = require("./middlewares/auth")
const app = express()
const redisClient = require("./redis/client")
const noteControls = require("./features/notes/controllers")
const http = require("http")
const server = http.createServer(app)
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
})

// redisClient

// essential middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/v1/user", userRoutes)
app.use("/api/v1", auth, noteRoutes)
app.use("/api/v1", auth, quickNoteRoutes)
app.put("/api/v1/notes/:noteID", noteControls.updateNote)

const PORT = process.env.PORT || 4000

io.on("connection", (socket) => {
  let state
  socket.on("text-changed", (data) => {
    const room = data.id
    state = data.newText
    socket.to(room).emit("text-changed", {
      newText: data.newText,
      ops: data.ops,
    })
  })
  socket.on("CONNECTED_TO_ROOM", (roomID) => {
    socket.join(roomID)
    socket.activeRoom = roomID
    io.in(roomID).emit("ROOM_CONNECTION", state)
  })
})

server.listen(PORT, startApp(connectDB))
