const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/getCardCollections", async (req, res) => {
  const collections = await prisma.card_collections.findMany();
  let fullUrl = req.protocol + "://" + req.get("host") + "/images";

  collections.forEach((element) => {
    currIcon = element.icon;
    element.icon = fullUrl + element.icon;
    // console.log(fullUrl + element.icon);
  });

  res.send(collections);
});
router.post("/getCardCollections", async (req, res) => {
  id = req.body.id;

  const collections = await prisma.card_collections.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  res.send(collections);
});

module.exports = router;
