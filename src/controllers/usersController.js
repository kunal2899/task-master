const jwt = require("jsonwebtoken");
require("dotenv").config({ quiet: true });
const { VALIDATION_ERRORS } = require("../constants/userConstants");
const {
  addUser,
  getUserByEmail,
  updateUser,
  getUserById,
} = require("../services/usersService");
const { generateHash, validateHash } = require("../utils/bcryptUtils");
const { omit } = require("lodash");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User with this email doesn't exists`,
      });
    }
    const isPasswordMatched = await validateHash(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const sessionToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 * 6 }
    );
    res.json({
      success: true,
      token: sessionToken,
    });
  } catch (error) {
    console.error("Error in UsersController.loginUser - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password: passwordText } = req.body;
    const encryptedPassword = await generateHash(passwordText);
    const user = { name, email, password: encryptedPassword };
    await addUser(user);
    res.json({ success: true });
  } catch (error) {
    console.error("Error in UsersController.registerUser - ", error);
    let errorMessage = "Something went wrong";
    if (error.message === VALIDATION_ERRORS.DUPLICATE_EMAIL) {
      errorMessage = "User with this email already exists";
    }
    res.status(400).json({
      success: false,
      message: errorMessage,
    });
  }
};

const getMyUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error("Error in UsersController.getMyUser - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateMyUser = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const updatedUser = await updateUser(userId, req.body);
    res.status(200).json({
      success: true,
      data: omit(updatedUser, ["password"]),
    });
  } catch (error) {
    console.error("Error in UsersController.updateMyUser - ", error);
    if (error.code === "23505") {
      res.status(400).json({
        success: false,
        message: error.detail,
      });
    }
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { existingPassword, newPassword } = req.body;
    const { password: currentPassword } = await getUserById(userId);
    const isPasswordMatched = await validateHash(
      existingPassword,
      currentPassword
    );
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Given existing passowrd not matched with saved one",
      });
    }
    const password = await generateHash(newPassword);
    await updateUser(userId, { password });
    res.status(200).json({
      success: true,
      message: "Password changed",
    });
  } catch (error) {
    console.error("Error in UsersController.changePassword - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    // In this case, we don't have any session management,
    // so logout is just a matter of client-side token deletion
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in UsersController.logoutUser - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

module.exports = {
  loginUser,
  registerUser,
  getMyUser,
  updateMyUser,
  changePassword,
  logoutUser,
};
