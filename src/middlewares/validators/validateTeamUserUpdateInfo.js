const { TEAM_USER_ACTION, TEAM_USER_ROLE, TEAM_USER_STATUS } = require('../../constants/teamConstants');
const { VALIDATION_ERRORS } = require('../../constants/userConstants');
const { teamUserSchema } = require('../../schemas/teamUserSchema');
const { isAuthorised } = require('../../services/teamUsersService');
const { getTeamUserRole } = require('../../utils/teamsUtil');

require('dotenv').config({ quiet: true });

const isProd = process.env.NODE_ENV === 'prod';

const validateTeamUserUpdateInfo = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;
    if (!req.body) throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);
    const { error: validationError } = teamUserSchema.validate({
      ...req.body,
      teamId,
      userId,
    });
    if (validationError) {
      throw new Error(
        `Invalid payload provided${
          validationError.message ? `: ${validationError.message}` : "!"
        }`
      );
    }
    const isAuthorisedToUpdate = await isAuthorised({
      teamId,
      userId: req.user.id,
      action: TEAM_USER_ACTION.UPDATE,
    });
    if (!isAuthorisedToUpdate) {
      return res.status(401).json({
        success: false,
        message: "User not authorised to perform this action",
      });
    }
    let { role, status } = req.body;
    const authenticatedUserRole = await getTeamUserRole(req.user, teamId);
    if (authenticatedUserRole !== TEAM_USER_ROLE.OWNER) {
      let message = '';
      if (role === TEAM_USER_ROLE.ADMIN) message = 'User not authorised to update role to Admin';
      else if (status === TEAM_USER_STATUS.ACTIVE) message = 'Only team owner have access to approve any member';
      if (message) {
        res.status(401).json({ 
          success: false,
          message: 'User not authorised to update role to Admin'
        })
      }
    }
    next();
  } catch (error) {
    console.error('Error in validateTeamUserUpdateInfo - ', error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
}

module.exports = validateTeamUserUpdateInfo;