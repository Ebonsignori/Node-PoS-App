const queries = require("../db/queries");
const db  = require("../db");
const router = require('express').Router();
const logger = require("../config/logging");

// =================================================
// Routes
// =================================================

// Return entire menu
router.route("/")
    .get(returnMenu)
    .post(addMenuItem);

// RESTfully perform CRUD operations a specific menu item by its id
router.route("/:item_id", )
    .get(getSpecificMenuItem)
    .delete(deleteMenuItem)
    .put(editMenuItem);


// =================================================
// Route Logic
// =================================================

// Get every menu entry
async function returnMenu(req, res) {
    try {
        const results = await db.query(queries.menu.get);
        res.status(200).json(results.rows);
    } catch (err) {
        logger.warn(err);
        res.status(500).json({error: "An internal error occurred. Please contact an admin."});
    }
}

// Get a specific menu item
async function getSpecificMenuItem(req, res) {
    // Validate request
    if (!Number.isInteger(Number(req.params.item_id))) {
        return res.status(400).json({
            error: `Invalid menu item_id: ${req.params.item_id}`,
            item_id: req.params.item_id
        });
    }

    try {
        const get_res = await db.query(queries.menu.get_item, [
            req.params.item_id
        ]);
        if (get_res && get_res.rows && get_res.rows[0]) {
            return res.status(200).json(get_res.rows[0]);
        } else {
            return res.status(404).json({
                error: `Item with id: ${req.params.item_id} not found`,
                item_id: req.params.item_id
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Item with id: ${req.params.item_id} not found`,
            item_id: req.params.item_id
        });
    }
}

// Add a new item to the menu
async function addMenuItem(req, res) {
    // Validate request
    if (!req.body.item_name || typeof req.body.item_name !== "string"
        || !Number.isInteger(Number(req.body.item_price))
        || !req.body.category || typeof req.body.category !== "string") {
        return res.status(400).json({error: `You must pass in the following parameters: {
            item_name: "string",
            item_price: integer // in cents,
            category: "string" // An existing category selection. Call get("/menu/category") to get a list of categories
        }`});
    }

    try {
        const insert_res = await db.query(queries.menu.add_item, [
            req.body.item_name,
            req.body.item_price,
            req.body.category,
            new Date()
        ]);
        if (insert_res && insert_res.rows && insert_res.rows[0]) {
            return res.status(200).json(insert_res.rows[0]);
        } else {
            return res.status(400).json({
                error: `category must be an existing category. Call get("/menu/category") to get a list of categories`,
                category: req.body.category
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(400).json({
            error: `category must be an existing category. Call get("/menu/category") to get a list of categories`,
            category: req.body.category
        });
    }
}

// Delete a specific item on the menu using the item's id
async function deleteMenuItem(req, res) {
    // Validate request
    if (!Number.isInteger(Number(req.params.item_id))) {
        return res.status(400).json({
            error: `Invalid menu item_id: ${req.params.item_id}`,
            item_id: req.params.item_id
        });
    }

    try {
        const delete_res = await db.query(queries.menu.remove_item, [
            req.params.item_id
        ]);
        if (delete_res && delete_res.rows && delete_res.rows[0]) {
            return res.status(200).json(delete_res.rows[0]);
        } else {
            return res.status(404).json({
                error: `Item with id: ${req.params.item_id} not found`,
                item_id: req.params.item_id
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Item with id: ${req.params.item_id} not found`,
            item_id: req.params.item_id
        });
    }
}

// Edit specific item on menu using the item's id
async function editMenuItem(req, res) {
    // Validate request
    if (!Number.isInteger(Number(req.params.item_id))) {
        return res.status(400).json({
            error: `Invalid menu item_id: ${req.params.item_id}`,
            item_id: req.params.item_id
        });
    }

    // First get the existing item to check if it exists (TODO: Is there an easier way to do this / add if not exist?)
    try {
        const get_res = await db.query(queries.menu.get_item, [
            req.params.item_id
        ]);
        if (!get_res || !get_res.rows || !get_res.rows[0]) {
            return res.status(404).json({
                error: `Item with id: ${req.params.item_id} not found`,
                item_id: req.params.item_id
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Item with id: ${req.params.item_id} not found`,
            item_id: req.params.item_id
        });
    }

    // Generate edit item query. Will return array of: [query_string, query_args_array]
    const edit_item_query = queries.menu.edit_item(req.params.item_id, {
        item_name: req.body.item_name ? req.body.item_name : undefined,
        item_price: req.body.item_price ? req.body.item_price : undefined,
        category: req.body.category ? req.body.category : undefined,
    });

    try {
        const edit_res = await db.query(edit_item_query[0], edit_item_query[1]);
        if (edit_res && edit_res.rows && edit_res.rows[0]) {
            return res.status(200).json(edit_res.rows[0]);
        } else {
            return res.status(404).json({
                error: `Item with id: ${req.params.item_id} not found`,
                item_id: req.params.item_id
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Item with id: ${req.params.item_id} not found`,
            item_id: req.params.item_id
        });
    }
}

module.exports = router;