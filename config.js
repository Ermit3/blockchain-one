// Initialize the genesis block with the following data

const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  timestamp: 1,
  lastHash: "-----",
  hash: "hash-one",
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [],
};

const STARTING_BALANCE = 10;
const MAX_DECIMAL = 8;

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE, MAX_DECIMAL };
