const express = require("express");
const router = express.Router();

const pg = require("pg");

const Pool = pg.Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

router.post("/register", async (req, res) => {
  pool.query(
    "INSERT INTO logins (username, email, password, type) VALUES ($1, $2, $3, $4) RETURNING *;",
    [req.body.username, req.body.email, req.body.password, req.body.type],
    (error, results) => {
      if (error) {
        res.status(400).json({ message: error.message });
      }
      res.status(201).send(results.rows);
    }
  );
});

router.get("/logins", (req, res) => {
  pool.query("SELECT * FROM logins;", (error, results) => {
    if (error) {
      res.status(400).json({ message: error.message });
    }
    res.status(201).send(results.rows);
  });
});

router.put("/updateLogin", (req, res) => {
  pool.query(
    "UPDATE logins SET username = $2, email = $3, password = $4, type = $5 WHERE id = $1 RETURNING *;",
    [
      req.body.id,
      req.body.username,
      req.body.email,
      req.body.password,
      req.body.type,
    ],
    (error, results) => {
      if (error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(201).send(results.rows);
      }
    }
  );
});

router.delete("/deleteLogin", (req, res) => {
  pool.query(
    "DELETE FROM logins WHERE id = $1 RETURNING *",
    [req.body.id],
    (error, results) => {
      if (error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(201).send(results.rows);
      }
    }
  );
});

module.exports = router;
