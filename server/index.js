require('dotenv').config();
const express = require("express");
const http = require("http");
const mongoose = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const authMiddleware = require("./middleware/auth");
const User = require("./models/user");
// const { Server } = require("socket.io");

const app = express();

app.use(express.json());

const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send({ message: "Hello from PingMe backend" });
});

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/", require("./routes/message"));

// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("send_message", (data) => {
//     console.log("Message received:", data);

//     io.emit("receive_message", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// connectDB();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
