const { config } = require('./app.json');

module.exports = {
  ...config,
  extra: {
    ...config.extra,
    // Load environment variables from .env file
    ...require('dotenv').config().parsed,
  },
};
