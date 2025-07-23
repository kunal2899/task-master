const { VALIDATION_ERRORS } = require("../../constants/userConstants");
const teamsService = require("../../services/teamsService");
const { getTeamUserId } = require("../../utils/teamUserUtils");

require('dotenv').config({ quiet: true });

const isProd = process.env.NODE_ENV === 'prod';

const validateTeamUser = async (req, res, next) => {
  try {
    if (!["GET", "DELETE"].includes(req.method) && !req.body)
      throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);
    Object.assign(req.params, {
      teamId: parseInt(req.params.teamId, 10),
      userId:
        req.params.userId === "me"
          ? req.user.id
          : parseInt(req.params.userId, 10),
    });
    const { teamId, userId } = req.params;
    const teamUserId = await getTeamUserId({
      teamId,
      userId,
    });
    if (!teamUserId) {
      res.status(400).json({
        success: false,
        message: "User is not part of the team, please login with valid user",
      });
    }
    next();
  } catch (error) {
    console.error('Error in validateTeamUser - ', error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
}

module.exports = validateTeamUser;