const Joi = require("joi");
const { importFields } = require("../utils/joiUtils");
const { TASK_PRIORITY, TASK_STATUS } = require("../constants/taskConstants");

const validationRules = {
  name: Joi.string(),
  description: Joi.string(),
  dueDate: Joi.date(),
  addedBy: Joi.number(),
  priority: Joi.string().valid(...Object.values(TASK_PRIORITY)),
};

const createTaskSchema = Joi.object().keys({
  teamId: Joi.number().required(),
  userId: Joi.number().required(),
  task: importFields(validationRules, ["*"]),
});

const assignTaskSchema = Joi.object().keys({
  teamId: Joi.number().required(),
  userId: Joi.number().required(),
  taskId: Joi.number().required(),
  assignToUserId: Joi.number().required(),
});

const filterTasksSchema = Joi.object().keys({
  teamId: Joi.number().required(),
  userId: Joi.number().required(),
  status: Joi.string().valid(...Object.values(TASK_STATUS)).optional(),
  search: Joi.string().optional(),
});

module.exports = {
  createTaskSchema,
  assignTaskSchema,
  filterTasksSchema,
};
