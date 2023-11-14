const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/getCardCollections", (req, res) => {});

module.exports = router;
