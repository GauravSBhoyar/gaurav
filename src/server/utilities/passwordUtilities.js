const crypto = require("crypto");
const CryptoJS = require("crypto-js");

const decryptWithAES = (ciphertext) => {
  return CryptoJS.AES.decrypt(ciphertext, process.env.AES_PASSPHRASE).toString(CryptoJS.enc.Utf8);
};

const generatePassword = (password) => {
  let salt = crypto.randomBytes(32).toString("hex");
  let genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");

  return {
    cipher_text: CryptoJS.AES.encrypt(password, process.env.AES_PASSPHRASE).toString(),
    salt: salt,
    hash: genHash,
  };
};

const validatePassword = (password, hash, salt) => {
  let hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === hashVerify;
};

module.exports = {
  generatePassword,
  validatePassword,
  decryptWithAES,
};
