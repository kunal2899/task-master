const pool = require("../configs/dbConfig");

const connectToDatabase = async () => {
    try {
        await pool.connect();
        console.log("Database connection successful");
    } catch (error) {
        console.error("Error connecting to the database", error);
        process.exit(1);
    }
}

module.exports = connectToDatabase;
