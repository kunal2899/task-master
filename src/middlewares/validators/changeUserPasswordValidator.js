const { VALIDATION_ERRORS } = require("../../constants/userConstants");
const { changePasswordPayloadSchema } = require("../../schemas/userSchema");
require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateUpdateUserPassword = (req, res, next) => {
  try {
    if (!req.body) throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);
    const { error: validationError } = changePasswordPayloadSchema.validate(
      req.body
    );
    if (validationError) {
      throw new Error(
        `Invalid payload provided${
          validationError.message ? `: ${validationError.message}` : "!"
        }`
      );
    }
    next();
  } catch (error) {
    console.error("Error in validateUpdateUserPassword - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateUpdateUserPassword;
