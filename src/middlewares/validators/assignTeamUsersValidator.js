const { get } = require('lodash');
const { VALIDATION_ERRORS } = require('../../constants/userConstants');

require('dotenv').config({ quiet: true });

const isProd = process.env.NODE_ENV === 'prod';

const validateAssignTeamUsers = (req, res, next) => {
  try {
    if (!req.body) throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);
    const userIdRoles = get(req, 'body.userIdRoles', []);
    if (userIdRoles.length === 0) throw new Error('No users provided to assign');
    next();
  } catch (error) {
    console.error('Error in validateAssignTeamUsers - ', error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
}

module.exports = validateAssignTeamUsers;