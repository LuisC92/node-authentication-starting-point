const router = require("express").Router();
const User = require("../models/user");
const passport = require("passport");

//TODO add comment to the code
//TODO add passport to validation
//? http://localhost:5000/password/change-password
router.post("/change-password", (req, res) => {
  const { currentPassword, newPassword, userId } = req.body;
  User.findOne(userId).then((foundUser) => {
    if (!foundUser) return res.status(401).send("User not found");
    else {
      User.verifyPassword(currentPassword, foundUser.hashedPassword).then(
        (passwordIsCorrect) => {
          if (passwordIsCorrect) {
            User.changePassword(newPassword, userId).then(
              res.status(201).send("Your password has been changed")
            );
          } else {
            return res.status(401).send("Invalid password");
          }
        }
      );
    }
  });
});

//TODO add comment to the future code
//? http://localhost:5000/password/reset-password









module.exports = router;
