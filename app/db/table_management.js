const logger = require("../config/logging");
const tables = require("./tables");
const util = require('util');

async function createOrDropTables(pool, option) {
    logger.silly(`HANDLE_TABLES Environment variable is set to: ${process.env.HANDLE_TABLES}`);

    if (option && option === "DROP") {
        await dropTables(pool);
        logger.info("Exiting...");
        process.exit(0);
    } else if (option && option === "CREATE") {
        await createTables(pool);
        if (process.env.HANDLE_TABLES === "CREATE") {
            logger.info("Exiting...");
            process.exit(0);
        }
    }
}

/* Create Tables */
async function createTables(pool) {
    if (!pool) {
        throw "Must pass pool after calling initializeDatabase";
    }


    // Create types before creating tables
    try {
        await pool.query(`CREATE TYPE category AS ENUM (${"'" + ['entree', 'side', 'drink', 'sandwich'].join("', '") + "'"})`);
    } catch (err) {
        logger.error(err);
    }

    /* Create a table using (key, value) pairs of (table_name, table_query) from tables.js
        - table[1] = Part of the query to create the table.
        - table[0] = The name of the table */
    for await (const table of Object.entries(tables)) {
        let created = true;
        try {
            const res = await pool.query(`CREATE TABLE IF NOT EXISTS ${table[1]}`);
            // logger.debug(util.inspect(res, {showHidden: false, compact: false, colors: true}));
        } catch(err) {
            logger.error(err);
            created = false;
        }
        if (created) {
            logger.info(`Table: ${table[0]} created.`);
        }
    }
    // Close pool after creating tables
    pool.end();
}

/* Drop Tables */
async function dropTables(pool) {
    if (!pool) {
        throw "Must pass pool after calling initializeDatabase";
    }

    /* Drop each table using (key, value) pairs of (table_name, table_query) from tables.js
         - table[1] = Part of the query to create the table.
         - table[0] = The name of the table */
    for await (const table of Object.entries(tables)) {
        let dropped = true;
        try {
            const res = await pool.query(`DROP TABLE IF EXISTS ${table[1]}`);
            // logger.debug(util.inspect(res, {showHidden: false, compact: false, colors: true}));
        } catch(err) {
            logger.error(err);
            pool.end();
            dropped = false;
        }
        if (dropped) {
            logger.info(`Table: ${table[0]} dropped.`);
        }
    }
    // Close pool after dropping tables
    pool.end();
}

module.exports = {
    createOrDropTables: createOrDropTables,
};