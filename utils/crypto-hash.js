const crypto = require("crypto");

/**
 * @function cryptoHash
 * @returns {String}
 * @description Create a SHA-256 hash based on the inputs. The inputs are sorted to ensure the same hash is generated regardless of the order of the inputs.
 * @example cryptoHash("one", "two", "three") => "a1b2c3"
 */
const cryptoHash = (...inputs) => {
  const hash = crypto.createHash("SHA256");

  hash.update(
    inputs
      .map((input) => JSON.stringify(input))
      .sort()
      .join(" ")
  ); // sort the inputs to ensure the same hash is generated regardless of the order of the inputs and join the inputs into a single string

  return hash.digest("hex"); // return the hash in hexadecimal format
};

module.exports = cryptoHash;
