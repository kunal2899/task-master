const express = require('express');
require('dotenv').config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info('Server is listening on port', PORT);
});