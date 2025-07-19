const express = require("express");
const router = express.Router();

router.use(express.json());

const {
  loginUser,
  registerUser,
  getMyUser,
  updateMyUser,
} = require("../controllers/usersController");
const validateLoginInfo = require("../middlewares/validators/loginUserValidator");
const validateRegisterUserInfo = require("../middlewares/validators/registerUserValidator");
const isAuthenticated = require("../middlewares/isAuthenticated");
const validateUpdateUserInfo = require("../middlewares/validators/updateUserValidator");

router.get("/me", isAuthenticated, getMyUser);
router.put("/me", isAuthenticated, validateUpdateUserInfo, updateMyUser);

router.post("/login", validateLoginInfo, loginUser);
router.post("/", validateRegisterUserInfo, registerUser);

module.exports = router;
