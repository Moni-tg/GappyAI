const { expo: config } = require('./app.json');

module.exports = {
  ...config,
  owner: "moni10940",
  extra: {
    // Load environment variables from .env file
    ...require('dotenv').config().parsed,
    eas: {
      projectId: "b1024e5a-574a-4316-a428-a29934b0cd5d"
    }
  },
};
