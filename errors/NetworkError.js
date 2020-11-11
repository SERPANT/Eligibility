const CustomError = require('./CustomError');

/**
 * Error class for Network error.
 */
class NetworkError extends CustomError {
  /**
   * Constructor of NetworkError.
   *
   * @param {Object} error
   * @param {String} error.message
   * @param {String} error.details
   * @param {Number} error.code
   */
  constructor({ message = '', details = '', code = 500 }) {
    super(message);
    this.details = details;
    this.code = code;
  }
}

module.exports = NetworkError;
