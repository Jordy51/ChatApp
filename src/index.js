const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.json());
app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on("connection", (socket) => {
	console.log("New WebSocket connection");

	socket.emit("message", "Welcome!");

	socket.broadcast.emit("message", "A new user has joined!");

	socket.on("sendMessage", (message) => {
		io.emit("message", message);
	});

	socket.on("disconnect", () => {
		io.emit("message", "A user has left!")
	});

	// socket.emit("countUpdated", count);

	// socket.on("increment", () => {
	// 	count++;
	// 	// socket.emit("countUpdated", count);
	// 	io.emit("countUpdated", count);
	// });
});

server.listen(PORT, () => {
	console.log("Server is up on port " + PORT);
});
