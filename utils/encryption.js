const CryptoJS = require('crypto-js');
const encryptionKey = process.env.ENCRYPTION_KEY;

// Encrypt a string
function encrypt(text) {
  return CryptoJS.AES.encrypt(text, encryptionKey).toString();
}

// Decrypt a string
function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = { encrypt, decrypt };
