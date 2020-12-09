const genereateMessage = (text) => {
	return {
		text: text,
		createdAt: new Date().getTime(),
	};
};

const genereateLocationMessage = (locationURL) => {
	return {
		locationURL: locationURL,
		createdAt: new Date().getTime(),
	};
};

module.exports = {
	genereateMessage,
	genereateLocationMessage,
};
