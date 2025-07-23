const { get, pick, difference, map } = require("lodash");
const teamsService = require("../services/teamsService");
const teamUsersService = require("../services/teamUsersService");
const {
  TEAM_USER_ROLE,
  TEAM_USER_STATUS,
  TEAM_USER_ACTION,
} = require("../constants/teamConstants");
const { Promise } = require("bluebird");
const { getTeamUserRole } = require("../utils/teamsUtil");
const { SQL_ERRORS } = require("../constants/sqlConstants");

const getTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await teamsService.fetchTeamById(teamId);
    res.status(200).json({
      success: true,
      data: team,
      ...(!team ? { message: "Team does not exist with this id" } : {}),
    });
  } catch (error) {
    console.error("Error in TeamsController.getTeam - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getAllTeamUsers = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) throw new Error('Team id not provided');
    const teamUsers = await teamUsersService.getAllTeamUsers(parseInt(teamId, 10));
    res.status(200).json({
      success: true,
      data: teamUsers,
    });
  } catch (error) {
    console.error("Error in TeamsController.getAllTeamUsers - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getAllTeams = async (req, res) => {
  try {
    const filters = get(req, "body.filters", {});
    const teamsData = await teamsService.fetchAllTeams(filters);
    res.status(200).json({
      success: true,
      data: teamsData,
    });
  } catch (error) {
    console.error("Error in TeamsController.getTeams - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const addTeam = async (req, res) => {
  try {
    const team = await teamsService.createTeam({
      ...pick(req.body, ["name", "about"]),
      owner: req.user.id,
    });
    if (!team)
      res.status(200).json({ success: true, message: "Team already exists" });
    await createTeamUser({
      userId: req.user.id,
      teamId: team.id,
      role: TEAM_USER_ROLE.OWNER,
      status: TEAM_USER_STATUS.ACTIVE,
    });
    res.status(201).json({
      success: true,
      message: "Team created",
      data: team,
    });
  } catch (error) {
    console.error("Error in TeamsController.addTeam - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const isAuthorisedToUpdate = await teamUsersService.isAuthorised({
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
    const updatedTeam = await teamsService.updateTeam(
      teamId,
      pick(req.body, ["name", "about"])
    );
    res.status(200).json({
      success: true,
      message: "Team details updated",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Error in TeamsController.updateTeam - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const isAuthorisedToDelete = await teamUsersService.isAuthorised({
      teamId,
      userId: req.user.id,
      action: TEAM_USER_ACTION.DELETE,
    });
    if (!isAuthorisedToDelete) {
      return res.status(401).json({
        success: false,
        message: "User not authorised to perform this action",
      });
    }
    await teamUsersService.removeTeamUsers(teamId);
    await teamsService.deleteTeam(teamId);
    res.status(200).json({
      success: true,
      message: "Team removed",
    });
  } catch (error) {
    console.error("Error in TeamsController.deleteTeam - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const assignUsersToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const authenticatedUserRole = getTeamUserRole(req.user, teamId);
    const isAuthorisedToAssign = await teamUsersService.isAuthorised({
      teamId,
      userId: req.user.id,
      action: TEAM_USER_ACTION.ASSIGN,
    });
    if (!isAuthorisedToAssign) {
      res.status(401).json({
        success: false,
        message: "User is not authorised to perform this action",
      });
    }
    const { userIdRoles } = req.body;
    const userIdsToProcess = map(userIdRoles, "id");
    const assignedUserIds = [];
    await Promise.map(
      userIdRoles,
      async (userIdRole) => {
        const { id: userId, role = "member" } = userIdRole;
        if (!userId) return;
        if (userId === req.user.id) return;
        let roleToAssign = role;
        if (roleToAssign === TEAM_USER_ROLE.OWNER)
          roleToAssign = TEAM_USER_ROLE.MEMBER;
        if (
          authenticatedUserRole !== TEAM_USER_ROLE.OWNER &&
          roleToAssign === TEAM_USER_ROLE.ADMIN
        ) {
          roleToAssign = TEAM_USER_ROLE.MEMBER;
        }
        try {
          const addedTeamUser = await teamUsersService.createTeamUser({
            teamId,
            userId,
            role: roleToAssign,
            status:
              authenticatedUserRole === TEAM_USER_ROLE.OWNER
                ? TEAM_USER_STATUS.ACTIVE
                : TEAM_USER_STATUS.PENDING,
            addedBy: req.user.id,
          });
          assignedUserIds.push(addedTeamUser.user_id);
        } catch (error) {
          if (error.code === SQL_ERRORS.FOREIGN_KEY_VIOLATION) {
            console.log(
              `User with id: ${userId} can't be added as it doesn't exists!`
            );
          }
        }
      },
      { concurrency: 5 }
    );
    res.status(200).json({
      success: true,
      data: {
        assignedUserIds,
        failedUserIds: difference(userIdsToProcess, assignedUserIds),
      },
    });
  } catch (error) {
    console.error("Error in TeamsController.assignUsersToTeam - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateTeamUser = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const updatedTeamUser = await teamUsersService.updateTeamUser(
      teamId,
      userId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Team User Details updated",
      data: updatedTeamUser,
    });
  } catch (error) {
    console.error("Error in TeamsController.updateTeam - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getTeam,
  getAllTeams,
  addTeam,
  updateTeam,
  deleteTeam,
  assignUsersToTeam,
  updateTeamUser,
  getAllTeamUsers,
};
