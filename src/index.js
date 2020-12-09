const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { genereateMessage, genereateLocationMessage } = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.json());
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
	console.log("New WebSocket connection");

	socket.on("join", ({ username, room }) => {
		socket.join(room);

		socket.emit("message", genereateMessage("Welcome!"));
		socket.broadcast.to(room).emit("message", genereateMessage(`${username} has joined!`));

		// socket.emit, socket.io, socket.broadcast.emit
		//io.to.emit, socket.broadcast.to.exit
	});

	socket.on("sendMessage", (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback("Profanity is not allowed!");
		}
		io.to("LLO").emit("message", genereateMessage(message));
		callback();
	});

	socket.on("sendLocation", (coords, callback) => {
		io.emit("locationMessage", genereateLocationMessage(`https://google.com/maps?q=${coords.longitude},${coords.latitude}`));

		if (coords === {}) {
			return callback("Location not shared!");
		}
		callback();
	});

	socket.on("disconnect", () => {
		io.emit("message", genereateMessage("A user has left!"));
	});
});

server.listen(PORT, () => {
	console.log("Server is up on port " + PORT);
});
