require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const { pick } = require('lodash');
const moment = require('moment-timezone');
const { getUserByEmail } = require('../services/usersService');
const { getUserTeamsData } = require('../services/teamUsersService');

const isProd = process.env.NODE_ENV === 'prod';

const isAuthenticated = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(400).json({
        success: false,
        message: 'Missing Auth token',
      })
    }
    const token = String(authorization).substring(7);
    const decodedToken = jwt.decode(token);
    if (!decodedToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid Auth token',
      });
    }
    const { exp } = decodedToken;
    const expiryTime = moment(exp * 1000);
    if (expiryTime.isBefore(moment())) {
      res.status(400).json({
        success: false,
        message: 'Auth token expired',
      });
    }
    const authenticatedUser = pick(decodedToken, ['id', 'name', 'email']);
    const userTeamsData = await getUserTeamsData(authenticatedUser.id);
    authenticatedUser.teams = userTeamsData;
    req.user = authenticatedUser;
    next();
  } catch (error) {
    console.error('Error in isAuthenticated - ', error);
    res.status(400).json({
      success: false,
      message: 'Something went wrong',
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = isAuthenticated;