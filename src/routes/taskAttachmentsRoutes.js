const express = require("express");
const {
  addTaskAttachment,
  getTaskAttachments,
  getTaskAttachment,
  updateTaskAttachment,
  deleteTaskAttachment,
} = require("../controllers/taskAttachmentsController");
const validateAddTaskAttachment = require("../middlewares/validators/addTaskAttachmentValidator");
const validateUpdateTaskAttachment = require("../middlewares/validators/updateTaskAttachmentValidator");
const validateGetTaskAttachments = require("../middlewares/validators/getTaskAttachmentsValidator");
const validateGetTaskAttachment = require("../middlewares/validators/getTaskAttachmentValidator");
const validateDeleteTaskAttachment = require("../middlewares/validators/deleteTaskAttachmentValidator");

const router = express.Router({ mergeParams: true });

router.get("/", validateGetTaskAttachments, getTaskAttachments);

router.post("/", validateAddTaskAttachment, addTaskAttachment);

router.get("/:attachmentId", validateGetTaskAttachment, getTaskAttachment);

router.put(
  "/:attachmentId",
  validateUpdateTaskAttachment,
  updateTaskAttachment
);

router.delete(
  "/:attachmentId",
  validateDeleteTaskAttachment,
  deleteTaskAttachment
);

module.exports = router;
