const {
  getTaskAttachmentSchema,
} = require("../../schemas/taskAttachmentsSchema");
const { pick, mapValues } = require("lodash");

require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateGetTaskAttachment = (req, res, next) => {
  try {
    Object.assign(req.params, {
      ...mapValues(
        pick(req.params, ["teamId", "taskId", "attachmentId"]),
        Number
      ),
      userId:
        req.params.userId === "me"
          ? req.user.id
          : parseInt(req.params.userId, 10),
    });

    const { teamId, userId, taskId, attachmentId } = req.params;

    const { error: validationError } = getTaskAttachmentSchema.validate({
      teamId,
      userId,
      taskId,
      attachmentId,
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
    console.error("Error in validateGetTaskAttachment - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateGetTaskAttachment;
