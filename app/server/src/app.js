'use strict';

const express = require("express");
const app = express();
const db = require("./db/index");
const table_management = require("./db/table_management");
const logger = require("./config/logging");
const chalk = require("chalk");

async function main() {
    const pool = await db.initializeDatabase();

    // If environment variable HANDLE_TABLES is set on program execution, then drop or create tables depending on value
    if (process.env.HANDLE_TABLES) {
        if (process.env.HANDLE_TABLES === "POPULATE") {
            await table_management.populateTables(pool);
        } else {
            await table_management.createOrDropTables(pool, process.env.HANDLE_TABLES);
        }
    }

    // Initialize express config
    require("./config/express")(app);

    // Apply routes
    app.use("/", require("./routes"));
    // Apply 404 handler
    app.use(require("./routes/route_not_found"));

    // Start express server
    app.listen(process.env.HTTP_PORT, () => {
        if (process.env.NODE_ENV !== "testing") {
            logger.info(chalk`
                      Backend is up and listening.
                      On port: {magenta.bold ${process.env.HTTP_PORT}}.
                    `);
        }
    });
}

// For testing export main module, otherwise run it
if (process.env.NODE_ENV === "testing") {
    module.exports = {
        main: main,
        app: app
    };
} else {
    main();
}

// .catch((error) => {
//     logger.error("FATAL: An uncaught error occurred:");
//     logger.error(error);
//     process.exit(0);
// });