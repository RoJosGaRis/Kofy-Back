const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const router = express.Router();
const prisma = new PrismaClient();

const tokenExpirationTime = "7d";

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, type } = req.body;
    // const oldUser = await prisma.logins.findUnique({
    //   where: {
    //     email: email,
    //   },
    // });

    // if (oldUser) {
    //   throw new Error("User already exists");
    // }
    bcrypt
      .genSalt(10)
      .then((salt) => {
        return bcrypt.hash(password, salt);
      })
      .then(async (hash) => {
        newUser = await prisma.logins.create({
          data: {
            username: username,
            email: email.toLowerCase(),
            password: hash,
            type: Number(type),
          },
        });

        const token = jwt.sign(
          { user_id: newUser.id, email },
          process.env.TOKEN_KEY,
          { expiresIn: tokenExpirationTime }
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
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.logins.findUnique({
      where: {
        email: email,
      },
    });

    console.log(existingUser);

    if (!existingUser) {
      throw new Error("User not found");
    }

    var isMatch;
    await bcrypt.compare(password, existingUser.password).then(
      (result) => {
        isMatch = result;
      },
      (err) => {
        throw err;
      }
    );

    if (!isMatch) {
      throw new Error("Credentials do not match");
    }

    let token;
    try {
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        process.env.TOKEN_KEY,
        { expiresIn: tokenExpirationTime }
      );
    } catch (err) {
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

router.post("/verify", validateToken, async (req, res) => {
  try {
    // verify userId with token
    const userId = req.body.userId;
    const token = req.body.token;

    let decoded = jwt.decode(token, process.env.TOKEN_KEY, (err, decoded) => {
      if (err) {
        return res.status(201).json({
          isValid: false,
        });
      }
    });

    // let decoded = req.decodedToken;

    if (!decoded || decoded.userId !== userId) {
      return res.status(201).json({
        isValid: false,
      });
    } else {
      return res.status(201).json({
        isValid: true,
      });
    }
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.post("/apple/register", async (req, res) => {
  try {
    const { email, password, type } = req.body;

    newUser = await prisma.logins.create({
      data: {
        username: "",
        email: email.toLowerCase(),
        password: password,
        type: Number(type),
      },
    });

    const token = jwt.sign(
      { user_id: newUser.id, email },
      process.env.TOKEN_KEY,
      { expiresIn: tokenExpirationTime }
    );

    res.status(201).send({ token: token, userId: newUser.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/apple/login", async (req, res) => {
  try {
    const { password } = req.body;

    const existingUsers = await prisma.logins.findMany({
      where: {
        password: password,
        type: 2,
      },
    });

    if (existingUsers.length == 0) {
      throw new Error("User not found");
    }

    let token;

    try {
      token = jwt.sign(
        { userId: existingUsers[0].id, email: existingUsers[0].email },
        process.env.TOKEN_KEY,
        { expiresIn: tokenExpirationTime }
      );
    } catch (err) {
      throw new Error("Error! Something went wrong.");
    }

    res.status(201).json({
      userId: existingUsers[0].id,
      token: token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/delete", validateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const deletedUser = await prisma.logins.delete({
      where: {
        id: parseInt(userId),
      },
    });

    res.status(201).json({
      message: "User deleted",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
