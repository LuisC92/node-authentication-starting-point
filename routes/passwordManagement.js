const router = require("express").Router();
const User = require("../models/user");
const passport = require("passport");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const { createTransport } = require("nodemailer");

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
              res.status(200).send("Your password has been changed")
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
router.post("/reset-password", (req, res) => {
  const { emailReceived, subject, content } = req.body;
  //Search email, if email is correct generate a random password(install randomstring package =>
  //ex: const random = randomstring.generate(x) -> x number characteres)
  User.findByEmail(emailReceived).then((user) => {
    if (!user) return res.status(404).send("Email is not registered");
    else {
      const temporaryPassword = randomstring.generate(8);
      //hash password
      //send to mysql
      User.changePassword(temporaryPassword, user.id).then(
        res.status(200).send("Check your inbox for your temporary password")
      );
    }
  });
  //send email
  sendEmail(user, emailReceived, newPassword);
});

//Create email configuration
//TODO test send email
//TODO define process.env user and password
const sendEmail = (user, emailReceived, newPassword) => {
  //Create smtpTransport
  const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "", //email test
      password: "", //password test
    },
  });
  //Create mail options
  const mailOptions = {
    from: "", //same email from test
    to: emailReceived, //email that we received from emailReceived
    subject: "temporary password",
    text: `Hi ${user.firstname}, 
    This is your temporary password: ${newPassword}.
    Please Login and Change this temporary password for security reasons.
    .........
    `,
  };
  //Do the email transport
  smtpTransport.sendMail(mailOptions, (error, response) => {
    if (error) {
      return error;
    } else {
      return response;
    }
  });
  smtpTransport.close();
};

module.exports = router;
