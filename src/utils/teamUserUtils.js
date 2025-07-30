const { getTeamUser } = require("../services/teamUsersService");

const getTeamUserId = async ({ teamId, userId }) => {
  return await getTeamUser({ teamId, userId, returnsIdOnly: true });
};

module.exports = {
  getTeamUserId,
};
