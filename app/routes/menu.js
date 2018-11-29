const queries = require("../db/queries");
const db  = require("../db");
const chalk = require("chalk");
const router = require('express').Router();
const logger = require("../config/logging");

// =================================================
// Routes
// =================================================

// Return entire menu
router.route("/")
    .get(returnMenu);

// RESTfully perform CRUD operations a specific menu item by its id
router.route("/:item_id", )
    .get(getSpecificMenuItem)
    .post(addMenuItem)
    .delete(deleteMenuItem)
    .put(editMenuItem);


// =================================================
// Route Logic
// =================================================

// Get every menu entry
async function returnMenu(req, res) {
    const results = await db.query(queries.menu.get);
    res.status(200).json({menu: results.rows});
}

// Get a specific menu item TODO: Test and improve cases
async function getSpecificMenuItem(req, res) {
    try {
        const get_res = await db.query(queries.menu.get_item, [
            req.query.item_id
        ]);
    } catch (err) {
        logger.error(err);
        res.status(400);
    }
    res.status(200).json({bear: get_res.rows[0]});
}

// Add a new item to the menu TODO: Test and improve cases
async function addMenuItem(req, res) {
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
}

// Delete a specific item on menu using the item's id TODO: Test and improve cases
async function deleteMenuItem(req, res) {
    const delete_res = await db.query(queries.menu.remove_item, [
        req.query.item_id
    ]);
    res.status(200);
}

// Edit specific item on menu using the item's id TODO: Test and improve cases
async function editMenuItem(req, res) {
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
}

module.exports = router;