const pool = require("../../configs/dbConfig");
const { buildAdvancedInsertQuery } = require("../utils/queryBuilder");
const { getTeamUserId } = require("../utils/teamUserUtils");

const createTaskComment = async ({ teamId, userId, taskId, comment }) => {
  try {
    const teamUserId = await getTeamUserId({ teamId, userId });

    const { query, values } = buildAdvancedInsertQuery(
      "task_comments",
      [{ taskId, addedBy: teamUserId, data: comment }],
      { returningColumns: ["*"] }
    );

    const {
      rows: [createdComment],
    } = await pool.query(query, values);
    return createdComment;
  } catch (error) {
    console.error("Error in TaskCommentsService.createTaskComment - ", error);
    throw error;
  }
};

const getTaskComments = async (taskId) => {
  try {
    const query = `
      SELECT 
        tc.*,
        tu.user_id,
        u.username,
        u.email
      FROM task_comments tc
      JOIN team_users tu ON tc.added_by = tu.id
      JOIN users u ON tu.user_id = u.id
      WHERE tc.task_id = $1
      ORDER BY tc.id ASC;
    `;

    const { rows: comments } = await pool.query(query, [taskId]);
    return comments;
  } catch (error) {
    console.error("Error in TaskCommentsService.getTaskComments - ", error);
    throw error;
  }
};

const getTaskCommentById = async (commentId) => {
  try {
    const query = `
      SELECT 
        tc.*,
        tu.user_id,
        u.username,
        u.email
      FROM task_comments tc
      JOIN team_users tu ON tc.added_by = tu.id
      JOIN users u ON tu.user_id = u.id
      WHERE tc.id = $1;
    `;

    const {
      rows: [comment = null],
    } = await pool.query(query, [commentId]);
    return comment;
  } catch (error) {
    console.error("Error in TaskCommentsService.getTaskCommentById - ", error);
    throw error;
  }
};

const updateTaskComment = async ({ commentId, teamId, userId, data }) => {
  try {
    const teamUserId = await getTeamUserId({ teamId, userId });

    const query = `
      UPDATE task_comments 
      SET data = $1
      WHERE id = $2 AND added_by = $3
      RETURNING *;
    `;

    const {
      rows: [updatedComment = null],
    } = await pool.query(query, [data, commentId, teamUserId]);

    if (!updatedComment) {
      throw new Error(
        "Comment not found or you don't have permission to update it"
      );
    }

    return updatedComment;
  } catch (error) {
    console.error("Error in TaskCommentsService.updateTaskComment - ", error);
    throw error;
  }
};

const deleteTaskComment = async ({ commentId, teamId, userId }) => {
  try {
    const teamUserId = await getTeamUserId({ teamId, userId });

    const query = `
      DELETE FROM task_comments 
      WHERE id = $1 AND added_by = $2
      RETURNING *;
    `;

    const {
      rows: [deletedComment = null],
    } = await pool.query(query, [commentId, teamUserId]);

    if (!deletedComment) {
      throw new Error(
        "Comment not found or you don't have permission to delete it"
      );
    }

    return deletedComment;
  } catch (error) {
    console.error("Error in TaskCommentsService.deleteTaskComment - ", error);
    throw error;
  }
};

const updateCommentLikes = async (commentId, likesCount) => {
  try {
    const query = `
      UPDATE task_comments 
      SET likes_count = $1
      WHERE id = $2
      RETURNING *;
    `;

    const {
      rows: [updatedComment = null],
    } = await pool.query(query, [likesCount, commentId]);

    return updatedComment;
  } catch (error) {
    console.error("Error in TaskCommentsService.updateCommentLikes - ", error);
    throw error;
  }
};

module.exports = {
  createTaskComment,
  getTaskComments,
  getTaskCommentById,
  updateTaskComment,
  deleteTaskComment,
  updateCommentLikes,
};
