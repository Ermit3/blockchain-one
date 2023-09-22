const Block = require("./block");
const { cryptoHash } = require("../utils");

/**
 * @class Blockchain
 * @description Create a blockchain with a chain array. The chain array contains blocks. The first block in the chain is the genesis block. The genesis block is created using the genesis() function. The genesis block is the first block in the chain. The genesis block is hard coded. The genesis block is the same for all blockchains.
 * @example new Blockchain() => { chain: [Block] }
 */
class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  /**
   * @function addBlock
   * @description Add a block to the chain. The block is created using the mineBlock() function. The mineBlock() function takes the last block in the chain and the data to be added to the block. The mineBlock() function returns a new block. The new block is added to the chain.
   * @example addBlock({ data }) => { chain: [Block, Block] }
   * @returns null
   */
  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });
    this.chain.push(newBlock);
  }

  /**
   * @function replaceChain
   * @description Replace the chain with the incoming chain if the following conditions are met: the incoming chain is longer than the current chain, and the incoming chain is valid (contains no invalid blocks). If the incoming chain is not longer than the current chain, or the incoming chain is not valid, do not replace the chain.
   * @returns null
   */
  replaceChain(chain) {
    // check if the incoming chain is longer than the current chain
    if (chain.length <= this.chain.length) {
      console.error("The incoming chain must be longer");
      return;
    }

    // check if the incoming chain is valid (contains no invalid blocks) see isValidChain() below
    if (!Blockchain.isValidChain(chain)) {
      console.error("The incoming chain must be valid");
      return;
    }

    // if all the above conditions are met, replace the chain with the new chain
    console.log("replacing chain with", chain);
    this.chain = chain;
  }

  /**
   * @function isValidChain
   * @description Check if the chain is valid (contains no invalid blocks). The chain is valid if the following conditions are met: the first block is the genesis block, the lastHash of the current block is equal to the hash of the previous block, the hash of the current block is valid, the difficulty does not jump by more than 1. If any of the above conditions are not met, the chain is not valid.
   * @example isValidChain(chain) => true | false
   * @returns {Boolean}
   */
  static isValidChain(chain) {
    // check if the first block is the genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    // check if the lastHash of the current block is equal to the hash of the previous block
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, difficulty, nonce, data } = chain[i];
      const lastDifficulty = chain[i - 1].difficulty;

      // check if the lastHash of the current block is equal to the hash of the previous block
      if (lastHash !== chain[i - 1].hash) return false;

      const validatedHash = cryptoHash(
        timestamp,
        lastHash,
        difficulty,
        nonce,
        data
      );
      // check if the hash of the current block is valid
      if (hash !== validatedHash) return false;
      // check if the difficulty does not jump by more than 1
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
    }

    return true; // if all the above conditions are met, return true
  }
}

module.exports = Blockchain;
