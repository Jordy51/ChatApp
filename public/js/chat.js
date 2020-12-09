const socket = io();

// server (emit) -> client (receive) --acknowledgement--> server

// client (emit) -> server (receive) --acknowledgement--> client

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $locationURL = document.querySelector("#locationURL");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on("message", (message) => {
	console.log(message.text);
	const html = Mustache.render(messageTemplate, {
		message: message.text,
		createdAt: moment(message.createdAt).format("h:mm A"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (locationMessage) => {
	const html = Mustache.render(locationTemplate, {
		locationURL: locationMessage.locationURL,
		createdAt: moment(locationMessage.createdAt).format("h:mm A"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
	e.preventDefault();

	$messageFormButton.setAttribute("disabled", "disabled");
	// disable
	const message = e.target.elements.message.value;

	socket.emit("sendMessage", message, (error) => {
		//enable
		$messageFormButton.removeAttribute("disabled");
		$messageFormInput.value = "";
		$messageFormInput.focus();

		if (error) {
			return console.log(error);
		}
	});
});

$sendLocationButton.addEventListener("click", () => {
	if (!navigator.geolocation) {
		return alert("Geolocation is not supported by your browse.");
	}

	$sendLocationButton.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit("sendLocation", { latitude: position.coords.latitude, longitude: position.coords.longitude }, (error) => {
			if (error) {
				return console.log(error);
			}
			$sendLocationButton.removeAttribute("disabled");
		});
	});
});

socket.emit("join", { username, room });
