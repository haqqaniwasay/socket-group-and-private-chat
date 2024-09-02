import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import { connectDB } from "./db.js";
import { getUserById } from "./userModel.js";

const PORT = 3000;

const app = express();

connectDB();

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

let usersArray = [];

// io.use((socket, next) => {
//   if (user) next();
// });

const sendToOne = (id, data) => {
  io.to(id).emit("message-recieved", data);
};

const getAllSocketIds = (arr) => {
  return arr.map((item) => item.socketId);
};
const sendToAll = async (ids, body) => {
  const all = ids.map((i) => sendToOne(i, body));
  return Promise.all(all);
};

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.emit("welcome", "Welcome to the server");

  socket.broadcast.emit(
    "user_joined",
    `New user joined with socket id ${socket.id}`
  );

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);

    usersArray = usersArray.filter((item) => item.socketId !== socket.id);

    // RETURN NEW USERS ARRAY TO ALL EXCEPT THE ONE WHO JOINED
    socket.broadcast.emit("users-refreshed", {
      users: usersArray,
    });
  });

  socket.on("addUser", ({ userId }) => {
    console.log("User added", socket.id, userId);

    // CHECK IF USER WITH SAME ID AND SOCKET ID EXISTS
    const alreadyExist = usersArray.find(
      (item) => item.userId == userId && item.socketId == socket.id
    );

    // RETURN WITHOUT ADDING USER
    if (alreadyExist) {
      return {};
    }

    // ADD USER TO ARRAY
    usersArray.push({
      userId: userId,
      socketId: socket.id,
    });

    // RETURN NEW USERS ARRAY TO ALL EXCEPT THE ONE WHO JOINED
    io.emit("users-refreshed", {
      users: usersArray,
    });
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

  socket.on("sendMessage", async (payload) => {
    console.log("🚀 ~ socket.on ~ payload:", payload);
    const {
      sender,
      receiverId,
      message,
      inbox,
      createdAt,
      messageType,
      media,
    } = payload;

    const receiver = usersArray.filter((item) => item.userId == receiverId);
    console.log("🚀 ~ sendMessage ~ receiver:", receiver);
    const senderData = usersArray.filter((item) => item.userId == sender);
    console.log("🚀 ~ sendMessage ~ senderData:", senderData);

    const user = await getUserById(sender);
    console.log("🚀 ~ sendMessage ~ user:", user);

    if (receiver) {
      await sendToAll(
        [...getAllSocketIds(receiver), ...getAllSocketIds(senderData)],
        {
          sender,
          message,
          inbox,
          receiverId,
          user: {
            id: user?._id,
            fullName: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
            profileImage: user?.profileImage,
          },
          createdAt,
          messageType,
          media,
        }
      );
    } else {
      await sendToAll(getAllSocketIds(senderData), {
        sender,
        message,
        inbox,
        receiverId,
        user: {
          id: user?._id,
          fullName: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          profileImage: user?.profileImage,
        },
        createdAt,
        messageType,
        media,
      });
    }
  });
});
