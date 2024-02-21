class HttpError extends Error {
    constructor(message) {
        super(message); // (1)
        this.name = "HttpError"; // (2)
    }
}

export default HttpError;