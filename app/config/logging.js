const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: process.env.LOGGING_LEVEL,
    format: format.combine(
        format.colorize(),
        format.timestamp({
            format: 'HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [new transports.Console()]
});

// Print selected logging level at selected logging level
switch (process.env.LOGGING_LEVEL) {
    case "silly":
        logger.silly("Logging level set to: silly");
        break;
    case "debug":
        logger.debug("Logging level set to: debug");
        break;
    case "info":
        logger.info("Logging level set to: info");
        break;
    case "warn":
        logger.warn("Logging level set to: warn");
        break;
    case "error":
        logger.error("Logging level set to: error");
        break;
}

module.exports = logger;