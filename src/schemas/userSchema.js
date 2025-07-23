const Joi = require("joi");
const { importFields } = require("../utils/joiUtils");
const { changePassword } = require("../controllers/usersController");

// Define reusable validation rules
const validationRules = {
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/
  ),
};

// Registration schema - all fields are required
const registerUserSchema = Joi.object().keys({
  ...importFields(validationRules, ["name", "email", "password"]),
});

// Login schema - only email and password are required
const loginUserSchema = Joi.object().keys({
  ...importFields(validationRules, ["email", "password"], ["name"]),
});

const updateUserSchema = Joi.object().keys({
  ...importFields(validationRules, [], ["password"]),
});

const changePasswordPayloadSchema = Joi.object().keys({
  existingPassword: validationRules.password.required(),
  newPassword: validationRules.password.required(),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  changePasswordPayloadSchema,
};
