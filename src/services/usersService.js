const pool = require("../../configs/dbConfig");

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
    console.error('Error in UsersService.addUser - ', error);
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
    console.error('Error in UsersService.getUserByEmail - ', error);
    throw error;
  }
}

module.exports = {
  addUser,
  getUserByEmail,
};
