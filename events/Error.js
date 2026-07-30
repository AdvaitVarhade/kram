const { Events } = require(`discord.js`);

const logger = require(`../utils/logger.js`);
const logToChannel = require("../utils/logToChannel.js");

module.exports = {
  name: Events.Error,
  async execute(m, client) {
   
    logger.error(m, `Error Event`);
     logToChannel(m,client,"danger");
  },
};
