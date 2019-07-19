const restricted = require("../../auth/restricted-middleware.js");
const Potlucks = require("../../data/models/potlucksModel.js");
const UsersPotlucks = require("../../data/models/usersPotlucksModel.js");
const Users = require("../../data/models/usersModel.js");
const PotluckRequirements = require("../../data/models/potluckRequirementsModel.js");
const PotluckFood = require("../../data/models/foodModel.js");

const router = require("express").Router();

module.exports = router;

router.post("/", restricted, async (req, res) => {
  try {
    let newPotluck = req.body;
    let {
      locationName,
      locationAddress,
      locationStreet,
      locationState,
      locationCity,
      locationCountry,
      locationPostcode
    } = req.body;
    if (
      !locationName ||
      !locationAddress ||
      !locationStreet ||
      !locationState ||
      !locationCity ||
      !locationCountry ||
      !locationPostcode
    ) {
      res.status(400).json({
        message:
          "Please provide a name, address, street, state, city, country and postal code."
      });
    }
    await Potlucks.insert(newPotluck);
    let savedPotluck = await Potlucks.findByLocation(locationName);

    const newRelationship = {
      userId: req.id,
      potluckId: savedPotluck.id,
      role: 0,
      attendance: 2
    };
    await UsersPotlucks.insert(newRelationship);
    let savedRelationship = await UsersPotlucks.findByUserIdAndPotluckId(
      req.id,
      savedPotluck.id
    );

    res.status(200).json([savedPotluck, savedRelationship]);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", restricted, async (req, res) => {
  try {
    let potlucks = await Potlucks.findMyPotlucks(req.id);

    res.status(200).json(potlucks);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/user/add", restricted, async (req, res) => {
  try {
    let { potluckId, role, email } = req.body;
    if (!potluckId || !role || !email) {
      res.status(400).json({
        message:
          "Please provide the potluckId of the potluck to add as well as user's email and role."
      });
    }
    let user = await Users.findByEmail(email);
    let toInsert = {
      userId: user.id,
      potluckId,
      role,
      attendance: 2
    };
    await UsersPotlucks.insert(toInsert);
    res.status(200).json(toInsert);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/mine", restricted, async (req, res) => {
  try {
    let potlucks = await Potlucks.findAdminPotlucks(req.id);
    res.status(200).json(potlucks);
  } catch (error) {
    res.status(500).error;
  }
});

router.post("/reqs/:id", restricted, async (req, res) => {
  let potluckId = req.params.id;
  let { foodCategory, foodDescription, servings, fufilled } = req.body;
  try {
    let relationship = await UsersPotlucks.findByUserIdAndPotluckId(
      req.id,
      potluckId
    );
    let response = {
      foodCategory,
      foodDescription,
      potluckId,
      servings,
      fufilled
    };
    if (relationship && relationship.role === 0) {
      await PotluckRequirements.insert(response);
      res.status(200).json(response);
    } else {
      res.status(400).json({
        message:
          "You can't add requirements to a potluck that you aren't an organizer of."
      });
    }
  } catch (error) {
    res.status(500).error;
  }
});

router.get("/reqs/:id", restricted, async (req, res) => {
  let potluckId = req.params.id;
  console.log(potluckId);
  try {
    const response = await PotluckRequirements.getByPotluckId(potluckId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:id", restricted, async (req, res) => {
  let id = req.params.id;
  console.log(id);
  try {
    let potluck = await Potlucks.findById(id);
    let relationship = await UsersPotlucks.findByUserIdAndPotluckId(req.id, id);
    if (!potluck) {
      res.status(404).json({
        message: "This potluck doesn't exist."
      });
    } else if (relationship && relationship.role === 0) {
      await Potlucks.update(id, req.body);
      let updatedPotluck = await Potlucks.findById(id);
      res.status(200).json(updatedPotluck);
    } else {
      res.status(400).json({
        message: "You can't edit a potluck that you aren't an organizer of."
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", restricted, async (req, res) => {
  let id = req.params.id;
  try {
    let potluck = await Potlucks.findById(id);
    let relationship = await UsersPotlucks.findByUserIdAndPotluckId(req.id, id);
    if (!potluck) {
      res.status(404).json({
        message: "This potluck doesn't exist."
      });
    } else if (relationship && relationship.role === 0) {
      await Potlucks.remove(id);
      res.status(200).json(potluck);
    } else {
      res.status(400).json({
        message: "You can't delete a potluck that you aren't an organizer of."
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
