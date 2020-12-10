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
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild;

	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// Visible Height
	const visibleHeight = $messages.offsetHeight;

	// Height of message container
	const containerHeight = $messages.scrollHeight;

	// How far have I scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on("message", (message) => {
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format("h:mm A"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

socket.on("locationMessage", (locationMessage) => {
	const html = Mustache.render(locationTemplate, {
		username: locationMessage.username,
		locationURL: locationMessage.locationURL,
		createdAt: moment(locationMessage.createdAt).format("h:mm A"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

socket.on("roomData", ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	document.querySelector("#sidebar").innerHTML = html;
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

socket.emit("join", { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = "/";
	}
});
