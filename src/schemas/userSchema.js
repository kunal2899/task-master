const Joi = require('joi');
const { importFields } = require('../utils/joiUtils');

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
  ...importFields(validationRules, ['name', 'email', 'password'], true)
});

// Login schema - only email and password are required
const loginUserSchema = Joi.object().keys({
  ...importFields(validationRules, ['email', 'password'], true)
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
}