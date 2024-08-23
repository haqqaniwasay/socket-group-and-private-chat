import express from "express";
import { Server } from "socket.io";
import cors from "cors";

const PORT = 3000;

const app = express();

app.use(cors());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port localhost:${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    // origin: "http://localhost:5173/",
    // methods: ["GET", "POST"],
    // credentials: true,
  },
});

const user = true;

io.use((socket, next) => {
  if (user) next();
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.emit("welcome", "Welcome to the server");

  socket.broadcast.emit(
    "user_joined",
    `New user joined with socket id ${socket.id}`
  );

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });

  socket.on("join-room", (room) => {
    console.log(`User with socket id: ${socket.id} jave joined room: ${room}`);
    socket.join(room);
  });

  socket.on("typing", (room) => {
    console.log(`User with socket id: ${socket.id} is typing`);
    socket.broadcast.emit("isTyping", { socketId: socket.id, isTyping: true });
  });

  socket.on("stop_typing", (room) => {
    console.log(`User with socket id: ${socket.id} has stopped typing`);
    socket.broadcast.emit("isTyping", { socketId: socket.id, isTyping: false });
  });

  socket.on("message", (data) => {
    console.log(data);
    // IF ROOM THEN SEND TO PARTICULAR SOCKET
    if (data.room) {
      io.to(data.room).emit("message-recieved", data);
    } else {
      // ELSE SEND TO EVERYONE EXCEPT THE PERSON THAT IS SENDING MESSAGE
      socket.broadcast.emit("message-recieved", data);
    }
  });
});
