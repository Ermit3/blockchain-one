const Block = require("./block");
const cryptoHash = require("./crypto-hash");

// create a blockchain class
class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  // function to add a block to the chain
  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });
    this.chain.push(newBlock);
  }

  // function to replace the chain with the new chain
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

  // Verify the chain contain no invalid blocks
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
