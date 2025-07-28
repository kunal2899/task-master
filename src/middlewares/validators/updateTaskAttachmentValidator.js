const { VALIDATION_ERRORS } = require("../../constants/userConstants");
const {
  updateTaskAttachmentSchema,
} = require("../../schemas/taskAttachmentsSchema");
const { pick, mapValues } = require("lodash");

require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateUpdateTaskAttachment = (req, res, next) => {
  try {
    if (!req.body) throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);

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
    const { mediaUrl, mediaType } = req.body;

    const { error: validationError } = updateTaskAttachmentSchema.validate({
      teamId,
      userId,
      taskId,
      attachmentId,
      mediaUrl,
      mediaType,
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
    console.error("Error in validateUpdateTaskAttachment - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateUpdateTaskAttachment;
