const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  const { username, email, password, type } = req.body;
  try {
    bcrypt
      .genSalt(Number(process.env.SALT_ROUNDS))
      .then((salt) => {
        return bcrypt.hash(password, salt);
      })
      .then(async (hash) => {
        return (newUser = await prisma.logins.create({
          data: {
            username,
            email,
            password: hash,
            type: Number(type),
          },
        }));
      })
      .then((newUser) => {
        res.status(201).json(newUser);
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    console.log(req.body);
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.logins.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Password does not match");
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// router.get("/logins", (req, res) => {
//   pool.query("SELECT * FROM logins;", (error, results) => {
//     if (error) {
//       res.status(400).json({ message: error.message });
//     }
//     res.status(201).send(results.rows);
//   });
// });

// router.put("/updateLogin", (req, res) => {
//   pool.query(
//     "UPDATE logins SET username = $2, email = $3, password = $4, type = $5 WHERE id = $1 RETURNING *;",
//     [
//       req.body.id,
//       req.body.username,
//       req.body.email,
//       req.body.password,
//       req.body.type,
//     ],
//     (error, results) => {
//       if (error) {
//         res.status(400).json({ message: error.message });
//       } else {
//         res.status(201).send(results.rows);
//       }
//     }
//   );
// });

// router.delete("/deleteLogin", (req, res) => {
//   pool.query(
//     "DELETE FROM logins WHERE id = $1 RETURNING *",
//     [req.body.id],
//     (error, results) => {
//       if (error) {
//         res.status(400).json({ message: error.message });
//       } else {
//         res.status(201).send(results.rows);
//       }
//     }
//   );
// });

module.exports = router;
