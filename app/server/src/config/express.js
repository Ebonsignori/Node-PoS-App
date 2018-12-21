const cors = require('cors');
const chalk = require('chalk');
const logger = require('./logging');
const express = require("express");

// Initialize Express config
module.exports = (app) => {
    // Configure and apply cors
    const cors_options = {
        origin: process.env.ALLOWED_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    };
    app.use(cors(cors_options));

    // Apply parsing middleware
    app.use(express.json()); // For parsing application/json
    app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

    // Log each url in debug mode
    app.use((req, res, next) => {
        logger.debug(chalk`Route called: {magenta ${req.url}}`);
        next();
    });
};

