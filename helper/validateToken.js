const jwt = require("jsonwebtoken");

function validateToken(req, res, next) {
  let accessGranted = false;
  let token = req.get("authorization");
  token = token.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: 1,
      message: "You need to send the authToken(JWT).",
    });
  } else {
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
      if (err) {
        return res.status(200).json({
          isValid: false,
        });
      } else {
        // accessGranted = true;
        // req.decodedToken = decoded;
        next();
      }
    });
  }

  // if (!accessGranted) {
  //   res.statusMessage = "No authentication.";
  //   return res.status(201).json({
  //     isValid: false,
  //   });
  // }

  // next();
}

module.exports = validateToken;
