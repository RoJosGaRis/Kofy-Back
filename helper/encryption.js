const crypto = require("crypto");
const keyText = process.env.encriptionKey;
const encriptionKey = crypto
  .createHash("sha256")
  .update(String(keyText))
  .digest("base64")
  .substring(0, 32);

const ivText = process.env.encriptionIv;
const encriptionIv = crypto
  .createHash("sha256")
  .update(String(ivText))
  .digest("base64")
  .substring(0, 16);

//Encrypting text
function encrypt(text) {
  let iv;
  // if (text.iv === " ") {
  iv = crypto.randomBytes(16);
  // } else {
  // iv = Buffer.from(process.env.IVKEY, "hex");
  // }
  // let iv = Buffer.from(text.iv, "hex");

  console.log(iv);

  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encriptionKey),
    iv
  );
  let encrypted = cipher.update(text.data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString("hex"),
    data: encrypted.toString("hex"),
  };
}

// Decrypting text
function decrypt(text) {
  let iv = text.substring(0, 32);
  console.log("Hare - " + iv);
  iv = Buffer.from(iv, "hex");
  console.log("HERE - " + iv);
  let encryptedText = text.substring(32);
  encryptedText = Buffer.from(encryptedText, "hex");
  console.log("HERE2 - " + encryptedText);
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encriptionKey),
    iv
  );
  console.log("HERE3");
  let decrypted = decipher.update(encryptedText);
  console.log("HERE4 - " + decrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  console.log("HERE5 - " + decrypted);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
