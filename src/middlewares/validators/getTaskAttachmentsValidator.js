const {
  getTaskAttachmentsSchema,
} = require("../../schemas/taskAttachmentsSchema");
const { pick, mapValues } = require("lodash");

require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateGetTaskAttachments = (req, res, next) => {
  try {
    Object.assign(req.params, {
      ...mapValues(pick(req.params, ["teamId", "taskId"]), Number),
      userId:
        req.params.userId === "me"
          ? req.user.id
          : parseInt(req.params.userId, 10),
    });

    const { teamId, userId, taskId } = req.params;
    const { mediaType } = req.query;

    const { error: validationError } = getTaskAttachmentsSchema.validate({
      teamId,
      userId,
      taskId,
      mediaType,
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
    console.error("Error in validateGetTaskAttachments - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateGetTaskAttachments;
