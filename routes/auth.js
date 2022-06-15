//*  Add in the authentication within this file
const router = require("express").Router();
const User = require("../models/user");
const { calculateJWTToken } = require("../helpers/users");

//* jwt strategy modules
const jwt = require("jsonwebtoken");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

//* Passport modules for local strategy
const passport = require("passport");
const res = require("express/lib/response");
const LocalStrategy = require("passport-local").Strategy;

//* generate passport Strategy
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

//* generate passport LocalStrategy
passport.use(
  "local-login",
  new LocalStrategy(
    {
      //* The email and password is received from the login route
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, //* allows us to pass back the entire request to the callback, by default it's false
      session: false,
    },
    (req, email, password, callback) => {
      //* callback with email and password from our form
      User.findByEmail(email).then((user, err) => {
        if (err) return callback(err, null, "Error 500");
        if (!user)
          //* If there is no user
          return callback(
            "USER_NOT_FOUND",
            false,
            ("loginMessage", "User Not found.")
          );
        else {
          User.verifyPassword(password, user.hashedPassword).then(
            (passwordIsCorrect) => {
              if (passwordIsCorrect) {
                //* If password and email is correct send user information to callback
                return callback(
                  null,
                  user,
                  ("loginMessage", "USER CORRECT!")
                );
              } else {
                //* If there is a user with that email but password is incorrect
                return callback(
                  "INVALID_PASSWORD",
                  false,
                  ("Oops! Wrong password.")
                );
              }
            }
          );
        }
      });
    }
  )
);

//TODO still need to test this version using passport 
//! required for persistent login sessions
//! passport needs ability to serialize and unserialize users out of session

// * used to serialize the user for the session
passport.serializeUser(function (user, callback) {
  callback(null, user.id);
});

// * used to deserialize the user
passport.deserializeUser(function (id, callback) {
  User.findOne(id).then(
    function (err, rows) {
      callback(err, rows[0]);
  })
})


//? http://localhost:5000/auth/login
router.post("/login", (req, res) => {
  passport.authenticate(
    "local-login",
    //* Passport callback function below
    (err, user, info) => {
      // console.log("err", err);
      // console.log("info", info);
      // console.log("user", user);

      //* error handling callback
      if (err) {
        //* user not found from callback
        if (err === "USER_NOT_FOUND") res.status(403).json({ message: info });
        //* invalid password from callback
        else if (err === "INVALID_PASSWORD")
          res.status(401).json({ message: info });
        //* general error from callback
        else res.status(500).send(err);
      } else {
        //* create token
        const token = calculateJWTToken(user);
        //* send token to browser and store it on cookies
        res.cookie("user_token", token);
        //* destructuring object user to take out hashedPassword
        const { hashedPassword, ...userData } = user;
        // console.log("user", userData);
        //* send user to frontend
        return res.status(202).send(userData);


        //! all of this block of code bellow can be commented
        // const { email, password } = req.body;

        // User.findByEmail(email).then((foundUser, error) => {
        //   if (error) return res.status(500).send(error);
        //   if (!foundUser) res.status(401).send({ message: info });
        //   else {

        //     User.verifyPassword(password, foundUser.hashedPassword)
        //       .then((passwordIsCorrect) => {
        //         if (passwordIsCorrect) {
        //           const token = calculateJWTToken(foundUser);
        //           res.cookie("user_token", token);
        //           const { hashedPassword, ...userData } = foundUser;
        //           // console.log("user", userData);
        //           return res.status(202).send(userData);
        //         } else res.status(401).send({ message: "Invalid password" });
        //       })
        //       .catch((err) => {
        //         return res.status(500).send(err);
        //       });
        //   }
        // });
      }
    }
  )(req, res); //* send callback request and response
});

//TODO add comment to the code
//? http://localhost:5000/auth/signup
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

//TODO add comment to the code 
//? http://localhost:5000/auth/verify-token
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
