const TEAM_USER_ROLE = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
};

const TEAM_USER_STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  REMOVED: "removed",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
};

const TEAM_USER_ACTION = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  ASSIGN: 'assign',
}

const TEAM_USER_ACTION_ALLOWED = {
  [TEAM_USER_ACTION.CREATE]: 0,
  [TEAM_USER_ACTION.READ]: 1,
  [TEAM_USER_ACTION.UPDATE]: 3,
  [TEAM_USER_ACTION.DELETE]: 4,
  [TEAM_USER_ACTION.ASSIGN]: 3,
};

const TEAM_USER_ACCESS_LEVELS = {
  [TEAM_USER_ROLE.OWNER]: 4,
  [TEAM_USER_ROLE.ADMIN]: 3,
  [TEAM_USER_ROLE.MEMBER]: 2,
  [TEAM_USER_ROLE.VIEWER]: 1,
};

module.exports = {
  TEAM_USER_ROLE,
  TEAM_USER_STATUS,
  TEAM_USER_ACTION,
  TEAM_USER_ACTION_ALLOWED,
  TEAM_USER_ACCESS_LEVELS,
};
