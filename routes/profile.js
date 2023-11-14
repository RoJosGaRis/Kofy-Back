const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const prisma = new PrismaClient();
const router = express.Router();

const translateProfile = (user) => {
  newUser = {
    userId: user.login_id,
    names: user.names,
    lastNames: user.last_names,
    birthday: user.birthday.toISOString().split("T")[0],
    gender: user.gender,
    profilePicture: user.profile_picture,
    bloodType: user.blood_type,
    height: user.height,
    weight: user.weight,
    allergies: user.allergies,
    diseases: user.diseases,
  };

  return newUser;
};

router.post("/getProfile", validateToken, async (req, res) => {
  const { userId } = req.body;

  let existingUser;
  try {
    const existingUser = await prisma.profiles.findUnique({
      where: {
        login_id: parseInt(userId),
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    res.send(translateProfile(existingUser));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.post("/setProfile", validateToken, async (req, res) => {
  const {
    userId,
    names,
    lastNames,
    birthday,
    gender,
    profilePicture,
    bloodType,
    height,
    weight,
    allergies,
    diseases,
  } = req.body;

  let existingUser;
  try {
    const oldUser = await prisma.profiles.findUnique({
      where: {
        login_id: parseInt(userId),
      },
    });

    if (oldUser) {
      throw new Error("User already exists");
    } else {
      // var dateString = "2012-05-15";
      var year = birthday.split("-")[0];
      var month = birthday.split("-")[1];
      var day = birthday.split("-")[2];

      var birthDate = new Date(year, month - 1, day);
      // var currentDate = new Date();

      const newUser = await prisma.profiles.create({
        data: {
          login_id: parseInt(userId),
          names,
          last_names: lastNames,
          birthday: birthDate,
          gender,
          profile_picture: parseInt(profilePicture),
          blood_type: bloodType,
          height: parseInt(height),
          weight: parseFloat(weight),
          allergies,
          diseases,
        },
      });
      res.status(201).send(translateProfile(newUser));
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.put("/updateProfile", validateToken, async (req, res) => {
  try {
    const {
      userId,
      names,
      lastNames,
      birthday,
      gender,
      profilePicture,
      bloodType,
      height,
      weight,
      allergies,
      diseases,
    } = req.body;

    var year = birthday.split("-")[0];
    var month = birthday.split("-")[1];
    var day = birthday.split("-")[2];

    var birthDate = new Date(year, month - 1, day);

    const updatedUser = await prisma.profiles.update({
      where: {
        login_id: parseInt(userId),
      },
      data: {
        login_id: parseInt(userId),
        names,
        last_names: lastNames,
        birthday: birthDate,
        gender,
        profile_picture: parseInt(profilePicture),
        blood_type: bloodType,
        height: parseInt(height),
        weight: parseFloat(weight),
        allergies,
        diseases,
      },
    });

    res.status(201).send(translateProfile(updatedUser));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;
