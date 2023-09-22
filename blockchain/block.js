const hexToBinary = require("hex-to-binary");
const { GENESIS_DATA, MINE_RATE } = require("../config");
const { cryptoHash } = require("../utils");

/**
 * @class Block
 * @description Create a block with a timestamp, last hash, hash, data, nonce, and difficulty.
 */
class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.hash = hash;
  }

  /**
   * @function genesis
   * @description Create the genesis block.
   * @returns {String}
   */
  static genesis() {
    return new this(GENESIS_DATA);
  }

  /**
   * @function hash
   * @description Create a SHA-256 hash based on the inputs. The inputs are sorted to ensure the same hash is generated regardless of the order of the inputs. The hash is created using the cryptoHash function.
   * @example hash(timestamp, lastHash, data, nonce, difficulty) => "a1b2c3"
   * @returns {String}
   */
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

  /**
   * @function adjustDifficulty
   * @description Adjust the difficulty of the block based on the time it took to mine the last block and the difficulty of the last block.
   * @example adjustDifficulty({ originalBlock, timestamp }) => 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
   * @returns {Number}
   */
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
