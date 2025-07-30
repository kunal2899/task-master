const pool = require("../../configs/dbConfig");
const { buildAdvancedInsertQuery } = require("../utils/queryBuilder");
const { getTeamUserId } = require("../utils/teamUserUtils");

const createTaskAttachment = async ({
  teamId,
  userId,
  taskId,
  mediaUrl,
  mediaType,
}) => {
  try {
    const teamUserId = await getTeamUserId({ teamId, userId });

    const { query, values } = buildAdvancedInsertQuery(
      "task_attachments",
      [{ taskId, addedBy: teamUserId, mediaUrl, mediaType }],
      { returningColumns: ["*"] }
    );

    const {
      rows: [createdAttachment],
    } = await pool.query(query, values);
    return createdAttachment;
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsService.createTaskAttachment - ",
      error
    );
    throw error;
  }
};

const getTaskAttachments = async (taskId) => {
  try {
    const query = `
      SELECT 
        ta.*,
        tu.user_id,
        u.username,
        u.email
      FROM task_attachments ta
      JOIN team_users tu ON ta.added_by = tu.id
      JOIN users u ON tu.user_id = u.id
      WHERE ta.task_id = $1
      ORDER BY ta.id ASC;
    `;

    const { rows: attachments } = await pool.query(query, [taskId]);
    return attachments;
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsService.getTaskAttachments - ",
      error
    );
    throw error;
  }
};

const getTaskAttachmentById = async (attachmentId) => {
  try {
    const query = `
      SELECT 
        ta.*,
        tu.user_id,
        u.username,
        u.email
      FROM task_attachments ta
      JOIN team_users tu ON ta.added_by = tu.id
      JOIN users u ON tu.user_id = u.id
      WHERE ta.id = $1;
    `;

    const {
      rows: [attachment = null],
    } = await pool.query(query, [attachmentId]);
    return attachment;
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsService.getTaskAttachmentById - ",
      error
    );
    throw error;
  }
};

const updateTaskAttachment = async ({
  attachmentId,
  teamId,
  userId,
  mediaUrl,
  mediaType,
}) => {
  try {
    const teamUserId = await getTeamUserId({ teamId, userId });

    const params = [];
    const updateFields = [];

    if (mediaUrl) {
      updateFields.push(`media_url = $${params.push(mediaUrl)}`);
    }
    if (mediaType) {
      updateFields.push(`media_type = $${params.push(mediaType)}`);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    const query = `
      UPDATE task_attachments 
      SET ${updateFields.join(", ")}
      WHERE id = $${params.push(attachmentId)} AND added_by = $${params.push(
      teamUserId
    )}
      RETURNING *;
    `;

    const {
      rows: [updatedAttachment = null],
    } = await pool.query(query, params);

    if (!updatedAttachment) {
      throw new Error(
        "Attachment not found or you don't have permission to update it"
      );
    }

    return updatedAttachment;
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsService.updateTaskAttachment - ",
      error
    );
    throw error;
  }
};

const deleteTaskAttachment = async ({ attachmentId, teamId, userId }) => {
  try {
    const teamUserId = await getTeamUserId({ teamId, userId });

    const query = `
      DELETE FROM task_attachments 
      WHERE id = $1 AND added_by = $2
      RETURNING *;
    `;

    const {
      rows: [deletedAttachment = null],
    } = await pool.query(query, [attachmentId, teamUserId]);

    if (!deletedAttachment) {
      throw new Error(
        "Attachment not found or you don't have permission to delete it"
      );
    }

    return deletedAttachment;
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsService.deleteTaskAttachment - ",
      error
    );
    throw error;
  }
};

const getAttachmentsByType = async (taskId, mediaType) => {
  try {
    const query = `
      SELECT 
        ta.*,
        tu.user_id,
        u.username,
        u.email
      FROM task_attachments ta
      JOIN team_users tu ON ta.added_by = tu.id
      JOIN users u ON tu.user_id = u.id
      WHERE ta.task_id = $1 AND ta.media_type = $2
      ORDER BY ta.id ASC;
    `;

    const { rows: attachments } = await pool.query(query, [taskId, mediaType]);
    return attachments;
  } catch (error) {
    console.error(
      "Error in TaskAttachmentsService.getAttachmentsByType - ",
      error
    );
    throw error;
  }
};

module.exports = {
  createTaskAttachment,
  getTaskAttachments,
  getTaskAttachmentById,
  updateTaskAttachment,
  deleteTaskAttachment,
  getAttachmentsByType,
};
