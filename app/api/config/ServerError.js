class ServerError extends Error {
	constructor(message, status, statusCode) {
		super(message);
		this.statusCode = statusCode || 500;
		this.status = status || 'Unknown error';
	}
}

module.exports = ServerError;