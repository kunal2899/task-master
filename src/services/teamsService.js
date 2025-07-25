const {
  buildCompleteWhereClause,
  buildAdvancedInsertQuery,
  buildAdvancedUpdateQuery,
} = require("../utils/queryBuilder");
const pool = require("../../configs/dbConfig");

const fetchAllTeams = async (filters = {}) => {
  try {
    const whereClause = buildCompleteWhereClause(filters);
    const query = `
      SELECT * FROM teams
      ${whereClause}
    `;
    console.log("Generated SQL:", query);
    const { rows: teamsData } = await pool.query(query);
    return teamsData;
  } catch (error) {
    console.error("Error in TeamsService.fetchAllTeams - ", error);
    throw error;
  }
};

const fetchTeamById = async (teamId) => {
  try {
    const query = `
      SELECT * FROM teams
      WHERE id = $1
    `;
    const { rows: teamData } = await pool.query(query, [teamId]);
    return teamData[0];
  } catch (error) {
    console.error("Error in TeamsService.fetchTeamById - ", error);
    throw error;
  }
};

const createTeam = async (teamData) => {
  try {
    const { query, values } = buildAdvancedInsertQuery("teams", [teamData], {
      returningColumns: ["*"],
      conflictOptions: {
        action: "NOTHING",
      },
    });
    console.log("Generated INSERT SQL:", query);
    console.log("Values:", values);

    const { rows: createdTeam } = await pool.query(query, values);
    return createdTeam[0];
  } catch (error) {
    console.error("Error in TeamsService.createTeam - ", error);
    throw error;
  }
};

const createMultipleTeams = async (teamsData) => {
  try {
    const { query, values } = buildAdvancedInsertQuery("teams", teamsData, {
      returningColumns: ["*"],
    });
    console.log("Generated BULK INSERT SQL:", query);
    console.log("Values:", values);

    const { rows: createdTeams } = await pool.query(query, values);
    return createdTeams;
  } catch (error) {
    console.error("Error in TeamsService.createMultipleTeams - ", error);
    throw error;
  }
};

const updateTeam = async (teamId, updateData) => {
  try {
    const whereFilters = {
      id: { value: teamId, condition: "equal" },
    };

    const { query, values } = buildAdvancedUpdateQuery(
      "teams",
      updateData,
      whereFilters,
      { returningColumns: ["*"] }
    );
    console.log("Generated UPDATE SQL:", query);
    console.log("Values:", values);

    const { rows: updatedTeams } = await pool.query(query, values);
    return updatedTeams[0];
  } catch (error) {
    console.error("Error in TeamsService.updateTeam - ", error);
    throw error;
  }
};

const deleteTeam = async (teamId) => {
  try {
    const query = `
      DELETE FROM teams
      WHERE id = $1
      RETURNING *
    `;
    console.log("Generated DELETE SQL:", query);
    console.log("Values:", [teamId]);

    const { rows: deletedTeams } = await pool.query(query, [teamId]);
    return deletedTeams[0];
  } catch (error) {
    console.error("Error in TeamsService.deleteTeam - ", error);
    throw error;
  }
};

module.exports = {
  fetchAllTeams,
  fetchTeamById,
  createTeam,
  createMultipleTeams,
  updateTeam,
  deleteTeam,
};
