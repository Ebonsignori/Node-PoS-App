const { Pool } = require("pg");
const database_management = require("./database_management");
const tables = require("./tables");
const table_management = require("./table_management");
const logger = require("../config/logging");

let pool;


async function initializeDatabase() {
    const connection_params = {
        user: process.env.POSTGRES_USER,
        host: process.env.DATABASE_URL,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: 5432,
    };

    // If database doesn't exist, create it and populate it with tables
    try {
        pool = new Pool(connection_params);
        // If database exists and in test environment, drop it then add it
        if (process.env.NODE_ENV === "testing") {
            try {
                await database_management.createDatabase();
            } catch (err) {
                try {
                    await database_management.dropDatabase();
                    await database_management.createDatabase();
                } catch (e) {
                    logger.error(e);
                    process.exit(1);
                }
            }
            try {
                await table_management.createOrDropTables(pool, "CREATE");
            } catch (err) {
                logger.error("Error creating tables for test environment...");
                logger.error(err);
            }
        }
    } catch (e) {
        await database_management.createDatabase();
        pool = new Pool(connection_params);
        await table_management.createOrDropTables(pool, "CREATE");
    }

    // Listen for database connections
    pool.on("connect", () => {
        logger.debug("Connected to the db");
    });

    // Return pool object
    return pool;
}

async function query(text, params) {
    if (!pool) {
        throw "Call initializeDatabase first";
    }
    const results = await pool.query(text, params).catch((err) => {
        if (err) {
            throw err;
        }
    });
    logger.silly(`Executed query: ${text} :: Query Rows: ${results ? results.rowCount : undefined}`);
    return results;
}

function closeConnection() {
    pool.end();
}

module.exports = {
    initializeDatabase: initializeDatabase,
    query: query,
    closeConnection: closeConnection
};