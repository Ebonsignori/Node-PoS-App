const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();

const db = require("../app/db/index");
const database_management = require("../app/db/database_management");
const queries = require("../app/db/queries");
const templates = require("./templates");
const chalk = require("chalk");

let database_created = true;
before("Database should be created", async function databaseInit() {
    // Start server
    await require("../app/app").main();

    // Populate database with test data (templates)
    try {
        // First add categories
        for await (let category of templates.menu_category) {
            await db.query(queries.menu_category.add_category, [category, new Date()]);
        }
        console.log("Added categories");
        // Then add menu items
        for await (let menu_item of templates.menu) {
            await db.query(queries.menu.add_item, [
                menu_item.item_name, menu_item.item_price, menu_item.category, menu_item.created_date
            ]);
        }
    } catch (err) {
        console.log(err);
        database_created = false;
    }

});

console.log(chalk.green.bold("\n- - - Begin tests - - -"));
describe("Testing Database", () => {
    it ("was created", () => {
        database_created.should.equal(true);
    });

    it("has the correct number of inserted entries", async () => {
        const get_ret_val = await db.query(queries.menu.get);
        // Each menu item should be inserted
        get_ret_val.rows.length.should.equal(Object.keys(templates.menu).length);
    })
});

/* Load tests here in desired order */
require("./tests/menu");
require("./tests/menu_category");

after("Database should be taken down", async function takeDownDatabase() {
    let database_dropped= true;

    try {
        db.closeConnection();
        await database_management.dropDatabase();
    } catch (err) {
        console.log(err);
        database_dropped = false;
    }

    if (database_dropped) {
        console.log(chalk.red.bold("\n- - - End tests - - -\n"));
        process.exit(0);
    } else {
        console.log(chalk.yellow("Failed to drop database after tests."));
        console.log(chalk.red.bold("\n- - - End tests - - -\n"));
        process.exit(1);
    }
});