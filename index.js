const express = require("express");
const app = express();
const connection = require("./config");
const authRouter = require("./routes/auth");
const port = 5000;
const passport = require("passport");

connection.connect((err) => {
  if (err) throw err;
  console.log("Successfully connected to the database");
});

app.use(express.json());
app.use("/auth", authRouter);
app.get(
  "/trips",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send("User can view the trips");
  }
);

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`App is listening at ${port}`);
});
