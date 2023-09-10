const hexToBinary = require("hex-to-binary");
const { GENESIS_DATA, MINE_RATE } = require("./config");
const cryptoHash = require("./crypto-hash");

// create a block class
class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.hash = hash;
  }

  // function to create the genesis block (the first block in the chain)
  static genesis() {
    return new this(GENESIS_DATA);
  }

  // function to mine a block
  static mineBlock({ lastBlock, data }) {
    const lastHash = lastBlock.hash;
    let hash, timestamp;
    let { difficulty } = lastBlock;
    let nonce = 0;

    // repeat the hashing process until the hash of the block starts with the required number of zeros
    do {
      nonce++; // increment the nonce (the nonce is a number that can only be used once)
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({
        originalBlock: lastBlock,
        timestamp,
      }); // adjust the difficulty of the block (see function below)
      hash = cryptoHash(timestamp, lastHash, data, difficulty, nonce);
    } while (
      hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
    );

    return new this({ timestamp, lastHash, data, difficulty, nonce, hash });
  }

  // function to adjust the difficulty of the block
  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;

    // if the difficulty is less than 1, return 1
    if (difficulty < 1) return 1;

    // if it take too long to mine a block, decrease the difficulty
    if (timestamp - originalBlock.timestamp > MINE_RATE) return difficulty - 1;

    // if it too short to mine a block, increase the difficulty
    return difficulty + 1;
  }
}

module.exports = Block;
