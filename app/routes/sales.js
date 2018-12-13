const queries = require("../db/queries");
const db  = require("../db");
const router = require('express').Router();
const logger = require("../config/logging");

// =================================================
// Routes
// =================================================
/*
    Route: "/sales/:period/date (required)"
    Return sales before/after (period) specified date
 */
router.get("/:period/:date", returnSalesDateElapsed);

/*
    Route: "/sales/(optional) date"
    Return sales of an entire (or current) day with the option to specify a specific date. Defaults to past day
 */
router.get("/:date*?", returnSalesOnDate);

// =================================================
// Sale Route Logic
// =================================================

// Return sales of an entire (or current) day with the option to specify a specific date. Defaults to past day
async function returnSalesOnDate(req, res) {
    // If date was specified, validate the date
    if (req.params.date && !Date.parse(req.params.date)) {
        return res.status(400).json({
            error: `You passed an invalid date parameter. Date must JavaScript Date.parse()-able.`,
            date: req.params.date
        });
    }

    try {
        const results = await db.query(queries.sale.get("on"), [
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

async function returnSalesDateElapsed(req, res) {
    // Validate the period
    const period = String(req.params.period).toLocaleLowerCase();
    if (!req.params.period || !["before", "after"].includes(period)) {
        return res.status(400).json({
            error: `Invalid period: ${req.params.period}.` +
                `You must enter either "before" or "after" for the :period parameter. I.e. /sales/before/:date`,
            period: req.params.period
        });
    }
    // Validate the date
    if (!req.params.date || !Date.parse(req.params.date)) {
        return res.status(400).json({
            error: `You passed an invalid date parameter. Date must JavaScript Date.parse()-able.`,
            date: req.params.date
        });
    }

    try {
        // Fetch sales before/after specified date
        const results = await db.query(queries.sale.get(period), [
                new Date(Date.parse(req.params.date)).toISOString().split('T')[0]
        ]);
        res.status(200).json(results.rows);
    } catch (err) {
        logger.warn(err);
        res.status(500).json({error: "An internal error occurred. Please contact an admin."});
    }
}

module.exports = router;