const userService = require('../services/userService');

function parseId(req) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    const err = new Error('Invalid id');
    err.statusCode = 400;
    throw err;
  }
  return id;
}

async function createUser(req, res, next) {
  try {
    const {
      email,
      user_name,
      password,
      role,
      full_name,
      company_name,
      mobile_no,
      country_code,
      photo,
      status,
    } = req.body;

    const user = await userService.createUser({
      email,
      user_name,
      password,
      role,
      full_name,
      company_name,
      mobile_no,
      country_code,
      photo,
      status,
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const id = parseId(req);
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUserById(req, res, next) {
  try {
    const id = parseId(req);
    const user = await userService.updateUserById(id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteUserById(req, res, next) {
  try {
    const id = parseId(req);
    await userService.deleteUserById(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
