const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const validateToken = require("../helper/validateToken");
const multer = require("multer");

const prisma = new PrismaClient();
const router = express.Router();

let fs = require("fs-extra");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderName = req.params.folder || "";
    const destination = `./images/${folderName}`;
    fs.mkdirsSync(destination);
    cb(null, destination);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

let upload = multer({ storage: storage });

router.post(
  "/uploadImage/:folder",
  upload.single("image"),
  async (req, res) => {
    res.json({
      success: true,
      image: req.file,
    });
  }
);

router.get("/getCardCollections", async (req, res) => {
  const collections = await prisma.card_collections.findMany();
  let fullUrl = "https://" + req.get("host") + "/images";

  collections.forEach((element) => {
    currIcon = element.icon;
    element.icon = fullUrl + element.icon;
    // console.log(fullUrl + element.icon);
  });

  res.send(collections);
});

module.exports = router;
