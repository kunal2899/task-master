const express = require("express");
const router = express.Router();

router.use(express.json());

const { loginUser, registerUser } = require("../controllers/usersController");
const validateLoginInfo = require("../middlewares/validators/loginUserValidator");
const validateRegisterUserInfo = require("../middlewares/validators/registerUserValidator");

router.post("/login", validateLoginInfo, loginUser);
router.post("/", validateRegisterUserInfo, registerUser);

module.exports = router;
