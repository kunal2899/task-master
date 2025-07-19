const jwt = require('jsonwebtoken');
require('dotenv').config({ quiet: true });
const moment = require('moment-timezone');
const { VALIDATION_ERRORS } = require("../constants/userConstants");
const { addUser, getUserByEmail } = require("../services/usersService");
const { generateHash, validateHash } = require("../utils/bcryptUtils");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(400).json({
        success: false,
        message: `User with this email doesn't exists`,
      })
    };
    const isPasswordMatched = await validateHash(password, user.password);
    if (!isPasswordMatched) {
      res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      })
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
    })
  } catch (error) {
    console.error('Error in UsersController.loginUser - ', error);
    res.status(400).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password: passwordText } = req.body;
    const encryptedPassword = await generateHash(passwordText);
    const user = { name, email, password: encryptedPassword };
    await addUser(user);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in UsersController.registerUser - ', error);
    let errorMessage = 'Something went wrong';
    if (error.message === VALIDATION_ERRORS.DUPLICATE_EMAIL) {
      errorMessage = 'User with this email already exists';
    }
    res.status(400).json({
      success: false,
      message: errorMessage,
    });
  }
}

module.exports = {
  loginUser,
  registerUser,
}