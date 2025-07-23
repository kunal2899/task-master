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

const router = express.Router({ mergeParams: true });

router.use(validateTeamUser);

router.post("/", validateCreateTask, addTask);
router.get("/", validateFilterTasks, getAllTasks);

router.get("/:taskId", getTask);
router.put("/:taskId/status", updateTaskStatus);
router.put("/:taskId/assign", validateAssignTask, assignTask);

module.exports = router;
