const pgtools = require("pgtools");
const logger = require("../config/logging");

const config = {
    user: process.env.POSTGRES_USER,
    host: process.env.DATABASE_URL,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
};

async function createDatabase() {
    await pgtools.createdb(config, process.env.POSTGRES_DB).catch((err, res) => {
        if (err) {
            logger.error(`Failed to create database: ${process.env.POSTGRES_DB}. Exiting`);
            logger.error(err);
            process.exit(-1);
        }
        logger.info(`Database: ${process.env.POSTGRES_DB} created.`);
        logger.debug(res);
    });
}

async function dropDatabase() {
    await pgtools.dropdb(config, process.env.POSTGRES_DB).catch((err, res) => {
        if (err) {
            logger.error(`Failed to drop database: ${process.env.POSTGRES_DB}. Exiting`);
            logger.error(err);
            process.exit(-1);
        }
        logger.info(res);
        logger.debug(`Database: ${process.env.POSTGRES_DB} dropped.`, process.env.POSTGRES_DB);
    });
}

module.exports = {
    createDatabase: createDatabase,
    dropDatabase: dropDatabase
};

