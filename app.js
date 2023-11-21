require("dotenv").config();
const bodyParser = require("body-parser");

const express = require("express");
// const pg = require("pg");
const { PrismaClient } = require("@prisma/client");

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const Pool = pg.Pool;

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT,
// });

// app.get("/logins", async (req, res) => {
//   const logins = await prisma.logins.findMany();
//   res.json(logins);
// });

const userRouter = require("./routes/userSession");
const profileRouter = require("./routes/profile");
const learningRouter = require("./routes/learning");
const speechSessionRouter = require("./routes/speechSession");
const dashboardRouter = require("./routes/dashboard");

app.use("/user", userRouter);
app.use("/profile", profileRouter);
app.use("/speech", speechSessionRouter);
app.use("/dashboard", dashboardRouter);
app.use("/learning", learningRouter);
app.use("/images", express.static("images"));

app.use("/user", userRouter);
app.use("/profile", profileRouter);

app.listen(port, () => console.log(`Express app running on port ${port}!`));
