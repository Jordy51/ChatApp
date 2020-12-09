const socket = io();

// server (emit) -> client (receive) --acknowledgement--> server

// client (emit) -> server (receive) --acknowledgement--> client

socket.on("message", (message) => {
	console.log(message);
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
	e.preventDefault();

	const message = e.target.elements.message.value;

	socket.emit("sendMessage", message, (error) => {
		if (error) {
			return console.log(error);
		}
		console.log("Message delivered!");
	});
});

document.querySelector("#send-location").addEventListener("click", () => {
	if (!navigator.geolocation) {
		return alert("Geolocation is not supported by your browse.");
	}

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit("sendLocation", { latitude: position.coords.latitude, longitude: position.coords.longitude }, (error) => {
			if (error) {
				return console.log(error);
			}
			console.log("Location shared!");
		});
	});
});