import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Button,
  Container,
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
  // const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);

  const socket = useMemo(() => io("http://localhost:3000"), []);

  // const socket = io("http://localhost:3000");

  const onSubmitMessageHandler = (e) => {
    e.preventDefault();
    socket.emit("message", { message, room });
    setMessage("");
  };

  const onSubmitRoomNameHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    // setIsTyping(true);
    socket.emit("typing", { room });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      socket.emit("stop_typing", { room });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [message, room, socket]);

  // useEffect(() => {
  //   if (isTyping) {
  //     const timeout = setTimeout(() => {
  //       setIsTyping(false);
  //       socket.emit("stop_typing", { room });
  //     }, 5000);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [isTyping, room, socket]);
  // console.log("🚀 ~ App ~ isTyping:", isTyping);

  useEffect(() => {
    // WHEN USER CONNECTED THIS IS WHERE EVENT IS RECIEVED
    socket.on("connect", () => {
      console.log("Connected", socket.id);
      setSocketId(socket.id);
    });

    // WELCOME MSG IS RECIEVED FROM USER UPON CONNECTING
    socket.on("welcome", (msg) => {
      console.log("Message recieved:", msg);
    });

    // IF ANY OTHER USER JOIN THIS IS WHERE MSG IS RECIEVED
    socket.on("user_joined", (msg) => {
      console.log(msg);
    });

    // IF ANY OTHER USER MESSAGES, THIS IS WHERE MSG IS RECIEVED
    socket.on("message-recieved", (msg) => {
      console.log("Message recieved", msg);
      setMessages((prev) => [msg.message, ...prev]);
    });

    // IF ANY OTHER USER IS TYPING, THIS IS WHERE MSG IS RECIEVED
    socket.on("isTyping", (data) => {
      console.log("Message recieved", data);
      // setIsSomeoneTyping(data.isTyping);
      setTypingUser({ socketId: data.socketId, isTyping: data.isTyping });
    });

    // UPON UNMOUNTING
    return () => {
      console.log("UNMOUNTING....");
      // DISCONNECT SOCKET
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="sm">
      {/* <Typography variant="h1" component="div" gutterBottom>
        Welcome to Socket.io
      </Typography> */}
      <Box sx={{ height: 300 }} />
      <Typography variant="h6" component="div" gutterBottom>
        {socketId}
      </Typography>

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

      <form onSubmit={onSubmitMessageHandler}>
        <TextField
          value={message}
          // onChange={(e) => setMessage(e.target.value)}
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
  );
};

export default App;
