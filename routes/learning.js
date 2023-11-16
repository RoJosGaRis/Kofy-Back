const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const prisma = new PrismaClient();
const router = express.Router();

const translateCard = (element, fullUrl) => {
  let newElement = {
    id: element.index,
    index: element.index,
    content: element.content,
    imageLink: fullUrl + element.image_link,
    isVideo: element.is_video,
    videoLink: element.video_link,
  };

  return newElement;
};

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
router.post("/getCardCollections", async (req, res) => {
  id = req.body.id;
  let type = req.body.cardType;

  let fullUrl = "https://" + req.get("host") + "/images";

  let cards;
  let typeBool = type == 1;

  console.log(typeBool);

  if (type != 0) {
    cards = await prisma.cards.findMany({
      where: {
        collection_index: parseInt(id),
        OR: [
          {
            index: 1,
          },
          {
            is_video: typeBool,
          },
        ],
      },
      select: {
        id: true,
        index: true,
        content: true,
        is_video: true,
        video_link: true,
        image_link: true,
      },
      orderBy: {
        index: "asc",
      },
    });
  } else {
    cards = await prisma.cards.findMany({
      where: {
        collection_index: parseInt(id),
      },
      select: {
        id: true,
        index: true,
        content: true,
        is_video: true,
        video_link: true,
        image_link: true,
      },
      orderBy: {
        index: "asc",
      },
    });
  }

  cards.forEach((element, index) => {
    cards[index] = translateCard(element, fullUrl);
    // console.log(fullUrl + element.icon);
  });

  res.json(cards);
});

module.exports = router;
