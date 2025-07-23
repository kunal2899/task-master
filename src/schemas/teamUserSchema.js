const Joi = require("joi");
const { importFields } = require("../utils/joiUtils");
const { TEAM_USER_ROLE, TEAM_USER_STATUS } = require("../constants/teamConstants");

const validationRules = {
  userId: Joi.number(),
  teamId: Joi.number(),
  role: Joi.string().valid(...Object.values(TEAM_USER_ROLE)),
  status: Joi.string().valid(...Object.values(TEAM_USER_STATUS)),
  addedBy: Joi.number(),
};

const teamUserSchema = Joi.object().keys({
  ...importFields(validationRules, ["teamId", "userId"]),
});

module.exports = {
  teamUserSchema,
};
