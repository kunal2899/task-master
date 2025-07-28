const express = require("express");
const {
  addTaskComment,
  getTaskComments,
  updateTaskComment,
  deleteTaskComment,
  updateCommentLikes,
} = require("../controllers/taskCommentsController");
const validateAddTaskComment = require("../middlewares/validators/addTaskCommentValidator");
const validateUpdateTaskComment = require("../middlewares/validators/updateTaskCommentValidator");
const validateUpdateCommentLikes = require("../middlewares/validators/updateCommentLikesValidator");
const validateGetTaskComments = require("../middlewares/validators/getTaskCommentsValidator");
const validateDeleteTaskComment = require("../middlewares/validators/deleteTaskCommentValidator");

const router = express.Router({ mergeParams: true });

router.get("/", validateGetTaskComments, getTaskComments);

router.post("/", validateAddTaskComment, addTaskComment);

router.put("/:commentId", validateUpdateTaskComment, updateTaskComment);
router.put("/:commentId/likes", validateUpdateCommentLikes, updateCommentLikes);

router.delete("/:commentId", validateDeleteTaskComment, deleteTaskComment);

module.exports = router;
