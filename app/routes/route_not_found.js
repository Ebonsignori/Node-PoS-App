const logger = require("../config/logging");
const chalk = require("chalk");

module.exports = (req, res, next) => {
    logger.warn(chalk`Route 404 on: {red ${req.url}}`);
    res.status(404).end("Error.");
};