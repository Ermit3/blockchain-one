const { v1: uuidv1 } = require("uuid");
const { verifySignature, cryptoDecimal } = require("../utils");

/**
 * Transaction class
 * @description Transaction class to create a transaction object
 */
class Transaction {
  constructor({ senderWallet, recipient, amount }) {
    this.id = uuidv1();
    this.outputMap = this.createOutputMap({
      senderWallet,
      recipient,
      amount: cryptoDecimal({ amount, rounded: false }),
    });
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  /**
   * @function createOutputMap
   * @description Create output map for transaction object to store the transaction details in the blockchain. The output map will contain the sender's wallet address and the recipient's wallet address.
   * @param {Object} senderWallet - The sender's wallet object
   * @param {String} recipient - The recipient's wallet address
   * @param {Number} amount - The amount to be transferred
   * @returns {Object} - The output map object
   */
  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};

    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = cryptoDecimal({
      amount: senderWallet.balance - amount,
      rounded: true,
    });
    return outputMap;
  }

  /**
   * @function createInput
   * @description Create input for transaction object to store the transaction details in the blockchain. The input will contain the sender's wallet address, the sender's wallet balance, the timestamp and the signature.
   * @param {Object} senderWallet - The sender's wallet object
   * @param {Object} outputMap - The output map object
   * @returns {Object} - The input object
   */
  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }

  /**
   * @function update
   * @description Update the transaction object with the new transaction details in the blockchain. The output map will contain the sender's wallet address and the recipient's wallet address.
   * @param {Object} senderWallet - The sender's wallet object
   * @param {String} recipient - The recipient's wallet address
   * @param {Number} amount - The amount to be transferred
   * @returns {Object} - The output map object
   * @throws {Error} - If the amount exceeds the sender's wallet balance
   */
  update({ senderWallet, recipient, amount }) {
    // Check if the amount exceeds the sender's wallet balance
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error("Amount exceeds balance");
    }

    // Check if the recipient's wallet address is already in the output map. If not, add the recipient's wallet address and the amount to the output map. If yes, add the amount to the recipient's wallet address in the output map.
    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    // Deduct the amount from the sender's wallet address in the output map
    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    // Update the input with the new sender's wallet address, the new sender's wallet balance, the timestamp and the signature
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  /**
   * @function validTransaction
   * @description Validate the transaction object with the new transaction details in the blockchain. The output map will contain the sender's wallet address and the recipient's wallet address.
   * @param {Object} transaction - The transaction object
   * @returns {Boolean} - The boolean value to indicate if the transaction is valid
   */
  static validTransaction(transaction) {
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce(
      (total, outputAmount) => total + outputAmount
    );

    // Check if the amount is not equal to the output total
    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    // Check if the signature is valid
    if (
      !verifySignature({
        publicKey: address,
        data: outputMap,
        signature: signature,
      })
    ) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }
}

module.exports = Transaction;
