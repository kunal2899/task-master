const express = require("express");
const router = express.Router();

const {
  loginUser,
  registerUser,
  getMyUser,
  updateMyUser,
  changePassword,
  logoutUser,
} = require("../controllers/usersController");
const validateLoginInfo = require("../middlewares/validators/loginUserValidator");
const validateRegisterUserInfo = require("../middlewares/validators/registerUserValidator");
const isAuthenticated = require("../middlewares/isAuthenticated");
const validateUpdateUserInfo = require("../middlewares/validators/updateUserValidator");
const validateUpdateUserPassword = require("../middlewares/validators/changeUserPasswordValidator");

router.put(
  "/me/change-password",
  isAuthenticated,
  validateUpdateUserPassword,
  changePassword
);
router.get("/me", isAuthenticated, getMyUser);
router.put("/me", isAuthenticated, validateUpdateUserInfo, updateMyUser);
router.post("/me/logout", isAuthenticated, logoutUser);

router.post("/login", validateLoginInfo, loginUser);
router.post("/", validateRegisterUserInfo, registerUser);

module.exports = router;
