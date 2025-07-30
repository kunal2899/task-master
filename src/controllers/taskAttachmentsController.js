const taskAttachmentsService = require("../services/taskAttachmentsService");
const tasksService = require("../services/tasksService");

const addTaskAttachment = async (req, res) => {
  try {
    const { teamId, userId, taskId } = req.params;
    const { mediaUrl, mediaType } = req.body;

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

    const createdAttachment = await taskAttachmentsService.createTaskAttachment(
      {
        teamId,
        userId,
        taskId,
        mediaUrl,
        mediaType,
      }
    );

    res.status(201).json({
      success: true,
      message: "Attachment added successfully",
      data: createdAttachment,
    });
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsController.addTaskAttachment - ",
      error
    );
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getTaskAttachments = async (req, res) => {
  try {
    const { teamId, userId, taskId } = req.params;
    const { mediaType } = req.query;

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

    let attachments;
    if (mediaType) {
      attachments = await taskAttachmentsService.getAttachmentsByType(
        taskId,
        mediaType
      );
    } else {
      attachments = await taskAttachmentsService.getTaskAttachments(taskId);
    }

    res.status(200).json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsController.getTaskAttachments - ",
      error
    );
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateTaskAttachment = async (req, res) => {
  try {
    const { teamId, userId, taskId, attachmentId } = req.params;
    const { mediaUrl, mediaType } = req.body;

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

    const updatedAttachment = await taskAttachmentsService.updateTaskAttachment(
      {
        attachmentId,
        teamId,
        userId,
        mediaUrl,
        mediaType,
      }
    );

    res.status(200).json({
      success: true,
      message: "Attachment updated successfully",
      data: updatedAttachment,
    });
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsController.updateTaskAttachment - ",
      error
    );
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const deleteTaskAttachment = async (req, res) => {
  try {
    const { teamId, userId, taskId, attachmentId } = req.params;

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

    await taskAttachmentsService.deleteTaskAttachment({
      attachmentId,
      teamId,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsController.deleteTaskAttachment - ",
      error
    );
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const getTaskAttachment = async (req, res) => {
  try {
    const { teamId, userId, taskId, attachmentId } = req.params;

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

    const attachment = await taskAttachmentsService.getTaskAttachmentById(
      attachmentId
    );

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsController.getTaskAttachment - ",
      error
    );
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  addTaskAttachment,
  getTaskAttachments,
  getTaskAttachment,
  updateTaskAttachment,
  deleteTaskAttachment,
};
