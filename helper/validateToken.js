const jwt = require("jsonwebtoken");

function validateToken(req, res, next) {
  let accessGranted = false;
  let token = req.headers.accesstokenkey;
  if (!token) {
    return res.status(401).json({
      error: 1,
      message: "You need to send the authToken(JWT).",
    });
  } else {
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          error: err,
        });
      } else {
        accessGranted = true;
      }
    });
  }

  if (!accessGranted) {
    res.statusMessage = "No authentication.";
    return res.status(401).end();
  }

  next();
}

module.exports = validateToken;
