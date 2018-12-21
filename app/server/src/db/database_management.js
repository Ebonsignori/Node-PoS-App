const pgtools = require("pgtools");
const logger = require("../config/logging");

const config = {
    user: process.env.POSTGRES_USER,
    host: process.env.DATABASE_URL,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
};

async function createDatabase() {
    try {
        await pgtools.createdb(config, process.env.POSTGRES_DB)
    } catch (err) {
        if (err) {
            throw err;
        }
    }
    logger.info(`Database: ${process.env.POSTGRES_DB} created.`);
}

async function dropDatabase() {
    try {
        await pgtools.dropdb(config, process.env.POSTGRES_DB)
    } catch (err) {
        if (err) {
            throw err;
        }
    }
    logger.debug(`Database: ${process.env.POSTGRES_DB} dropped.`);
}

module.exports = {
    createDatabase: createDatabase,
    dropDatabase: dropDatabase
};

