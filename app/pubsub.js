const PubNub = require("pubnub");

// PubNub credentials
const credentials = {
  publishKey: "pub-c-1e01c86e-fae1-4def-9663-61e93230dd04",
  subscribeKey: "sub-c-eb77abdb-6bea-4a01-a2cb-f74dd6d2487e",
  userId: "blockchain-ngma",
};

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
};

// create a pubsub class to handle the publish and subscribe functionality
class PubSub {
  constructor({ blockchain, transactionPool, wallet }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;

    this.pubnub = new PubNub(credentials);
    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
    this.pubnub.addListener(this.listener());
  }

  /**
   * @function listener
   * @description Listen for messages on the channels and handle them accordingly (replace the blockchain or add a transaction to the transaction pool). This is done to ensure that all the peers have the same blockchain and transaction pool.
   * @returns {Object} - The listener object
   */
  listener() {
    return {
      message: (messageObject) => {
        const { channel, message } = messageObject;
        console.log(
          `Message received. Channel: ${channel}. Message: ${message}`
        );

        const parsedMessage = JSON.parse(message);

        switch (channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMessage);
            break;
          case CHANNELS.TRANSACTION:
            if (
              !this.transactionPool.existingTransaction({
                inputAddress: this.wallet.publicKey,
              })
            ) {
              this.transactionPool.setTransaction(parsedMessage);
            }
            break;
          default:
            return;
        }
      },
    };
  }

  /**
   * @function publish
   * @description Publish a message to a channel. Unsubscribe and resubscribe to the channel to get the message for the current peer. This is done to prevent the current peer from receiving its own message.
   * @param {String} channel - The channel to publish the message to
   * @param {String} message - The message to publish
   */
  publish({ channel, message }) {
    // publish the message to the channel
    this.pubnub.publish({ message, channel });

    // depreciated
    // this.pubnub.unsubscribe({ channel }, () => {
    //   this.publish({ channel, message }, () => {
    //     this.pubnub.subscribe({ channel });
    //     console.log("ici");
    //   });
    // });
  }

  /**
   * @function broadcastChain
   * @description Broadcast the blockchain to all the peers in the network. This is done when a new block is mined and added to the blockchain. This is done to ensure that all the peers have the same blockchain. This is done by replacing the blockchain of the peer with the blockchain of the root node (the peer that mined the block and added it to the blockchain).
   */
  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  /**
   * @function broadcastTransaction
   * @description Broadcast the transaction to all the peers in the network. This is done when a new transaction is created. This is done to ensure that all the peers have the same transaction pool. This is done by adding the transaction to the transaction pool of the peer.
   * @param {Object} transaction - The transaction object
   * @returns {Object} - The transaction object
   */
  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = PubSub;
