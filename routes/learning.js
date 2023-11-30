const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const prisma = new PrismaClient();
const router = express.Router();

const translateCard = (element, index, fullUrl) => {
  let newElement = {
    id: index + 1,
    index: index + 1,
    content: element.content,
    imageLink: fullUrl + element.image_link,
    isVideo: element.is_video,
    videoLink: element.video_link,
  };

  return newElement;
};

router.get("/getCardCollections", async (req, res) => {
  try {
    const collections = await prisma.card_collections.findMany();
    let fullUrl = "https://" + req.get("host") + "/images";

    collections.forEach((element) => {
      currIcon = element.icon;
      element.icon = fullUrl + element.icon;
    });

    res.send(collections);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});
router.post("/getCardCollections", async (req, res) => {
  try {
    id = req.body.id;
    let type = req.body.cardType;

    let fullUrl = "https://" + req.get("host") + "/images";

    let cards;
    let typeBool = type == 1;

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
      cards[index] = translateCard(element, index, fullUrl);
    });

    res.json(cards);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/editCard", validateToken, async (req, res) => {
  try {
    let card_collection = req.body.card_collection;
    let card_index = req.body.index;

    const updateCard = await prisma.cards.update({
      where: {
        id: id,
      },
      data: {
        index: req.body.index,
        content: req.body.content,
        imageLink: req.body.image_link,
        isVideo: req.body.is_video,
        videoLink: req.body.video_link,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
