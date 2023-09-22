/**
 * @class TransactionPool
 * @description The transaction pool contains all the transactions that are yet to be added to the blockchain. The transaction pool is used to prevent double spending.
 */
class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  /**
   * @function setTransaction
   * @description Set a transaction in the transaction pool using the transaction id as the key and the transaction object as the value.
   * @param {Object} transaction - The transaction object
   */
  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  setMap(transactionMap) {
    this.transactionMap = transactionMap;
  }

  /**
   * @function existingTransaction
   * @description Check if a transaction exists in the transaction pool. If it does, return the transaction.
   * @param {String} inputAddress - The sender's wallet address
   * @returns {Object} - The transaction object
   */
  existingTransaction({ inputAddress }) {
    const transactions = Object.values(this.transactionMap);
    return transactions.find(
      (transaction) => transaction.input.address === inputAddress
    );
  }
}

module.exports = TransactionPool;
