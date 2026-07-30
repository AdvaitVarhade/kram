const { Events } = require(`discord.js`);

const logger = require(`../utils/logger.js`);
const logToChannel = require("../utils/logToChannel.js");

module.exports = {
  name: Events.Warn,
  async execute(m, client) {
    logger.warn(m);
    logToChannel(m,client,"warn");
  },
};
