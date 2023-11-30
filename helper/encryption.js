const crypto = require("crypto");
const keyText = process.env.encriptionKey;
const encriptionKey = crypto
  .createHash("sha256")
  .update(String(keyText))
  .digest("base64")
  .substring(0, 32);

// const ivText = process.env.encriptionIv;
// const encriptionIv = crypto
//   .createHash("sha256")
//   .update(String(ivText))
//   .digest("base64")
//   .substring(0, 16);

//Encrypting text
function encrypt(text) {
  if (text.iv === " ") {
    text.iv = crypto.randomBytes(16);
  } else {
    text.iv = Buffer.from(text.iv, "hex");
  }

  console.log(text.iv);

  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encriptionKey),
    text.iv
  );
  let encrypted = cipher.update(text.data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: text.iv.toString("hex"),
    data: encrypted.toString("hex"),
  };
}

// Decrypting text
function decrypt(text) {
  let iv = Buffer.from(text.iv, "hex");
  console.log("HERE - " + Buffer.from(text.iv, "hex"));
  let encryptedText = Buffer.from(text.data, "hex");
  console.log("HERE2");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encriptionKey),
    iv
  );
  console.log("HERE3");
  let decrypted = decipher.update(encryptedText);
  console.log("HERE4");
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  console.log("HERE5");
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
