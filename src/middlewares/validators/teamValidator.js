const teamsService = require("../../services/teamsService");

require('dotenv').config({ quiet: true });

const isProd = process.env.NODE_ENV === 'prod';

const validateTeamInfo = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await teamsService.fetchTeamById(teamId);
    if (!team) {
      res.status(400).json({
        success: false,
        message: "Team not exists",
      });
    }
    next();
  } catch (error) {
    console.error('Error in validateTeamInfo - ', error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
}

module.exports = validateTeamInfo;