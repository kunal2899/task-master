const { find } = require("lodash");

const getTeamUserRole = (userTeams, teamId) => {
  if (!userTeams.teams) return null;
  console.log({teams: userTeams.teams, teamId});
  const userTeam = find(userTeams.teams, { teamId: parseInt(teamId, 10) });
  console.log({ userTeam })
  return userTeam.role;
};

module.exports = { getTeamUserRole }; 