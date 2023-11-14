const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/summary", validateToken, async (req, res) => { 
  es.status(200).json({ message: "NICE" });
});

module.exports = router;
