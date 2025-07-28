const Joi = require("joi");
const { importFields } = require("../utils/joiUtils");

const validationRules = {
  teamId: Joi.number(),
  userId: Joi.number(),
  taskId: Joi.number(),
  commentId: Joi.number(),
  comment: Joi.string().min(1).max(1000),
  likesCount: Joi.number().min(0),
};

const createTaskCommentSchema = Joi.object().keys({
  ...importFields(
    validationRules,
    ["teamId", "userId", "taskId", "comment"],
    ["commentId", "likesCount"]
  ),
});

const updateTaskCommentSchema = Joi.object().keys({
  ...importFields(
    validationRules,
    ["teamId", "userId", "taskId", "commentId", "comment"],
    ["likesCount"]
  ),
});

const updateCommentLikesSchema = Joi.object().keys({
  ...importFields(
    validationRules,
    ["teamId", "userId", "taskId", "commentId", "likesCount"],
    ["comment"]
  ),
});

const getTaskCommentsSchema = Joi.object().keys({
  ...importFields(
    validationRules,
    ["teamId", "userId", "taskId"],
    ["commentId", "comment", "likesCount"]
  ),
});

const deleteTaskCommentSchema = Joi.object().keys({
  ...importFields(
    validationRules,
    ["teamId", "userId", "taskId", "commentId"],
    ["comment", "likesCount"]
  ),
});

module.exports = {
  createTaskCommentSchema,
  updateTaskCommentSchema,
  updateCommentLikesSchema,
  getTaskCommentsSchema,
  deleteTaskCommentSchema,
};
