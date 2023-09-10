const crypto = require("crypto");

// function to generate a hash using the sha-256 algorithm
const cryptoHash = (...inputs) => {
  const hash = crypto.createHash("SHA256");

  hash.update(inputs.sort().join(" ")); // sort the inputs to ensure the same hash is generated regardless of the order of the inputs

  return hash.digest("hex"); // return the hash in hexadecimal format
};

module.exports = cryptoHash;
