//  Add in the authentication within this file
const router = require("express").Router();
const User = require("../models/user");
const { calculateJWTToken } = require("../helpers/users");

// jwt strategy modules
const jwt = require("jsonwebtoken");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

// Passport modules for local strategy
const passport = require("passport");
const res = require("express/lib/response");
const LocalStrategy = require("passport-local").Strategy;
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.PRIVATE_KEY,
    },
    (jwtPayload, cb) => {
      return cb(null, jwtPayload);
    }
  )
);
passport.use(
  "local",
  new LocalStrategy(
    {
      // The email and password is received from the login route
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    (email, password, callback) => {
      User.findByEmail(email).then((user) => {
        if (!user) res.status(400).send("Email not found");
        else {
          // If there is a user with that email but password is incorrect
          User.verifyPassword(password, user.hashedPassword).then(
            (passwordIsCorrect) => {
              if (passwordIsCorrect) {
                // If password and email is correct send user information to callback
                return callback(null, user);
              }
            }
          );
        }
      });
    }
  )
);
// http://localhost:5000/auth/login
router.post("/login", (req, res) => {
  passport.authenticate(
    "local",
    // Passport callback function below
    (err, user, info) => {
      const { email, password } = req.body;
      User.findByEmail(email).then((foundUser) => {
        if (err) return res.status(500).send(err);
        if (!foundUser) res.status(401).send({ message: info });
        else {
          User.verifyPassword(password, foundUser.hashedPassword)
            .then((passwordIsCorrect) => {
              if (passwordIsCorrect) {
                const token = calculateJWTToken(user);
                res.cookie("user_token", token);
                const { hashedPassword, ...foundUser } = user;
                return res.status(202).send(foundUser);
              } else res.status(401).send("Invalid credentials");
            })
            .catch((error) => {
              return res.status(500).send("cannot get fu***** password");
            });
        }
      });
    }
  )(req, res);
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
// http://localhost:5000/auth/verify-token
router.get("/verify-token", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json("You need to Login");
  }
  const decryptedUser = await jwt.verify(token, process.env.JWT_SECRET);
  User.findOne((err, results) => {
    if (err) res.status(500).json(err.toString());
    const { hashedPassword, ...user } = results;
    res.status(200).send(user);
  }, decryptedUser);
});
module.exports = router;
