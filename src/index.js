const connectToDatabase = require('../db/connectionService');

const express = require('express');
const userRoutes = require('./routes/usersRoutes');
const teamRoutes = require('./routes/teamsRoutes');
require('dotenv').config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectToDatabase();

// Routes
app.use('/v1/users', userRoutes);
app.use('/v1/teams', teamRoutes);

app.listen(PORT, () => {
  console.info('Server is listening on port', PORT);
});