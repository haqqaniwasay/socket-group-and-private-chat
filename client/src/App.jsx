import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Button,
  Container,
  Grid,
  ListItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const App = () => {
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [roomName, setRoomName] = useState("");
  const [socketId, setSocketId] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState({});
  const [userId, setUserId] = useState("");
  const [isUserSaved, setIsUserSaved] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  // const [selectedUser,setSelectedUser] = useState('')

  const socket = useMemo(() => io("http://localhost:3000"), []);

  const onSubmitMessageHandler = (e) => {
    e.preventDefault();
    // socket.emit("message", { message, room });
    socket.emit("sendMessage", {
      receiverId: room,
      sender: userId,
      message: "hi dear",
      inbox: "123",
      createdAt: new Date().toISOString(),
      messageType: "txt",
    });
    setMessage("");
  };

  const onSubmitRoomNameHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", { room });
  };

  const handleAddUser = (e) => {
    setIsUserSaved(true);
    socket.emit("addUser", { userId });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      socket.emit("stop_typing", { room });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [message, room, socket]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected", socket.id);
      setSocketId(socket.id);
    });

    socket.on("welcome", (msg) => {
      console.log("Message recieved:", msg);
    });

    socket.on("users-refreshed", (payload) => {
      console.log("USERS ARRAY", payload);
      setActiveUsers(payload.users);
    });

    socket.on("message-recieved", (msg) => {
      console.log("Message recieved", msg);
      setMessages((prev) => [msg.message, ...prev]);
    });

    socket.on("isTyping", (data) => {
      console.log("isTyping recieved", data);
      setTypingUser({ socketId: data.socketId, isTyping: data.isTyping });
    });

    return () => {
      console.log("UNMOUNTING....");
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Container style={{ height: "100vh" }}>
            <Typography variant="h6" component="div" gutterBottom>
              USERS ACTIVE
            </Typography>

            {activeUsers?.map((u, i) => {
              return (
                <Typography
                  onClick={(e) => setRoom(e.target.textContent)}
                  variant="h6"
                  key={i}
                  component="div"
                  gutterBottom
                  style={{
                    color: room === u.userId ? "green" : "black",
                  }}
                >
                  {u.userId}
                </Typography>
              );
            })}
          </Container>
        </Grid>
        <Grid item xs={8}>
          <Container maxWidth="lg">
            {/* <Box sx={{ height: 100 }} /> */}
            <Typography variant="h6" component="div" gutterBottom>
              {socketId}
            </Typography>
            <Box sx={{ height: 100 }} />

            <form onSubmit={onSubmitRoomNameHandler}>
              <h5>Join room</h5>
              <TextField
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                id="outlined-basic"
                label="Room Name"
                variant="outlined"
              />
              <Button type="submit" variant="contained" color="primary">
                Join
              </Button>
            </form>
            {!isUserSaved ? (
              <form onSubmit={handleAddUser}>
                <h5>Add UserId</h5>
                <TextField
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  id="outlined-basic"
                  label="User Id"
                  variant="outlined"
                />
                <Button type="submit" variant="contained" color="primary">
                  ADD
                </Button>
              </form>
            ) : (
              <Typography variant="h6" component="div" gutterBottom>
                User ID: {userId}
              </Typography>
            )}

            <form onSubmit={onSubmitMessageHandler}>
              <TextField
                value={message}
                onChange={handleTyping}
                id="outlined-basic"
                label="Message"
                variant="outlined"
              />
              <TextField
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                id="outlined-basic"
                label="Room"
                variant="outlined"
              />
              <Button type="submit" variant="contained" color="primary">
                Send
              </Button>
            </form>

            <Stack>
              {typingUser.isTyping && (
                <Typography variant="h6" component="div" gutterBottom>
                  {typingUser.socketId} is typing...
                </Typography>
              )}
              {messages?.map((m, i) => {
                return (
                  <Typography key={i} variant="h6" component="div" gutterBottom>
                    {m}
                  </Typography>
                );
              })}
            </Stack>
          </Container>
        </Grid>
      </Grid>
    </div>
  );
};

export default App;
