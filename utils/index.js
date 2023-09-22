const EC = require("elliptic").ec;
const { default: Decimal } = require("decimal.js");
const { MAX_FLOAT, MAX_DECIMAL } = require("../config");
const cryptoHash = require("./crypto-hash");

const ec = new EC("secp256k1");

/**
 * @function verifySignature
 * @returns {Boolean}
 * @description Verify a signature using the public key and data that was signed. How it works: the public key is used to create a key object. The key object has a verify method that takes the data that was signed and the signature. The verify method returns a boolean.
 * @example verifySignature({ publicKey, data, signature }) => true | false
 */
const verifySignature = ({ publicKey, data, signature }) => {
  // keyFromPublic is a method of the ec object. It takes the public key and the format of the public key. The format is hex.
  const keyFromPublic = ec.keyFromPublic(publicKey, "hex");
  return keyFromPublic.verify(cryptoHash(data), signature);
};

/**
 * @function cryptoDecimal
 * @description Convert a amount to a decimal with a maximum of {MAX_DECIMAL} decimal places
 * @param {amount} amount - The amount to be converted to a decimal
 * @returns {Decimal} - The decimal amount
 */
const cryptoDecimal = ({ amount, rounded }) => {
  const multiplier = parseInt(`1${"0".repeat(MAX_DECIMAL)}`);
  // if rounded is true, round the amount to the nearest decimal place.
  if (rounded === true) {
    return parseFloat(Decimal.round(amount * multiplier) / multiplier);
  }
  return parseFloat(Decimal.floor(amount * multiplier) / multiplier);
};

module.exports = { ec, verifySignature, cryptoHash, cryptoDecimal };
