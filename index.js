const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet");

const app = express();

// create a blockchain instance
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, wallet });

// Port number for the root node of the blockchain network
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

/**
 * @description: get the blockchain
 */
app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

/**
 * @description: mine a block and add it to the blockchain
 */
app.post("/api/mine", (req, res) => {
  const { data } = req.body;

  // add a block to the blockchain
  blockchain.addBlock({ data });
  // broadcast the updated blockchain to all the peers
  pubsub.broadcastChain();

  // redirect to the blockchain page
  res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
  const { amount, recipient } = req.body;

  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });

  // check if the transaction already exists in the transaction pool
  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }

  // add the transaction to the transaction pool
  transactionPool.setTransaction(transaction);

  pubsub.broadcastTransaction(transaction);

  // broadcast the transaction to all the peers
  res.json({ type: "success", transaction });
});

app.get("/api/transaction-pool-map", (req, res) => {
  res.json(transactionPool.transactionMap);
});

/**
 * @description: sync the blockchain with the root node. This is done when a new peer joins the network or when a peer mines a new block and adds it to the blockchain. This is done to ensure that all the peers have the same blockchain. This is done by replacing the blockchain of the peer with the blockchain of the root node
 */
syncWithRootState = () => {
  // get the blockchain from the root node and replace the chain with the root node's chain
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
    (error, response, body) => {
      // check if the response is valid and the status code is 200. If yes, replace the chain with the root node's chain
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
        console.log("replace chain on a sync with", rootChain);
        blockchain.replaceChain(rootChain);
      }
    }
  );

  request(
    { url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);

        console.log(
          "replace transaction pool map on a sync with",
          rootTransactionPoolMap
        );
        transactionPool.setMap(rootTransactionPoolMap);
      }
    }
  );
};

// run the server
let PEER_PORT;
// check if the environment variable is set to true and generate a random port number
if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

// run the server on the port number specified in the environment variable or the default port number
const PORT = PEER_PORT || DEFAULT_PORT;
/**
 * @description: start the server on the specified port number
 */
app.listen(PORT, () => {
  console.log(`listening at localhost : ${PORT}`);

  if (PORT !== DEFAULT_PORT) syncWithRootState();
});
