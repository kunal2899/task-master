const { VALIDATION_ERRORS } = require("../../constants/userConstants");
const { createTaskCommentSchema } = require("../../schemas/taskCommentsSchema");
const { pick, mapValues } = require("lodash");

require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateAddTaskComment = (req, res, next) => {
  try {
    if (!req.body) throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);
    
    Object.assign(req.params, {
      ...mapValues(pick(req.params, ["teamId", "taskId"]), Number),
      userId:
        req.params.userId === "me"
          ? req.user.id
          : parseInt(req.params.userId, 10),
    });

    const { teamId, userId, taskId } = req.params;
    const { comment } = req.body;

    const { error: validationError } = createTaskCommentSchema.validate({
      teamId,
      userId,
      taskId,
      comment,
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
    console.error("Error in validateAddTaskComment - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateAddTaskComment; 