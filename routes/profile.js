const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/getProfile", validateToken, async (req, res) => {
  const { userId } = req.body;

  let existingUser;
  try {
    const existingUser = await prisma.profiles.findUnique({
      where: {
        login_id: userId,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    res.send(existingUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
