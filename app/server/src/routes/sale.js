const queries = require("../db/queries");
const db  = require("../db");
const router = require('express').Router();
const logger = require("../config/logging");
const validate = require("../utility/validate");

// =================================================
// Routes
// =================================================
/*
   Route: "/sale/:sale_id"
   Get or delete a specific sale
 */
router.route("/:sale_id(\\d+)")
    .get(getSpecificSale)
    .delete(deleteSale);

/*
   Route: "/sale/:sale_id/:action"
   Add, remove, or edit an item from a sale depending on the specified action
     Action can be: add, remove, edit, change_tax, change_date
 */
router.put("/:sale_id(\\d+)/:action", editSale);

/*
    Route: "/sale/"
    Add a new sale
 */
router.post("/", newSale);

// =================================================
// Sale Route Logic
// =================================================

// Add a new sale
async function newSale(req, res) {
    // Validate request
    if (!req.body.tax_percent || Number.isNaN(Number(req.body.tax_percent))
        || !req.body.total || !Number.isInteger(Number(req.body.total))
        || !req.body.items
        || (req.body.sale_date ? !Date.parse(req.body.sale_date) : false)) {
        return res.status(400).json({error: `You must pass in the following parameters: {
            total: integer, // in cents,
            tax_percent: number, // 2 decimal digits ex. .07 = 7%
            items: [  // Array of items involved in sale
                {
                   item_name: string
                   item_price: integer // in cents
                   quantity: integer // in cents
                }, 
                {...},
                {...},
                ...
            ],
            sale_date: (optional) Date() object
        }`});
    }

    // Validate items array
    if (!Array.isArray(req.body.items) || req.body.items.length < 1 || typeof req.body.items[0] !== "object") {
        return res.status(400).json({
            error: "Items must be an array of menu objects. Each menu object must contain item_name, item_price, and quantity",
            items: req.body.items
        });
    // Validate each item in the items array
    } else {
        const error_message = validate.validateSaleItems(req.body.items);
        if (error_message) {
            return res.status(400).json({
                error: error_message,
                items: req.body.items
            });
        }
    }
    // Validate total field using declared item and the tax and total passed in
    if (!validate.validateSaleTotal(req.body.items, req.body.tax_percent, req.body.total)) {
        return res.status(400).json({
            error: `Total is not correct. Check tax and total amounts. ` +
                `Make sure total is an integer of its decimal USD amounts scaled by 100, ` +
                `and tax_percent is in decimal ex. .07 = 7%`,
            total: req.body.total,
            tax_percent: req.body.tax_percent,
            items: req.body.items
        });
    }


    try {
        const insert_res = await db.query(queries.sale.new_sale, [
            req.body.tax_percent,
            req.body.total,
            JSON.stringify(req.body.items),
            new Date(),
            req.body.sale_date ? req.body.sale_date : new Date()
        ]);
        if (insert_res && insert_res.rows && insert_res.rows[0]) {
            return res.status(200).json(insert_res.rows[0]);
        } else {
            return res.status(500).json({
                error: `Something went wrong when trying to add post the new sale. Please contact an admin.`,
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(500).json({
            error: `Something went wrong when trying to add post the new sale. Please contact an admin.`,
        });
    }
}

// Get a specific sale by the sale's id
async function getSpecificSale(req, res) {
    // Validate request
    if (!Number.isInteger(Number(req.params.sale_id))) {
        return res.status(400).json({
            error: `Invalid sale_id: ${req.params.sale_id}`,
            sale_id: req.params.sale_id
        });
    }

    try {
        const get_res = await db.query(queries.sale.get_sale, [
            req.params.sale_id
        ]);
        if (get_res && get_res.rows && get_res.rows[0]) {
            return res.status(200).json(get_res.rows[0]);
        } else {
            return res.status(404).json({
                error: `Sale with sale_id: ${req.params.sale_id} not found`,
                sale_id: req.params.sale_id
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Sale with sale_id: ${req.params.sale_id} not found`,
            sale_id: req.params.sale_id
        });
    }
}

// Edit a specific sale using the sale's id
async function editSale(req, res) {
    // Validate request param: sale_id
    if (!Number.isInteger(Number(req.params.sale_id))) {
        return res.status(400).json({
            error: `Invalid sale_id: ${req.params.sale_id}`,
            sale_id: req.params.sale_id
        });
    }
    // Validate request param: action. Can only be "add", "edit", "remove", "change_tax", or "change_date"
    const edit_action = String(req.params.action).toLowerCase();
    if (!["add", "edit", "remove", "change_tax", "change_date"].includes(edit_action)) {
        return res.status(400).json({
            error: `Invalid action: ${req.params.action}. Must be "add", "edit", "remove", "change_tax", or "change_date"`,
            action: req.params.action
        });
    }

    // Validate request body: total. Total must be passed in and calculated on client to match server-side calculations
    if (edit_action !== "change_date" && (!req.body.total || !Number.isInteger(Number(req.body.total)))) {
        return res.status(400).json({
            error: `Invalid or nonexistent body param total: ${req.body.total}. ` +
                 `Make sure it is an integer of its decimal USD amount scaled by 100. ` +
                 `Total is required for all edits to verify that the client's expected calculations match ` +
                 `server-side calculations.`,
            total: req.body.total
        });
    }

    // First get the existing sale
    let old_sale;
    try {
        const get_res = await db.query(queries.sale.get_sale, [
            req.params.sale_id
        ]);
        if (!get_res || !get_res.rows || !get_res.rows[0]) {
            return res.status(404).json({
                error: `Sale with sale_id: ${req.params.sale_id} not found`,
                sale_id: req.params.sale_id
            });
        }
        old_sale = get_res.rows[0];
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Sale with sale_id: ${req.params.sale_id} not found`,
            sale_id: req.params.sale_id
        });
    }

    // If tax_percent is specified, update with new tax_percent
    if (req.body.tax_percent) {
        // Validate request body: tax_percent. Must be in decimal
        if (!req.body.tax_percent || Number.isNaN(Number(req.body.tax_percent))) {
            return res.status(400).json({
                error: `Invalid body param tax_percent: ${req.body.tax_percent}. ` +
                    `Make sure it is a decimal. For example: .07 = 7%, .10 = %10, and so on.`,
                tax_percent: req.body.tax_percent
            });
        }
        // Update sale with new tax_percent
        old_sale.tax_percent = req.body.tax_percent;
    }


    // If the edit action is add, validate that new item(s) were passed in as an array
    if (edit_action === "add") {
        if (!req.body.items || !Array.isArray(req.body.items)) {
            return res.status(400).json({
                error: `An "add" action requires an array with name "items" of item objects to be added.`,
                items: req.body.items
            });
        }
        // Add the new items
        for (const item of req.body.items) {
            old_sale.items.push(item)
        }
    }

    // If the edit action is edit
    if (edit_action === "edit") {
        // Validate that the item to edit is passed in as "new_item"
        if (!req.body.item || typeof req.body.item !== "object") {
            return res.status(400).json({
                error: `An "edit" action requires an object with name "item".`,
                item: req.body.item
            });
        }
        // Validate that the contents of new_items are valid
        const error_message = validate.validateSaleItems([req.body.item]);
        if (error_message) {
            return res.status(400).json({
                error: error_message,
                item: req.body.item
            });
        }
        const new_item = req.body.item;

        // Replace the existing item with the new item
        let item_found = false;
        for (let i = 0; i < old_sale.items.length; i++) {
            if (old_sale.items[i].item_name === new_item.item_name) {
                old_sale.items[i] = new_item;
                item_found = true;
                break;
            }
        }
        if (!item_found) {
            return res.status(400).json({
                error: `Existing item that matches new_item's name: ${new_item.item_name} not found.` +
                    `If you'd like to add a new item instead of edit an existing one, call this route using the` +
                    `"/add" parameter instead of "/edit".`,
                item: new_item
            });
        }
    }

    // If the edit action is remove, validate that new item(s) were passed in as an array
    if (edit_action === "remove") {
        if (!req.body.items || !Array.isArray(req.body.items)) {
            return res.status(400).json({
                error: `A "remove" action requires an array with name "items" of item objects to be removed.`,
                items: req.body.items
            });
        }
        const items_to_delete = req.body.items;
        const items_found = Array(items_to_delete.length).fill(false);
        // Check if each item exists. If it does, delete it
        for (let i = 0; i < items_to_delete.length; i++) {
            // Iterate backwards over items so that splicing doesn't affect indexing
            for (let j = old_sale.items.length - 1; j >= 0; j--) {
                if (items_to_delete[i].item_name === old_sale.items[j].item_name) {
                    old_sale.items.splice(j, 1);
                    items_found[i] = true;
                    break;
                }
            }
            // If the item wasn't found, return 400 status error.
            if (!items_found[i]) {
                return res.status(400).json({
                    error: `Existing item that matches item to delete's name: ${items_to_delete[i].item_name} not` +
                        `found. Please make sure that each item you wish to delete exists in the current sale`,
                    items: items_to_delete
                });
            }
        }
    }

    // Calculate new total and validate it only if the edit action wasn't "change_date".
    const new_date = req.body.sale_date ? Date.parse(req.body.sale_date) : false;
    if (edit_action !== "change_date") {
        // Calculate and update the new total
        old_sale.total = validate.validateSaleTotal(old_sale.items, old_sale.tax_percent);

        // Verify that the new total matches the total the client expected (calculated on their end)
        if (old_sale.total !== Number(req.body.total)) {
            return res.status(400).json({
                error: `Total is not correct. Check tax and total amounts. ` +
                    `Make sure total is an integer of its decimal USD amounts scaled by 100, ` +
                    `and tax_percent is in decimal ex. .07 = 7%`,
                client_expected_total: req.body.total,

                server_total: old_sale.total,
                server_tax_percent: old_sale.tax_percent,
                server_items: old_sale.items
            });
        }
    // Otherwise, just validate the passed in date
    } else {
        if (!new_date) {
            return res.status(400).json({
                error: `Invalid sale_date: ${req.body.sale_date}. Date must JavaScript Date.parse()-able`,
                sale_date: req.body.sale_date
            })
        }
    }

    // Update the existing sale entry with the new entry
    try {
        const edit_res = await db.query(queries.sale.edit_sale, [
            old_sale.id,
            old_sale.tax_percent,
            old_sale.total,
            JSON.stringify(old_sale.items),
            new Date(),
            new_date ? new Date(new_date) : old_sale.created_date
        ]);
        if (edit_res && edit_res.rows && edit_res.rows[0]) {
            return res.status(200).json(edit_res.rows[0]);
        } else {
            return res.status(500).json({
                error: `Something when wrong when trying to edit sale with sale_id: ${req.params.sale_id}. Please contact an admin.`,
                sale_id: req.params.sale_id
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(500).json({
            error: `Something when wrong when trying to edit sale with sale_id: ${req.params.sale_id}. Please contact an admin.`,
            sale_id: req.params.sale_id
        });
    }
}

// Delete a specific sale using the sale's id
async function deleteSale(req, res) {
    // Validate request
    if (!Number.isInteger(Number(req.params.sale_id))) {
        return res.status(400).json({
            error: `Invalid sale_id: ${req.params.sale_id}`,
            sale_id: req.params.sale_id
        });
    }

    try {
        const delete_res = await db.query(queries.sale.remove_sale, [
            req.params.sale_id
        ]);
        if (delete_res && delete_res.rows && delete_res.rows[0]) {
            return res.status(200).json(delete_res.rows[0]);
        } else {
            return res.status(404).json({
                error: `Sale with sale_id: ${req.params.sale_id} not found`,
                sale_id: req.params.sale_id
            });
        }
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Sale with sale_id: ${req.params.sale_id} not found`,
            sale_id: req.params.sale_id
        });
    }
}

module.exports = router;