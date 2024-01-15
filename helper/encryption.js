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
  if (text.iv === undefined) {
    iv = crypto.randomBytes(16);
  } else {
    iv = crypto
      .createHash("sha256")
      .update(String(text.iv))
      .digest("base64")
      .substring(0, 16);
  }

  console.log(iv);

  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encriptionKey),
    Buffer.from(iv)
  );
  console.log("PASSED");
  let encrypted = cipher.update(text.data);
  console.log("PASSED2");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  console.log("PASSED3");
  return {
    iv: text.iv,
    data: encrypted.toString("hex"),
  };
}

// Decrypting text
function decrypt(text) {
  console.log("HERE - " + text.iv);
  let iv = crypto
    .createHash("sha256")
    .update(String(text.iv))
    .digest("base64")
    .substring(0, 16);
  console.log("HERE0.5 - " + iv);

  console.log("HERE1 - " + text.data);
  let encryptedText = Buffer.from(text.data, "hex");
  console.log("HERE2 - " + encryptedText);
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encriptionKey),
    Buffer.from(iv)
  );
  console.log("HERE3");
  let decrypted = decipher.update(encryptedText);
  console.log("HERE4 - " + decrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  console.log("HERE5 - " + decrypted);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
