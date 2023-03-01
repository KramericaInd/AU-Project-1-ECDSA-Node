import { useState } from "react";
import server from "./server";

import * as secp from 'ethereum-cryptography/secp256k1';
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    //generate a messageHash (recipient+parseInt(sendAmount)) and then a signature to POST to index.js
    //then on index.js generate a matching messageHash to verify
    const messageHash = toHex(keccak256(utf8ToBytes(recipient+parseInt(sendAmount))));
    const [sigArr, recoveryBit] = await secp.sign(messageHash, privateKey,{ recovered: true});
    const signature = toHex(sigArr);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        messageHash: messageHash,
        signature: signature,
        recoveryBit: recoveryBit,
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, the recipient's full public key"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>



      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
