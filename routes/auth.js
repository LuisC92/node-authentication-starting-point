//  Add in the authentication within this file
const router = require("express").Router();
const User = require("../models/user");
const { calculateJWTToken } = require("../helpers/users");

// router.get("/", (req, res) => {
//   console.log(res);
// });

// http://localhost:5000/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email).then((user) => {
    if (!user) res.status(401).send("Invalid credentials");
    else {
      User.verifyPassword(password, user.hashedPassword).then(
        (passwordIsCorrect) => {
          if (passwordIsCorrect) {
            const token = calculateJWTToken(user);
            res.cookie("user_token", token);
            res.send("User Logged");
          } else res.status(401).send("Invalid credentials");
        }
      );
    }
  });
});

// http://localhost:5000/auth/signup
router.post("/signup", (req, res) => {
  const { email } = req.body;
  let validationErrors = null;
  User.findByEmail(email)
    .then((existingUserWithEmail) => {
      if (existingUserWithEmail) return Promise.reject("DUPLICATE_EMAIL");
      validationErrors = User.validate(req.body);
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return User.create(req.body);
    })
    .then((createdUser) => {
      res.status(201).json(createdUser);
    })
    .catch((err) => {
        console.log(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already used" });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error saving the user");
    });
});

module.exports = router;
