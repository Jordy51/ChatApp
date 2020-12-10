const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { genereateMessage, genereateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");
const { Console } = require("console");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

console.log(process.env.PORT)
const PORT = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.json());
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
	console.log("New WebSocket connection");

	// Rooms
	// socket.on("join", ({ username, room }, callback) => {
	// 	const { error, user } = addUser({ id: socket.id, username, room });
	socket.on("join", (options, callback) => {
		const { error, user } = addUser({ id: socket.id, ...options });

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit("message", genereateMessage("Admin", "Welcome!"));
		socket.broadcast.to(user.room).emit("message", genereateMessage("Admin", `${user.username} has joined!`));
		io.to(user.room).emit("roomData", {
			room: user.room,
			users: getUsersInRoom(user.room),
		});
		callback();
		// socket.emit, socket.io, socket.broadcast.emit
		//io.to.emit, socket.broadcast.to.exit
	});

	// Messages
	socket.on("sendMessage", (message, callback) => {
		const filter = new Filter();
		const user = getUser(socket.id);
		if (filter.isProfane(message)) {
			return callback("Profanity is not allowed!");
		}
		io.to(user.room).emit("message", genereateMessage(user.username, message));
		callback();
	});

	// Location
	socket.on("sendLocation", (coords, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit("locationMessage", genereateLocationMessage(user.username, `https://google.com/maps?q=${coords.longitude},${coords.latitude}`));

		if (coords === {}) {
			return callback("Location not shared!");
		}
		callback();
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit("message", genereateMessage(`${user.username} has left!`));
			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

server.listen(PORT, () => {
	console.log("Server is up on port " + PORT);
});
