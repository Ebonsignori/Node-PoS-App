const { Pool } = require("pg");
const database_management = require("./database_management");
const tables = require("./tables");
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

    // If database doesn't exist, create it and populate it will tables
    try {
        pool = new Pool(connection_params);
    } catch (e) {
        await database_management.createDatabase();
        pool = new Pool(connection_params);
        await tables.createOrDropTables(pool, "CREATE");
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
    logger.debug(`Executed query: ${text} :: Query Rows: ${results ? results.rowCount : undefined}`);
    return results;
}

module.exports = {
    initializeDatabase: initializeDatabase,
    query: query
};