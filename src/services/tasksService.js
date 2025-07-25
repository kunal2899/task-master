const { Promise } = require("bluebird");
const pool = require("../../configs/dbConfig");
const { buildAdvancedInsertQuery } = require("../utils/queryBuilder");
const { omit, isString, isEmpty } = require("lodash");
const { getTeamUserId } = require("../utils/teamUserUtils");

const createAndAssignTask = async ({ task, teamUserId }) => {
  try {
    await pool.query("BEGIN");
    const { query: taskCreationQuery, values: taskParams } =
      buildAdvancedInsertQuery("tasks", [{ ...task }], {
        returningColumns: ["*"],
      });
    console.log("Generated BULK INSERT SQL:", taskCreationQuery);
    console.log("Values:", taskParams);
    const {
      rows: [createdTask],
    } = await pool.query(taskCreationQuery, taskParams);
    const { query: teamUserTaskCreationQuery, values: teamUserTaskParams } =
      buildAdvancedInsertQuery(
        "team_user_tasks",
        [{ teamUserId, taskId: createdTask.id }],
        {
          returningColumns: ["*"],
        }
      );
    console.log("Generated BULK INSERT SQL:", teamUserTaskCreationQuery);
    console.log("Values:", teamUserTaskParams);
    const {
      rows: [createdTeamUserTask],
    } = await pool.query(teamUserTaskCreationQuery, teamUserTaskParams);
    await pool.query("COMMIT");
    return {
      createdTask,
      createdTeamUserTask,
    };
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error in TasksService.createAndAssignTask - ", error);
    throw error;
  }
};

const getTaskById = async (taskId) => {
  try {
    const query = `
      SELECT * FROM tasks
      WHERE id = $1;
    `;
    const {
      rows: [task = null],
    } = await pool.query(query, [taskId]);
    return task;
  } catch (error) {
    console.error("Error in TasksService.getTaskById - ", error);
    throw error;
  }
};

const populateTasks = async (teamUserTasks) => {
  try {
    const finalTeamUserTasks = await Promise.reduce(
      teamUserTasks,
      async (acc, teamUserTask) => {
        const { task_id } = teamUserTask;
        const task = await getTaskById(task_id);
        acc.push({
          ...omit(teamUserTask, ["team_user_id", "task_id"]),
          task,
        });
        return acc;
      },
      []
    );
    return finalTeamUserTasks;
  } catch (error) {
    console.error("Error in TasksService.populateTasks - ", error);
    throw error;
  }
};

const getAllTeamUserTasks = async (teamUserId, filters = {}) => {
  try {
    const { status, search } = filters;
    const params = [];
    const whereConditions = [`team_user_id = $${params.push(teamUserId)}`];

    if (status) {
      whereConditions.push(`status = $${params.push(status)}`);
    }

    const teamUserTasksQuery = `
      SELECT * FROM team_user_tasks
      WHERE ${whereConditions.join(" AND ")}
    `;

    const { rows: teamUserTasks } = await pool.query(
      teamUserTasksQuery,
      params
    );
    const finalTeamUserTasks = await populateTasks(teamUserTasks);

    // If search term provided, filter by task name or description
    if (search) {
      const searchTerm = search.toLowerCase();
      return finalTeamUserTasks.filter(
        (teamUserTask) =>
          teamUserTask.task.name.toLowerCase().includes(searchTerm) ||
          teamUserTask.task.description.toLowerCase().includes(searchTerm)
      );
    }

    return finalTeamUserTasks;
  } catch (error) {
    console.error("Error in TasksService.getAllTeamUserTasks - ", error);
    throw error;
  }
};

const assignTaskToUser = async ({
  teamId,
  userId,
  taskId,
  assignToTeamUserId,
}) => {
  try {
    // Check if task belongs to the current user
    const teamUserId = await getTeamUserId({ teamId, userId });
    const currentTaskAssignment = await getTeamUserTask({
      teamId,
      userId,
      taskId,
    });

    if (isEmpty(currentTaskAssignment)) {
      throw new Error("Task not found or user is not assigned to this task");
    }

    // Check if the user is already assigned to this task
    const existingAssignment = await pool.query(
      `
        SELECT * FROM team_user_tasks
        WHERE team_user_id = $1 
        AND task_id = $2;
      `,
      [assignToTeamUserId, taskId]
    );

    if (existingAssignment.rows.length > 0) {
      throw new Error("Task is already assigned to this user");
    }

    await pool.query("BEGIN");

    // Remove current assignment
    await pool.query(
      "DELETE FROM team_user_tasks WHERE team_user_id = $1 AND task_id = $2",
      [teamUserId, taskId]
    );

    // Create new assignment
    const { query: newAssignmentQuery, values: newAssignmentParams } =
      buildAdvancedInsertQuery(
        "team_user_tasks",
        [{ teamUserId: assignToTeamUserId, taskId }],
        { returningColumns: ["*"] }
      );

    const {
      rows: [newAssignment],
    } = await pool.query(newAssignmentQuery, newAssignmentParams);

    await pool.query("COMMIT");

    return newAssignment;
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error in TasksService.assignTaskToUser - ", error);
    throw error;
  }
};

const isTaskBelongToUser = async ({ teamId, userId, taskId }) => {
  try {
    const teamUserId = await getTeamUserId({ teamId, userId });
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM team_user_tasks
        WHERE team_user_id = $1 AND task_id = $2
      );
    `;
    const {
      rows: [isRecordExists = false],
    } = await pool.query(query, [teamUserId, taskId]);
    return isRecordExists;
  } catch (error) {
    console.error("Error in TasksService.isTaskBelongToUser - ", error);
    throw error;
  }
};

const getTeamUserTask = async ({ teamId, userId, taskId }) => {
  try {
    const teamUserId = await getTeamUserId({ teamId, userId });
    const query = `
      SELECT * FROM team_user_tasks
      WHERE team_user_id = $1 AND task_id = $2;
    `;
    const {
      rows: [teamUserTask = {}],
    } = await pool.query(query, [teamUserId, taskId]);
    return teamUserTask;
  } catch (error) {
    console.error("Error in TasksService.getTeamUserTask - ", error);
    throw error;
  }
};

const updateTaskStatus = async ({
  teamId,
  userId,
  taskId,
  newStatus,
  remark,
}) => {
  try {
    const teamUserId = await getTeamUserId({ teamId, userId });
    const params = [];
    const query = `
      UPDATE team_user_tasks
      SET status = $${params.push(newStatus)}
      ${isString(remark) ? `, remark = $${params.push(remark)}` : ""}
      WHERE team_user_id = $${params.push(teamUserId)}
      AND task_id = $${params.push(taskId)}
      RETURNING *;
    `;
    const {
      rows: [updatedTeamUserTask = {}],
    } = await pool.query(query, params);
    return updatedTeamUserTask;
  } catch (error) {
    console.error("Error in TasksService.updateTaskStatus - ", error);
    throw error;
  }
};

module.exports = {
  createAndAssignTask,
  getTaskById,
  getAllTeamUserTasks,
  isTaskBelongToUser,
  getTeamUserTask,
  populateTasks,
  updateTaskStatus,
  assignTaskToUser,
};
