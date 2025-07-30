const { isEmpty } = require("lodash");
const taskCommentsService = require("../services/taskCommentsService");
const tasksService = require("../services/tasksService");

const addTaskComment = async (req, res) => {
  try {
    const { teamId, userId, taskId } = req.params;
    const { comment } = req.body;

    const taskExists = await tasksService.getTeamUserTask({
      teamId,
      userId,
      taskId,
    });

    if (!taskExists || isEmpty(taskExists)) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have access to it",
      });
    }

    const createdComment = await taskCommentsService.createTaskComment({
      teamId,
      userId,
      taskId,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: createdComment,
    });
  } catch (error) {
    console.error("Error in TaskCommentsController.addTaskComment - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getTaskComments = async (req, res) => {
  try {
    const { teamId, userId, taskId } = req.params;

    const taskExists = await tasksService.getTeamUserTask({
      teamId,
      userId,
      taskId,
    });

    if (!taskExists || isEmpty(taskExists)) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have access to it",
      });
    }

    const comments = await taskCommentsService.getTaskComments(taskId);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Error in TaskCommentsController.getTaskComments - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateTaskComment = async (req, res) => {
  try {
    const { teamId, userId, taskId, commentId } = req.params;
    const { comment } = req.body;

    const taskExists = await tasksService.getTeamUserTask({
      teamId,
      userId,
      taskId,
    });

    if (!taskExists || isEmpty(taskExists)) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have access to it",
      });
    }

    const updatedComment = await taskCommentsService.updateTaskComment({
      commentId,
      teamId,
      userId,
      data: comment,
    });

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.error(
      "Error in TaskCommentsController.updateTaskComment - ",
      error
    );
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const deleteTaskComment = async (req, res) => {
  try {
    const { teamId, userId, taskId, commentId } = req.params;

    const taskExists = await tasksService.getTeamUserTask({
      teamId,
      userId,
      taskId,
    });

    if (!taskExists || isEmpty(taskExists)) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have access to it",
      });
    }

    await taskCommentsService.deleteTaskComment({
      commentId,
      teamId,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error in TaskCommentsController.deleteTaskComment - ",
      error
    );
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const updateCommentLikes = async (req, res) => {
  try {
    const { teamId, userId, taskId, commentId } = req.params;
    const { likesCount } = req.body;

    const taskExists = await tasksService.getTeamUserTask({
      teamId,
      userId,
      taskId,
    });

    if (!taskExists || isEmpty(taskExists)) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have access to it",
      });
    }

    const updatedComment = await taskCommentsService.updateCommentLikes(
      commentId,
      likesCount
    );

    res.status(200).json({
      success: true,
      message: "Comment likes updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.error(
      "Error in TaskCommentsController.updateCommentLikes - ",
      error
    );
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  addTaskComment,
  getTaskComments,
  updateTaskComment,
  deleteTaskComment,
  updateCommentLikes,
};
