const Users = require("../../data/models/usersModel.js");
const restricted = require("../../auth/restricted-middleware.js");

const router = require("express").Router();

router.get("/:id", restricted, (req, res) => {
  const { id } = req.params;
  if (req.id == id) {
    Users.findById(id)
      .then(user => res.json(user))
      .catch(err => res.status(500).json(err));
  } else {
    res
      .status(401)
      .json({ message: "You are not authorized to see this user." });
  }
});

module.exports = router;
