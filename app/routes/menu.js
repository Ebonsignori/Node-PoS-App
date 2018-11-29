const queries = require("../db/queries");
const db  = require("../db");
const chalk = require("chalk");
const router = require('express').Router();
const logger = require("../config/logging");


// Get every menu entry
router.get("/", async function returnMenu(req, res) {
    const results = await db.query(queries.menu.get);
    res.status(200).json({menu: results.rows});
});

// Add a new item to the menu TODO: Test and improve cases
router.post("/add", async function addMenuItem(req, res) {
    try {
        const insert_res = await db.query(queries.menu.add_item, [
            req.query.item_name,
            req.query.price,
            req.query.category,
            new Date(),
            new Date()
        ]);
    } catch (err) {
        logger.error(err);
        res.status(400);
    }
    res.status(200);
});

// Delete a specific item on menu using the item's id TODO: Test and improve cases
router.delete("/remove", async function addMenuItem(req, res) {
    const delete_res = await db.query(queries.menu.remove_item, [
        req.query.item_id
    ]);
    res.status(200);
});

// Edit specific item on menu using the item's id TODO: Test and improve cases
router.put("/edit", async function editMenuItem(req, res) {
    const edit_item_query = queries.menu.edit_item(req.query.item_id, {
        item_name: req.query.item_name ? req.query.item_name : undefined,
        item_price: req.query.item_price ? req.query.item_price : undefined,
        category: req.query.category ? req.query.category : undefined,
    });
    try {
        const edit_res = await db.query(edit_item_query[0], edit_item_query[1]);
    } catch (err) {
        logger.error(err);
        res.status(400);
    }
    res.status(200);
});

// Get specific item on menu TODO: Test and improve cases
router.get("/get/:item_id", async function deleteMenuItem(req, res) {
    try {
        const get_res = await db.query(queries.menu.get_item, [
            req.query.item_id
        ]);
    } catch (err) {
        logger.error(err);
        res.status(400);
    }
    res.status(200).json({bear: get_res.rows[0]});
});

module.exports = router;