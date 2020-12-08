const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.json());
app.use(express.static(publicDirectoryPath));

app.get("/", () => {
	app.render("index.html");
});

app.listen(PORT, () => {
	console.log("Server is up on port " + PORT);
});
