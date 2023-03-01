
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

function getAddress(publicKey) {
	//first byte indicates compression
	return keccak256(publicKey.slice(1)).slice(-20);
}

const privateKey = secp.utils.randomPrivateKey();
const publicKey = secp.getPublicKey(privateKey);
const publicAddress =  toHex(getAddress(publicKey));

console.log('private key:', toHex(privateKey));
console.log('public key:', toHex(publicKey));
console.log('address:', publicAddress);

