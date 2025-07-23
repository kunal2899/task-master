const pool = require("../../configs/dbConfig");
const { buildAdvancedUpdateQuery } = require("../utils/queryBuilder");

const addUser = async (user) => {
  try {
    const params = [];
    const query = `
      INSERT INTO users
      (name, email, password)
      VALUES
      (
        $${params.push(user.name)},
        $${params.push(user.email)},
        $${params.push(user.password)}
      );
    `;
    await pool.query(query, params);
  } catch (error) {
    console.error("Error in UsersService.addUser - ", error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const query = `
      SELECT * FROM users
      WHERE email = $1;
    `;
    const { rows } = await pool.query(query, [email]);
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Error in UsersService.getUserByEmail - ", error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const query = `
      SELECT * FROM users
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [userId]);
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Error in UsersService.getUserById - ", error);
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    const whereFilters = {
      id: { value: userId, condition: "equal" },
    };
    const { query, values } = buildAdvancedUpdateQuery(
      "users",
      updateData,
      whereFilters,
      { returningColumns: ["*"] }
    );
    console.log("Generated UPDATE SQL:", query);
    console.log("Values:", values);

    const { rows: updatedUser } = await pool.query(query, values);
    return updatedUser[0];
  } catch (error) {
    console.error("Error in UsersService.updateUser - ", error);
    throw error;
  }
};

module.exports = {
  addUser,
  getUserByEmail,
  getUserById,
  updateUser,
};
