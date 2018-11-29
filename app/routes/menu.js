const queries = require("../db/queries");
const db  = require("../db");
const chalk = require("chalk");
const router = require('express').Router();
const logger = require("../config/logging");


// At /menu, return entire menu
router.get("/", async function returnMenu(req, res) {
    const results = await db.query(queries.menu.get);
    res.status(200).json({menu: results.rows});
});

router.post("/add", async function addMenuItem(req, res) {

    const insert_res = await db.query(queries.menu.new_item, [
        req.query.item_name,
        req.query.price,
        req.query.category,
        new Date(),
        new Date()
    ]);
    console.log(insert_res);
    res.status(200);
});

module.exports = router;