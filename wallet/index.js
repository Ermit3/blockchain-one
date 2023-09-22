const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash, cryptoDecimal } = require("../utils");
const Transaction = require("./transaction");

/**
 * @class Wallet
 * @description Create a wallet with a balance, public key.
 */
class Wallet {
  constructor() {
    // The balance is the amount of coins in the wallet.
    this.balance = cryptoDecimal({ amount: STARTING_BALANCE, rounded: false });
    // The key pair is used to sign data.
    this.keyPair = ec.genKeyPair();
    // The public key is used to verify that the wallet is the owner of the wallet.
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  /**
   * @function sign
   * @description Sign data using the key pair.
   * @param {String} data - The data to be signed
   * @returns {String}
   * @example sign(data) => "signature"
   */
  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }

  /**
   * @function createTransaction
   * @description Create a transaction object to store the transaction details in the blockchain. The output map will contain the sender's wallet address and the recipient's wallet address.
   * @param {Number} amount - The amount to be transferred
   * @param {String} recipient - The recipient's wallet address
   * @returns {Object} - The transaction object
   * @throws {Error} - If the amount exceeds the sender's wallet balance
   */
  createTransaction({ amount, recipient }) {
    if (amount > this.balance) throw new Error("Amount exceeds balance");
    return new Transaction({ senderWallet: this, recipient, amount });
  }
}

module.exports = Wallet;
