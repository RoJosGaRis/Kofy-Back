const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");
const { route } = require("./learning");

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

router.post("/getDoctors", validateToken, async (req, res) => {
  try {
    let loginId = req.body.userId;
    console.log(loginId);

    const profile = await prisma.profiles.findUnique({
      where: {
        login_id: parseInt(loginId),
      },
    });

    let id = profile.id;

    const doctores = await prisma.doctores.findMany({
      where: {
        user_id: parseInt(id),
      },
    });

    doctores.forEach((doctor, index) => {
      const newDoctor = {
        id: doctor.id,
        doctorName: doctor.doctor_name,
        doctorFocus: doctor.doctor_focus,
        doctorPhone: doctor.doctor_phone,
        doctorEmail: doctor.doctor_email,
      };

      doctores[index] = newDoctor;
    });

    res.status(200).send(doctores);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/createDoctor", validateToken, async (req, res) => {
  try {
    let doctor_id = req.body.id;

    const updatedDoctor = await prisma.doctores.update({
      where: {
        id: parseInt(doctor_id),
      },
      data: {
        doctor_name: req.body.doctorName,
        doctor_focus: req.body.doctorFocus,
        doctor_phone: req.body.doctorPhone,
        doctor_email: req.body.doctorEmail,
      },
    });

    const translatedDoctor = {
      id: updatedDoctor.id,
      doctorName: updatedDoctor.doctor_name,
      doctorFocus: updatedDoctor.doctor_focus,
      doctorPhone: updatedDoctor.doctor_phone,
      doctorEmail: updatedDoctor.doctor_email,
    };

    res.status(200).send(translatedDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/createDoctor", validateToken, async (req, res) => {
  try {
    let profileId = req.body.userId;

    const profile = await prisma.profiles.findUnique({
      where: {
        login_id: parseInt(profileId),
      },
    });

    let id = profile.id;

    const newDoctor = await prisma.doctores.create({
      data: {
        user_id: parseInt(id),
        doctor_name: req.body.doctorName,
        doctor_focus: req.body.doctorFocus,
        doctor_phone: req.body.doctorPhone,
        doctor_email: req.body.doctorEmail,
      },
    });

    const translatedDoctor = {
      id: newDoctor.id,
      doctorName: newDoctor.doctor_name,
      doctorFocus: newDoctor.doctor_focus,
      doctorPhone: newDoctor.doctor_phone,
      doctorEmail: newDoctor.doctor_email,
    };

    res.status(200).send(translatedDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
