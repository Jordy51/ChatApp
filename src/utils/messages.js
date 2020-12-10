const genereateMessage = (username, text) => {
	return {
		username,
		text: text,
		createdAt: new Date().getTime(),
	};
};

const genereateLocationMessage = (username, locationURL) => {
	return {
		username,
		locationURL,
		createdAt: new Date().getTime(),
	};
};

module.exports = {
	genereateMessage,
	genereateLocationMessage,
};
