const { VALIDATION_ERRORS } = require("../../constants/userConstants");
const { createTaskSchema } = require("../../schemas/taskSchema");

require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateCreateTask = (req, res, next) => {
  try {
    if (!req.body) throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);
    const { teamId, userId } = req.params;
    const { id: currentUserId } = req.user;
    req.body.addedBy = currentUserId;
    const { error: validationError } = createTaskSchema.validate({
      task: req.body,
      teamId: parseInt(teamId, 10),
      userId: parseInt(userId, 10),
    });
    if (validationError) {
      throw new Error(
        `Invalid payload provided${
          validationError.message ? `: ${validationError.message}` : "!"
        }`
      );
    }
    next();
  } catch (error) {
    console.error("Error in validateCreateTask - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateCreateTask;
