const { VALIDATION_ERRORS } = require("../../constants/userConstants");
const { assignTaskSchema } = require("../../schemas/taskSchema");
const { isAuthorised } = require("../../services/teamUsersService");
const { TEAM_USER_ACTION } = require("../../constants/teamConstants");
const { getTeamUser } = require("../../services/teamUsersService");
const { pick, mapValues } = require("lodash");

require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateAssignTask = async (req, res, next) => {
  try {
    if (!req.body) throw new Error(VALIDATION_ERRORS.INVALID_PAYLOAD);
    Object.assign(req.params, {
      ...mapValues(pick(req.params, ["teamId", "taskId"]), Number),
      userId:
        req.params.userId === "me"
          ? req.user.id
          : parseInt(req.params.userId, 10),
    });
    const { teamId, userId, taskId } = req.params;
    console.log({ teamId, userId, taskId });
    const { assignToUserId } = req.body;

    const { error: validationError } = assignTaskSchema.validate({
      teamId,
      userId,
      taskId,
      assignToUserId: parseInt(assignToUserId, 10),
    });

    if (validationError) {
      throw new Error(
        `Invalid payload provided${
          validationError.message ? `: ${validationError.message}` : "!"
        }`
      );
    }

    // Check if current user has permission to assign tasks
    const isAuthorisedToAssign = await isAuthorised({
      teamId,
      userId,
      action: TEAM_USER_ACTION.ASSIGN_TASK,
    });

    if (!isAuthorisedToAssign) {
      return res.status(401).json({
        success: false,
        message: "User is not authorised to assign tasks",
      });
    }

    // Check if the user we're assigning to is part of the team
    const assignToTeamUser = await getTeamUser({
      teamId,
      userId: parseInt(assignToUserId, 10),
    });

    if (!assignToTeamUser) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign task to user who is not part of the team",
      });
    }

    // Add the assignToTeamUserId to request for use in controller
    req.assignToTeamUserId = assignToTeamUser.id;

    next();
  } catch (error) {
    console.error("Error in validateAssignTask - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateAssignTask;
