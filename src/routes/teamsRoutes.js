const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  getAllTeams,
  addTeam,
  updateTeam,
  getTeam,
  assignUsersToTeam,
  updateTeamUser,
} = require("../controllers/teamsController");
const { deleteTeam } = require("../services/teamsService");
const validateCreateTeamInfo = require("../middlewares/validators/createTeamValidator");
const validateUpdateTeamInfo = require("../middlewares/validators/updateTeamValidator");
const validateTeamInfo = require("../middlewares/validators/teamValidator");
const validateAssignTeamUsers = require("../middlewares/validators/assignTeamUsersValidator");
const validateTeamUserUpdateInfo = require("../middlewares/validators/validateTeamUserUpdateInfo");
const router = express.Router();

router.use(express.json());
router.use(isAuthenticated);

router.get("/:teamId", getTeam);
router.get("/", getAllTeams);

router.post(
  "/:teamId/assign",
  validateTeamInfo,
  validateAssignTeamUsers,
  assignUsersToTeam
);
router.post("/", validateCreateTeamInfo, addTeam);

router.put(
  "/:teamId/:userId",
  validateTeamUserUpdateInfo,
  validateTeamInfo,
  updateTeamUser
);
router.put(
  "/:teamId",
  validateUpdateTeamInfo,
  validateTeamInfo,
  updateTeam
);

router.delete("/:teamId", validateTeamInfo, deleteTeam);

module.exports = router;
