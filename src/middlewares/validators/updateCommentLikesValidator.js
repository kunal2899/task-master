const { VALIDATION_ERRORS } = require("../../constants/userConstants");
const {
  updateCommentLikesSchema,
} = require("../../schemas/taskCommentsSchema");
const { pick, mapValues } = require("lodash");

require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateUpdateCommentLikes = (req, res, next) => {
  try {
    if (!req.body) throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);

    Object.assign(req.params, {
      ...mapValues(pick(req.params, ["teamId", "taskId", "commentId"]), Number),
      userId:
        req.params.userId === "me"
          ? req.user.id
          : parseInt(req.params.userId, 10),
    });

    const { teamId, userId, taskId, commentId } = req.params;
    const { likesCount } = req.body;

    const { error: validationError } = updateCommentLikesSchema.validate({
      teamId,
      userId,
      taskId,
      commentId,
      likesCount,
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
    console.error("Error in validateUpdateCommentLikes - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateUpdateCommentLikes;
