const { deleteTaskCommentSchema } = require("../../schemas/taskCommentsSchema");
const { pick, mapValues } = require("lodash");

require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateDeleteTaskComment = (req, res, next) => {
  try {
    Object.assign(req.params, {
      ...mapValues(pick(req.params, ["teamId", "taskId", "commentId"]), Number),
      userId:
        req.params.userId === "me"
          ? req.user.id
          : parseInt(req.params.userId, 10),
    });

    const { teamId, userId, taskId, commentId } = req.params;

    const { error: validationError } = deleteTaskCommentSchema.validate({
      teamId,
      userId,
      taskId,
      commentId,
    });

    if (validationError) {
      throw new Error(
        `Invalid parameters provided${
          validationError.message ? `: ${validationError.message}` : "!"
        }`
      );
    }

    next();
  } catch (error) {
    console.error("Error in validateDeleteTaskComment - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateDeleteTaskComment;
