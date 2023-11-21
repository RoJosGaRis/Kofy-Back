const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const validateToken = require("../helper/validateToken");
const multer = require("multer");

const prisma = new PrismaClient();
const router = express.Router();

let fs = require("fs-extra");
const validateToken = require("../helper/validateToken");

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
  try {
    let collections = await prisma.card_collections.findMany();
    let newCollections = [];
    let fullUrl = "https://" + req.get("host") + "/images";

    for (let index = 0; index < collections.length; index++) {
      currIcon = collections[index].icon;
      collections[index].icon = fullUrl + collections[index].icon;
      // console.log("COllECTION: " + element);

      const collection_cards = await prisma.cards.findMany({
        where: {
          collection_index: collections[index].id,
        },
        orderBy: {
          index: "asc",
        },
      });

      // console.log("Element ID" + element.id);
      // console.log(collection_cards);

      let newElement = {
        ...collections[index],
        cards: collection_cards,
      };

      // console.log(newElement);
      collections[index] = newElement;
      // console.log(collections[index]);
      // console.log(fullUrl + element.icon);
    }
    // console.log(newCollections);
    res.send(collections);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/updateCard", validateToken, async (req, res) => {
  try {
    let queryId = req.body.id;

    const queryCard = await prisma.cards.update({
      where: {
        id: parseInt(queryId),
      },
      data: {
        content: req.body.content,
        is_video: req.body.is_video === "true" ? true : false,
        video_link: req.body.video_link,
        image_link: req.body.image_link,
      },
    });

    res.send(queryCard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

/*
Tarjetas

- Obtener >  info de todas tarjetas
- Editar >  Info de tarjetas TODO
- Crear una tarjeta nueva TODO

Crear una cuenta administrador

- nombre, apellido, edad, correo, usuario, contraseña, celular, calle, código postal, ciudad - TODO

Información de administradores

- Obtener > info de los usuarios administradores  - TODO

Informacion usuario

- Editar y obtener > Sesion de escucha - TODO
- Editar y obtener > Cita medica - TODO
- Obtener > Info usuario (peso, estatura, enfermedades, etc) - TODO
*/
