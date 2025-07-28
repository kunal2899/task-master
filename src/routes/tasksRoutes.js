const express = require("express");
const {
  addTask,
  getAllTasks,
  getTask,
  updateTaskStatus,
  assignTask,
} = require("../controllers/tasksController");
const validateCreateTask = require("../middlewares/validators/addTaskValidator");
const validateTeamUser = require("../middlewares/validators/validateTeamUser");
const validateAssignTask = require("../middlewares/validators/assignTaskValidator");
const validateFilterTasks = require("../middlewares/validators/filterTasksValidator");
const taskCommentsRouter = require("./taskCommentsRoutes");
const taskAttachmentsRouter = require("./taskAttachmentsRoutes");

const router = express.Router({ mergeParams: true });

router.use(validateTeamUser);

router.use("/:taskId/comments", taskCommentsRouter);
router.use("/:taskId/attachments", taskAttachmentsRouter);

router.post("/", validateCreateTask, addTask);
router.get("/", validateFilterTasks, getAllTasks);

router.get("/:taskId", getTask);
router.put("/:taskId/status", updateTaskStatus);
router.put("/:taskId/assign", validateAssignTask, assignTask);

module.exports = router;
