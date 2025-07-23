const Joi = require("joi");
const { importFields } = require("../utils/joiUtils");

const validationRules = {
  name: Joi.string(),
  about: Joi.string(),
  owner: Joi.number(),
};

const createTeamSchema = Joi.object().keys({
  ...importFields(validationRules, ["name", "about"]),
});

const updateTeamSchema = Joi.object().keys({
  ...validationRules,
});

module.exports = {
  createTeamSchema,
  updateTeamSchema,
};
