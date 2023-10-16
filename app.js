require("dotenv").config();

const express = require("express");
// const pg = require("pg");
const { PrismaClient } = require("@prisma/client");

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// const Pool = pg.Pool;

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT,
// });

app.get("/", (req, res) => res.send("Hello World!"));

// app.get("/logins", async (req, res) => {
//   const logins = await prisma.logins.findMany();
//   res.json(logins);
// });

const userRouter = require("./routes/userSession");
app.use("/user", userRouter);

app.listen(port, () => console.log(`Express app running on port ${port}!`));
