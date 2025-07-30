const { VALIDATION_ERRORS } = require('../../constants/userConstants');
const { updateTeamSchema } = require('../../schemas/teamSchema');

require('dotenv').config({ quiet: true });

const isProd = process.env.NODE_ENV === 'prod';

const validateUpdateTeamInfo = (req, res, next) => {
  try {
    if (!req.body) throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);
    const { error: validationError } = updateTeamSchema.validate(req.body);
    if (validationError) {
      throw new Error(
        `Invalid payload provided${
          validationError.message ? `: ${validationError.message}` : "!"
        }`
      );
    }
    next();
  } catch (error) {
    console.error('Error in validateUpdateTeamInfo - ', error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
}

module.exports = validateUpdateTeamInfo;