const Joi = require("joi");
const { importFields } = require("../utils/joiUtils");
const { TASK_ATTACHMENT_MEDIA_TYPE } = require("../constants/taskConstants");

const validationRules = {
  teamId: Joi.number(),
  userId: Joi.number(),
  taskId: Joi.number(),
  attachmentId: Joi.number(),
  mediaUrl: Joi.string().uri().max(200),
  mediaType: Joi.string().valid(...Object.values(TASK_ATTACHMENT_MEDIA_TYPE)),
};

const createTaskAttachmentSchema = Joi.object().keys({
  ...importFields(
    validationRules,
    ["teamId", "userId", "taskId", "mediaUrl", "mediaType"],
    ["attachmentId"]
  ),
});

const updateTaskAttachmentSchema = Joi.object().keys({
  ...importFields(validationRules, [
    "teamId",
    "userId",
    "taskId",
    "attachmentId",
  ]),
});

const getTaskAttachmentsSchema = Joi.object().keys({
  ...importFields(
    validationRules,
    ["teamId", "userId", "taskId"],
    ["attachmentId"]
  ),
});

const getTaskAttachmentSchema = Joi.object().keys({
  ...importFields(
    validationRules,
    ["teamId", "userId", "taskId", "attachmentId"],
    ["mediaUrl", "mediaType"]
  ),
});

const deleteTaskAttachmentSchema = Joi.object().keys({
  ...importFields(
    validationRules,
    ["teamId", "userId", "taskId", "attachmentId"],
    ["mediaUrl", "mediaType"]
  ),
});

module.exports = {
  createTaskAttachmentSchema,
  updateTaskAttachmentSchema,
  getTaskAttachmentsSchema,
  getTaskAttachmentSchema,
  deleteTaskAttachmentSchema,
};
