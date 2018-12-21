const queries = require("../db/queries");
const db  = require("../db");
const router = require('express').Router();
const logger = require("../config/logging");

// =================================================
// Routes
// =================================================

// Get all categories or create a new one
router.route("/")
    .get(returnCategories)
    .post(addCategory);

// Get a specific menu_category, edit an existing menu_category, or delete a menu_category by its name
router.route("/:category_name", )
    .get(getSpecificCategory)
    .put(editCategory)
    .delete(deleteCategory);


// =================================================
// Category Route Logic
// =================================================

// Get every menu_category entry
async function returnCategories(req, res) {
    try {
        const results = await db.query(queries.menu_category.get);
        res.status(200).json(results.rows);
    } catch (err) {
        logger.warn(err);
        res.status(500).json({error: "An internal error occurred. Please contact an admin."});
    }
}

// Add a new item menu_category
async function addCategory(req, res) {
    // Validate request
    if (!req.body.category_name || typeof req.body.category_name !== "string") {
        return res.status(400).json({error: `You must pass in: {category_name: "Your name here"}`});
    }

    try {
        const insert_res = await db.query(queries.menu_category.add_category, [
            req.body.category_name,
            new Date()
        ]);
        if (insert_res && insert_res.rows && insert_res.rows[0]) {
            return res.status(200).json(insert_res.rows[0]);
        } else {
            return res.status(500).json({
                error: `Something went wrong when trying to add a new category. Please contact an admin.`,
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(500).json({
            error: `Something went wrong when trying to add a new category. Please contact an admin.`,
        });
    }
}

// Get a menu_category item (Could be used to check if the menu_category exists)
async function getSpecificCategory(req, res) {
    // Validate request
    if (!req.params.category_name || typeof req.params.category_name !== "string") {
        return res.status(400).json({
            error: `Must specify a category name to get as category_name`
        });
    }

    try {
        const get_res = await db.query(queries.menu_category.get_category, [
            req.params.category_name
        ]);
        if (get_res && get_res.rows && get_res.rows[0]) {
            return res.status(200).json(get_res.rows[0]);
        } else {
            return res.status(404).json({
                error: `Category with category_name: ${req.params.category_name} not found`,
                category_name: req.params.category_name
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Category with category_name: ${req.params.category_name} not found`,
            category_name: req.params.category_name
        });
    }
}

// Edit specific menu_category using the menu_category's name to reference the menu_category to be edited
async function editCategory(req, res) {
    // Validate request. (Params contains the menu_category name to be edited and body contains the new menu_category name)
    if (!req.params.category_name || typeof req.params.category_name !== "string"
        || !req.body.category_name || typeof req.body.category_name !== "string" ) {
        return res.status(400).json({
            error: `Must specify the name of the category you wish you edit as category_name in the request parameter, and the name you wish to change the category to as category_name in the request body`
        });
    }

    // First get the existing menu_category to check if it exists (TODO: Is there an easier way to do this / add if not exist?)
    try {
        const get_res = await db.query(queries.menu_category.get_category, [
            req.params.category_name
        ]);
        if (!get_res || !get_res.rows || !get_res.rows[0]) {
            return res.status(404).json({
                error: `Category with category_name: ${req.params.category_name} not found`,
                category_name: req.params.category_name
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Category with category_name: ${req.params.category_name} not found`,
            category_name: req.params.category_name
        });
    }

    try {
        const edit_res = await db.query(queries.menu_category.edit_category, [
            req.params.category_name,
            req.body.category_name
        ]);
        if (edit_res && edit_res.rows && edit_res.rows[0]) {
            return res.status(200).json(edit_res.rows[0]);
        } else {
            return res.status(500).json({
                error: `Something went wrong when trying to edit category: ${req.params.category_name}. Please contact an admin.`,
                category_name: req.params.category_name
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(500).json({
            error: `Something went wrong when trying to edit category: ${req.params.category_name}. Please contact an admin.`,
            category_name: req.params.category_name
        });
    }
}

// Delete a specific menu_category by name. Will set all referencing menu items to a `null` menu_category
async function deleteCategory(req, res) {
    // Validate request
    if (!req.params.category_name || typeof req.params.category_name !== "string") {
        return res.status(400).json({
            error: `Must specify a category name to delete as category_name`
        });
    }

    try {
        const delete_res = await db.query(queries.menu_category.remove_category, [
            req.params.category_name
        ]);
        if (delete_res && delete_res.rows && delete_res.rows[0]) {
            return res.status(200).json(delete_res.rows[0]);
        } else {
            return res.status(404).json({
                error: `Category with category_name: ${req.params.category_name} not found`,
                category_name: req.params.category_name
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Category with category_name: ${req.params.category_name} not found`,
            category_name: req.params.category_name
        });
    }
}

module.exports = router;