const Blockchain = require("./blockchain");

const blockchain = new Blockchain();

blockchain.addBlock({ data: ["initial", "double penguin"] });
console.log("first block", blockchain.chain[blockchain.chain.length - 1]);

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for (let i = 0; i < 10000; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

  // add a new block to the chain
  blockchain.addBlock({ data: `block ${i}` });
  nextBlock = blockchain.chain[blockchain.chain.length - 1];

  // check the time difference between the previous block and the current block
  nextTimestamp = nextBlock.timestamp;
  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);

  // calculate the average time difference
  average = times.reduce((total, num) => total + num) / times.length;

  // log the time difference and the average time difference
  console.log(
    `Time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average}ms`
  );
}
