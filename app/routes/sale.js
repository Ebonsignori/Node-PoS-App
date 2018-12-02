const queries = require("../db/queries");
const db  = require("../db");
const router = require('express').Router();
const logger = require("../config/logging");

// =================================================
// Routes
// =================================================

/*
    Route: "/sales/(optional) date"
    Return sales of an entire (or current) day with the option to specify a specific date. Defaults to past day
 */
router.get("/:date*?", returnSales);

//    Route: "/sale/:sale_id"
//    RESTfully perform RUD (CRUD without create) operations a specific sale by its id
router.route("/:sale_id", )
    .get(getSpecificSale)
    .put(editSale)
    .delete(deleteSale);

/*
    Route: "/sale/"
    Add a new sale
 */
router.post("/", newSale);

// =================================================
// Sale Route Logic
// =================================================

// Return sales of an entire (or current) day with the option to specify a specific date. Defaults to past day
async function returnSales(req, res) {
    // If date was specified, validate the date
    if (req.params.date && !Date.parse(req.params.date)) {
        return res.status(400).json({
            error: `You passed an invalid date parameter. Date must JavaScript Date.parse()-able.`,
            date: req.params.date
        });
    }

    try {
        const results = await db.query(queries.sale.get, [
            // If date is present, fetch sales from that day. Otherwise fetch sales from today (new Date() is today)
            req.params.date ?
                new Date(Date.parse(req.params.date)).toISOString().split('T')[0] :
                new Date().toISOString().split('T')[0]
        ]);
        res.status(200).json(results.rows);
    } catch (err) {
        logger.warn(err);
        res.status(500).json({error: "An internal error occurred. Please contact an admin."});
    }
}

// Add a new sale
async function newSale(req, res) {
    // Validate request
    if (!req.body.tax_percent || Number.isNaN(Number(req.body.tax_percent))
        || !req.body.total || !Number.isInteger(Number(req.body.total))
        || !req.body.items
        || (req.body.sale_date ? !Date.parse(req.body.sale_date) : false)) {
        return res.status(400).json({error: `You must pass in the following parameters: {
            total: integer, // in cents,
            tax_percent: number, // 2 decimal digits 
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
        for (const item of req.body.items) {
            if (!item.item_name || typeof item.item_name !== "string"
                || !item.item_price || !Number.isInteger(Number(item.item_price))
                || !item.quantity || !Number.isInteger(Number(item.quantity))) {
                return res.status(400).json({
                    error: `Each menu object must contain item_name, item_price, and quantity as follows:
                     {
                        item_name: "string"
                        item_price: integer // in cents
                        quantity: integer // in cents
                    }
                    `,
                    items: req.body.items
                });
            }
        }
    }

    try {
        const insert_res = await db.query(queries.sale.new_sale, [
            req.body.tax_percent,
            req.body.total,
            JSON.stringify(req.body.items),
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
    // Validate request
    if (!Number.isInteger(Number(req.params.sale_id))) {
        return res.status(400).json({
            error: `Invalid sale_id: ${req.params.sale_id}`,
            sale_id: req.params.sale_id
        });
    }

    // First get the existing item to check if it exists (TODO: Is there an easier way to do this / add if not exist?)
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
    } catch (err) {
        logger.warn(err);
        return res.status(404).json({
            error: `Sale with sale_id: ${req.params.sale_id} not found`,
            sale_id: req.params.sale_id
        });
    }

    // TODO: Validate that items with tax sum to total

    // Generate edit sale item query. Will return array of: [query_string, query_args_array]
    const edit_sale_query = queries.sale.edit_sale(req.params.sale_id, {
        tax_percent: req.body.tax_percent ? req.body.tax_percent : undefined,
        total: req.body.total ? req.body.total : undefined,
        items: req.body.items ? req.body.items : undefined,
    });

    try {
        const edit_res = await db.query(edit_sale_query[0], edit_sale_query[1]);
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