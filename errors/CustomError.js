class CustomError extends Error {
  constructor({ message, name, code, data }) {
    super(message);

    this.name = name;
    this.code = code;
    this.data = data;
    Error.captureStackTrace(this, CustomError);
  }
}

module.exports = CustomError;
