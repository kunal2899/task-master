const { pick } = require("lodash");
const { buildAdvancedInsertQuery, buildAdvancedUpdateQuery } = require("../utils/queryBuilder");
const pool = require("../../configs/dbConfig");
const { TEAM_USER_ACTION, TEAM_USER_ACCESS_LEVELS, TEAM_USER_ACTION_ALLOWED } = require("../constants/teamConstants");

const createTeamUser = async (teamUser) => {
  try {
    const { query, values } = buildAdvancedInsertQuery(
      "team_users",
      [pick(teamUser, ["userId", "teamId", "role", "status", "addedBy"])],
      { returningColumns: ["*"], conflictOptions: { action: "NOTHING" } }
    );
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error("Error in TeamUsersService.createTeamUser - ", error);
    throw error;
  }
};

const updateTeamUser = async (teamId, userId, updateData) => {
  try {
    const whereFilters = {
      teamId: { value: teamId, condition: "equal" },
      userId: { value: userId, condition: "equal" },
    };
    const { query, values } = buildAdvancedUpdateQuery(
      "team_users",
      updateData,
      whereFilters,
      { returningColumns: ["*"] }
    );
    console.log("Generated UPDATE SQL:", query);
    console.log("Values:", values);

    const { rows: updatedTeamUsers } = await pool.query(query, values);
    return updatedTeamUsers[0];
  } catch (error) {
    console.error("Error in TeamUsersService.updateTeamUser - ", error);
    throw error;
  }
}

const removeTeamUsers = async (teamId) => {
  try {
    const query = `
      DELETE FROM team_users
      WHERE team_id = $1
    `;
    await pool.query(query);
  } catch (error) {
    console.error("Error in TeamUsersService.removeTeamUsers - ", error);
    throw error;
  }
}

const isAuthorised = async ({
  teamId,
  userId,
  action = TEAM_USER_ACTION.UPDATE,
}) => {
  try {
    const query = `
      SELECT role FROM team_users
      WHERE team_id = $1
      AND user_id = $2
    `;
    const { rows } = await pool.query(query, [teamId, userId]);
    if (rows.length === 0) return false;
    const role = rows[0].role;
    return TEAM_USER_ACCESS_LEVELS[role] >= TEAM_USER_ACTION_ALLOWED[action];
  } catch (error) {
    console.error("Error in TeamUsersService.isAuthorised - ", error);
    throw error;
  }
};

const getUserTeamsData = async (userId) => {
  try {
    const query = `
      SELECT
        id, team_id AS "teamId",
        role, status,
        created_at AS "joinedDate"
      FROM 
        team_users
      WHERE 
        user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error("Error in TeamUsersService.populateTeamsData - ", error);
    throw error;
  }
};

const getTeamUser = async ({ teamId, userId, returnsIdOnly = false }) => {
  try {
    const query = `
      SELECT
        ${returnsIdOnly ? 'id' : '*'}
      FROM 
        team_users
      WHERE 
        user_id = $1
        AND team_id = $2
    `;
    const { rows } = await pool.query(query, [userId, teamId]);
    if (rows.length === 0) return null;
    return returnsIdOnly ? rows[0].id : rows[0];
  } catch (error) {
    console.error("Error in TeamUsersService.getTeamUser - ", error);
    throw error;
  }
};

const getAllTeamUsers = async (teamId) => {
try {
    const query = `
      SELECT
        *
      FROM 
        team_users
      WHERE
        team_id = $1
    `;
    const { rows } = await pool.query(query, [teamId]);
    return rows;
  } catch (error) {
    console.error("Error in TeamUsersService.getAllTeamUsers - ", error);
    throw error;
  }
};

module.exports = {
  createTeamUser,
  updateTeamUser,
  isAuthorised,
  removeTeamUsers,
  getUserTeamsData,
  getTeamUser,
  getAllTeamUsers,
};
