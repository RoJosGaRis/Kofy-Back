const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  const { username, email, password, type } = req.body;
  try {
    const oldUser = await prisma.logins.findUnique({
      where: {
        email: email,
      },
    });

    if (oldUser) {
      throw new Error("User already exists");
    }

    bcrypt
      .genSalt(Number(process.env.SALT_ROUNDS))
      .then((salt) => {
        return bcrypt.hash(password, salt);
      })
      .then(async (hash) => {
        newUser = await prisma.logins.create({
          data: {
            username,
            email: email.toLowerCase(),
            password: hash,
            type: Number(type),
          },
        });

        const token = jwt.sign(
          { user_id: newUser.id, email },
          process.env.TOKEN_KEY,
          { expiresIn: "2m" }
        );
        res.status(201).send({ token: token, userId: newUser.id });
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    const existingUser = await prisma.logins.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      throw new Error("Credentials do not match");
    }

    let token;
    try {
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        process.env.TOKEN_KEY,
        { expiresIn: "2m" }
      );
    } catch (err) {
      console.log(err);
      throw new Error("Error! Something went wrong.");
    }
    res.status(201).json({
      userId: existingUser.id,
      token: token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// router.post("/profile", validateToken, async (req, res) => {
//   user = await prisma.logins.findUnique({
//     where: {
//       id: Number(req.body.userId),
//     },
//   });

//   res.status(201).json({
//     success: true,
//     data: {
//       userId: user.userId,
//       email: user.email,
//     },
//   });
// });

module.exports = router;
