const logger = require("../config/logging");
const tables = require("./tables");
const util = require('util');

async function createOrDropTables(pool, option) {
    logger.silly(`HANDLE_TABLES Environment variable is set to: ${process.env.HANDLE_TABLES}`);

    if (option && option === "DROP") {
        await dropTables(pool, false);
        // Only exit if script that set environment variable was run
        if (process.env.HANDLE_TABLES === "DROP") {
            logger.info("Exiting...");
            process.exit(0);
        }
    } else if (option && option === "CREATE") {
        await createTables(pool, false);
        // Only exit if script that set environment variable was run
        if (process.env.HANDLE_TABLES === "CREATE") {
            logger.info("Exiting...");
            process.exit(0);
        }
    }
}

/* Create Tables */
async function createTables(pool, close_pool) {
    if (!pool) {
        throw "Must pass pool after calling initializeDatabase";
    }

    /* Create a table using (key, value) pairs of (table_name, table_query) from tables.js
        - table[1] = Part of the query to create the table.
        - table[0] = The name of the table */
    for await (const table of Object.entries(tables)) {
        let created = true;
        try {
            const res = await pool.query(`CREATE TABLE IF NOT EXISTS ${table[1]}`);
            // logger.debug(util.inspect(res, {showHidden: false, compact: false, colors: true}));
        // Will be error if already exists
        } catch(err) {
            created = false;
        }
        if (created) {
            logger.info(`Table: ${table[0]} created.`);
        }
    }
    // Close pool after creating tables
    if (close_pool) {
        pool.end();
    }
}

/* Create types */
// async function createTypes(pool) {
//     // Create types before creating tables
//     for await (const type of Object.entries(require("./types.json"))) {
//         let created = true;
//         try {
//             await pool.query(`CREATE TYPE ${type[0]} AS ENUM (${"'" + type[1].join("', '") + "'"})`);
//             // Will be error if already exists
//         } catch (err) {
//             created = false;
//         }
//         if (created) {
//             logger.info(`Type: ${type[0]} created.`);
//         }
//     }
// }

/* Drop Tables */
async function dropTables(pool, close_pool) {
    if (!pool) {
        throw "Must pass pool after calling initializeDatabase";
    }

    /* Drop each table using (key, value) pairs of (table_name, table_query) from tables.js
         - table[1] = Part of the query to create the table.
         - table[0] = The name of the table */
    for await (const table of Object.entries(tables)) {
        let dropped = true;
        try {
            const res = await pool.query(`DROP TABLE IF EXISTS ${table[0]}`);
            // logger.debug(util.inspect(res, {showHidden: false, compact: false, colors: true}));
        } catch(err) {
            logger.error(err);
            dropped = false;
        }
        if (dropped) {
            logger.info(`Table: ${table[0]} dropped.`);
        }
    }
    // Close pool after dropping tables
    if (close_pool) {
        pool.end();
    }
}

/* Create types */
// async function dropTypes(pool) {
//     for await (const type of Object.entries(require("./types.json"))) {
//         let created = true;
//         try {
//             await pool.query(`DROP TYPE ${type[0]}`);
//             // Will be error if already exists
//         } catch (err) {
//             created = false;
//         }
//         if (created) {
//             logger.info(`Type: ${type[0]} dropped.`);
//         }
//     }
// }


module.exports = {
    createOrDropTables: createOrDropTables,
};