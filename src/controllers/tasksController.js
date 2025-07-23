const { TASK_STATUS } = require("../constants/taskConstants");
const tasksService = require("../services/tasksService");
const { getTeamUserId } = require("../utils/teamUserUtils");

const addTask = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const task = req.body;
    const teamUserId = await getTeamUserId({
      teamId,
      userId,
    });
    const { createdTask, createdTeamUserTask } =
      await tasksService.createAndAssignTask({
        task,
        teamUserId,
      });
    res.status(200).json({
      success: true,
      data: {
        task: createdTask,
        assignedTeamUser: createdTeamUserTask,
      },
    });
  } catch (error) {
    console.error("Error in TasksController.addTask - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const filters = req.taskFilters || {};
    const teamUserId = await getTeamUserId({
      teamId,
      userId,
    });
    const teamUserTasks = await tasksService.getAllTeamUserTasks(
      teamUserId,
      filters
    );
    res.status(200).json({
      success: true,
      data: teamUserTasks,
    });
  } catch (error) {
    console.error("Error in TasksController.getAllTasks - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const assignTask = async (req, res) => {
  try {
    const { teamId, userId, taskId } = req.params;
    const assignToTeamUserId = req.assignToTeamUserId;

    const assignedTask = await tasksService.assignTaskToUser({
      teamId,
      userId,
      taskId,
      assignToTeamUserId,
    });

    res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      data: assignedTask,
    });
  } catch (error) {
    console.error("Error in TasksController.assignTask - ", error);
    res.status(400).json({
      success: false,
      message: error.message ||"Something went wrong",
    });
  }
};

const getTask = async (req, res) => {
  try {
    const { teamId, userId, taskId: taskIdFromParams } = req.params;
    const taskId = parseInt(taskIdFromParams, 10);
    const teamUserTask = await tasksService.getTeamUserTask({
      teamId,
      userId,
      taskId,
    });
    if (!teamUserTask) {
      return res.status(200).json({
        success: false,
        message: `Task doesn't exists`,
      });
    }
    const [finalTeamUserTask] = await tasksService.populateTasks([
      teamUserTask,
    ]);
    res.status(200).json({
      success: true,
      data: finalTeamUserTask,
    });
  } catch (error) {
    console.error("Error in TasksController.getTask - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { teamId, userId, taskId: taskIdFromParams } = req.params;
    const taskId = parseInt(taskIdFromParams, 10);
    const { newStatus, remark } = req.body;
    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: "Provide updated status",
      });
    }
    if (!Object.values(TASK_STATUS).includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Provide valid status, allowed values are: (not-started, in-progress, completed, closed)",
      });
    }
    const updatedTeamUserTask = await tasksService.updateTaskStatus({
      teamId,
      userId,
      taskId,
      newStatus,
      remark,
    });
    res.status(200).json({
      success: true,
      data: updatedTeamUserTask,
    });
  } catch (error) {
    console.error("Error in TasksController.getTask - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  addTask,
  getAllTasks,
  getTask,
  updateTaskStatus,
  assignTask,
};
