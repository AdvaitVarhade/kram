const { Sequelize, DataTypes } = require("sequelize");
const logger = require("../utils/logger");
const { testMode, databaseUrl } = require("../utils/config");

const sequelize =
  testMode || !databaseUrl
    ? new Sequelize({
        dialect: "sqlite",
        storage: "db/database.sqlite",
        logging: false,
      })
    : new Sequelize(databaseUrl, {
        dialect: "postgres",
        logging: false,
        timezone: "+08:00",
      });

const dbTables = {
  User: sequelize.define("User", {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthday: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gmt_offset: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }),
  WatchList: sequelize.define("WatchList", {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    in_queue: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    currently_watching: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    current_episode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_watch: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    watched_with: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    comments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }),
  PlayList: sequelize.define("PlayList", {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    in_queue: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    last_play: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    played_with: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    comments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }),
};

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info("[DATABASE] Connection has been established successfully.");
    await sequelize.sync({ alter: true });
  } catch (error) {
    logger.error(error, "[DATABASE] Unable to connect");
  }
};

module.exports = { ...dbTables, connectToDatabase };
