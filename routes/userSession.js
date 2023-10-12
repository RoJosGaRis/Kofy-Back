const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
  const { user_name, user_email, user_pass } = req;

  pool.query(
    `INSERT INTO users (user_id, user_name, user_email, user_pass) VALUES ($1, $2, $3. $4) RETURNING *)`,
    [user_name, user_email, user_pass, user_id],
    (error, results) => {
      if (error) throw error;
      res.status(201).send(`User added with ID: ${results.rows[0].id}`);
    }
  );
});

module.exports = router;
