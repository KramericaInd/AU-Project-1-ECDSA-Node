const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const balances = {
  "04821772909ec4b3f7279cab1ac8b11188f33ae367856f7b6a92bea39995a4f34cff42a86a4edcc038b9954a1b2c38de867273b9043e3a23bb324d3a24ecfebe32": 100,
  "04cd5025b6ac46e89d9de9fc630422a1a400dc0970b2711a820e0865c58182969b7bc41815442e9fd6ead1f39f60124805bc61de253c840a9dc2bcea8a4cb5b9e4": 50,
  "046acb8d7b446a137fd6463c0e710e2e3e0c85d99823c76f23a4222f15a046aac9018d7314caf655b03f0f50e40bd4a4588c62bcc4ee17004e842cf7677cdf554e": 75,
};

/*
Some randomly generated keys for testing
private key: 87a7c1369f67081f7ad6585c059222997b67e544d8d9bcea719b5ca372dc8c8f
public key: 04821772909ec4b3f7279cab1ac8b11188f33ae367856f7b6a92bea39995a4f34cff42a86a4edcc038b9954a1b2c38de867273b9043e3a23bb324d3a24ecfebe32
address: 53cadc190844ca673964843196fb7656588cba7b

private key: b093b21879a69d84064e7352a7b56eb7e529f17f38dce4a32e7e981ae5d9ed99
public key: 04cd5025b6ac46e89d9de9fc630422a1a400dc0970b2711a820e0865c58182969b7bc41815442e9fd6ead1f39f60124805bc61de253c840a9dc2bcea8a4cb5b9e4
address: 43a072e7ca4c9bade3dc63177cd76cf765be7fec

private key: f5b5e3375ed061275fcd4ed0d6f083c0473856f73d69b1aef8ce969c2e60678b
public key: 046acb8d7b446a137fd6463c0e710e2e3e0c85d99823c76f23a4222f15a046aac9018d7314caf655b03f0f50e40bd4a4588c62bcc4ee17004e842cf7677cdf554e
address: 35ab5206c4f5a24457c0defe1bb6f076ff5fab74
*/

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { messageHash, signature, recoveryBit, sender, recipient, amount } = req.body;
  // messageHash and signature are hex strings
  const expectedMessageHash = toHex(keccak256(utf8ToBytes(recipient+amount)));
  const publicKey = toHex(secp.recoverPublicKey(messageHash, signature, recoveryBit));

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    if (expectedMessageHash === messageHash) {
      if (publicKey === sender) {
        balances[sender] -= amount;
        balances[recipient] += amount;
        res.send({ balance: balances[sender] });
      } else {
        res.status(400).send({ message: "derived publicKey does not match posted sender, transaction cancelled! publicKey: " + publicKey + " sender: " + sender});
      }
    } else {
      res.status(400).send({ message: "messageHash mismatch transaction cancelled!" });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
