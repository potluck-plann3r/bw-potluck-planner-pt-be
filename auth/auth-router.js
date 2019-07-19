require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secrets = process.env.JWT_SECRET || "lambda";
const Users = require("../data/models/usersModel.js");
const router = require("express").Router();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    secrets,
    {
      expiresIn: "1h"
    }
  );
}

router.post("/register", async (req, res) => {
  try {
    let user = req.body;
    const hash = await bcrypt.hashSync(user.password, 10);
    user.password = hash;
    await Users.insert(user);
    let insertedUser = await Users.findByEmail(user.email);
    res.status(201).json({
      message: `Welcome ${insertedUser.firstName}! You are now registered.`
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/login", (req, res) => {
  let { email, password } = req.body;

  Users.findByEmail(email)
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({
          message: `Welcome back, ${user.firstName}. You are now logged in.`,
          authToken: token
        });
      } else {
        res.status(401).json({ message: "Invalid credentials." });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

module.exports = router;
