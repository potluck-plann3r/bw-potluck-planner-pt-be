const db = require("../knexConfig.js");

module.exports = {
  getAll,
  findById,
  insert,
  update,
  remove,
  findByLocation,
  findByUserId,
  findAdminPotlucks,
  findMyPotlucks,
  getAllAttendees
};

async function getAll() {
  return await db("potlucks");
}

async function findById(id) {
  return await db("potlucks")
    .where({ id: Number(id) })
    .first();
}

async function insert(record) {
  return await db("potlucks").insert(record);
}

async function update(id, potluck) {
  return await db("potlucks")
    .where("id", Number(id))
    .update(potluck);
}

async function remove(id) {
  return await db("potlucks")
    .where("id", Number(id))
    .del();
}

async function findByLocation(locationName) {
  return await db("potlucks")
    .where({ locationName })
    .first();
}

async function findByUserId(userId) {
  return await db("potlucks")
    .join("usersPotlucks", { "potlucks.id": "usersPotlucks.potluckId" })
    .where("usersPotlucks.userId", Number(userId));
}

async function findAdminPotlucks(userId) {
  return await db("potlucks")
    .join("usersPotlucks", { "potlucks.id": "usersPotlucks.potluckId" })
    .where("usersPotlucks.role", 0)
    .andWhere("userId", Number(userId));
}

async function findMyPotlucks(userId) {
  return await db("potlucks")
    .join("usersPotlucks", { "potlucks.id": "usersPotlucks.potluckId" })
    .where("userId", Number(userId));
}

async function getAllAttendees(id) {
  return await db
    .select("firstName", "lastName", "email", "attendance, role")
    .from("users")
    .join("usersPotlucks", { "users.id": "usersPotlucks.id" })
    .where("id", Number(id));
}
