const router = require("express").Router();
const User = require("../models/user");

//* Passport modules for local strategy
const passport = require("passport");

//* Module used to generate random password
const randomstring = require("randomstring");

//* imports from helpers to generate email
const { passwordReset } = require("../helpers/emailTemplate");
const sendEmail = require("../helpers/emailSender");

//? http://localhost:5000/password/change-password
router.post(
  "/change-password",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { currentPassword, newPassword, userId } = req.body;
    User.findOne(userId).then((foundUser, err) => {
      //* general error
      if (err) return res.status(500).send(err);

      //* user not found
      if (!foundUser) return res.status(401).send("User not found");
      else {
        //* verify current password
        User.verifyPassword(currentPassword, foundUser.hashedPassword).then(
          (passwordIsCorrect) => {
            let validationErrors = null;

            //* if current password was wrong
            if (!passwordIsCorrect) return Promise.reject("INVALID_PASSWORD");

            //* validate new password
            validationErrors = User.validatePassword(newPassword);

            if (validationErrors) return Promise.reject("INVALID_DATA");

            //* if no validation errors, hash new password
            return User.changePassword(newPassword, userId).then(
              //* send OK message
              res.status(200).send("Your password has been changed")
            );
          }
        );
      }
    });
  }
);

//? http://localhost:5000/password/reset-password
router.post("/reset-password", (req, res) => {
  const { emailReceived } = req.body;
  //* Search email,
  User.findByEmail(emailReceived).then((user) => {
    //* no user in db
    if (!user) return res.status(404).send("Email is not registered");
    else {
      //* if email is correct generate a random password
      //* ex: const random = randomstring.generate(x) -> x number characteres)
      const temporaryPassword = randomstring.generate(12);

      //* hash password and send to mysql
      User.changePassword(temporaryPassword, user.id).then(
        res.status(200).send("Check your inbox for your temporary password")
      );

      //* create email structure
      let emailContent, emailSubject;

      //* use helper emailTemplate to create text content
      //* using this way, you can create multiple functions to
      //* generate email contents depending on objective
      emailContent = passwordReset(
        emailReceived,
        temporaryPassword,
        user.firstname
      );
      //* default subject
      emailSubject = "Test App - Temporary Password";

      //* send email
      sendEmail(emailReceived, emailContent, emailSubject);
    }
  });
});

module.exports = router;
