const logger = require("../config/logging");
const tables = require("./tables");
const queries = require("./queries");
const templates = require("../config/templates");

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
            await pool.query(`CREATE TABLE ${table[1]}`);
        // Will be error if already exists
        } catch(err) {
            created = false;
        }
        if (created) {
            logger.info(`Table: ${table[0]} created.`);
        } else {
            logger.warn(`Table: ${table[0]} not created. It's likely that is already exists.`)
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
    // Iterate backwards so that tables with foreign keys are dropped first
    const table_keys = Object.keys(tables);
    for (let i = table_keys.length - 1; i >= 0; i--) {
        let dropped = true;
        try {
            await pool.query(`DROP TABLE ${table_keys[i]}`);
        } catch(err) {
            logger.error(err);
            dropped = false;
        }
        if (dropped) {
            logger.info(`Table: ${table_keys[i]} dropped.`);
        } else {
            logger.warn(`Table: ${table_keys[i]} not dropped. It's likely that it doesn't exists.`)
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


async function populateTables(pool) {
    // Populate database with test data (templates)
    try {
        // First add categories
        for await (let category of templates.menu_category) {
            await pool.query(queries.menu_category.add_category, [category, new Date()]);
        }

        // Then add menu items
        for await (let menu_item of templates.menu) {
            await pool.query(queries.menu.add_item, [
                menu_item.item_name, menu_item.item_price, menu_item.category, menu_item.created_date
            ]);
        }

        // Add sales
        for await (let sale of templates.sale) {
            await pool.query(queries.sale.new_sale, [
                sale.tax_percent, sale.total, JSON.stringify(sale.items), new Date(), sale.sale_date
            ]);
        }

        logger.info("Tables populated successfully!")
    } catch (err) {
        logger.error(err);
        logger.warn("Something went wrong when trying to populate tables.")
    }

    pool.end();
    logger.info("Exiting...");
    process.exit(0);
}

module.exports = {
    createOrDropTables: createOrDropTables,
    populateTables: populateTables
};