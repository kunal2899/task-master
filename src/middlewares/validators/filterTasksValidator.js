const { filterTasksSchema } = require("../../schemas/taskSchema");

require("dotenv").config({ quiet: true });

const isProd = process.env.NODE_ENV === "prod";

const validateFilterTasks = (req, res, next) => {
  try {
    Object.assign(req.params, {
      teamId: parseInt(req.params.teamId, 10),
      userId:
        req.params.userId === "me"
          ? req.user.id
          : parseInt(req.params.userId, 10),
    });
    const { teamId, userId } = req.params;
    const { status, search } = req.query;

    const { error: validationError } = filterTasksSchema.validate({
      teamId,
      userId,
      status,
      search,
    });

    if (validationError) {
      throw new Error(
        `Invalid query parameters provided${
          validationError.message ? `: ${validationError.message}` : "!"
        }`
      );
    }

    req.taskFilters = {
      status,
      search,
    };

    next();
  } catch (error) {
    console.error("Error in validateFilterTasks - ", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      ...(!isProd ? { developerMessage: error.message } : {}),
    });
  }
};

module.exports = validateFilterTasks;
