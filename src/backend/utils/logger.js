var winston = require('winston'),
    Configs = require('../utils/configs'),
    osUtils = require('../utils/osUtils'),
    Graylog2 = require('winston-graylog2').Graylog2;

var logConfig = Configs.get('logger'),
    graylog2Transport,
    logger;

var LOG = function(category) {

    if (!logger) {
        // Config winston
        var transports = [],
            transportsConfig = logConfig.transports;
        for (var i = 0; i < transportsConfig.length; i++ ) {
            if (transportsConfig[i] === 'console') {
                var config = logConfig.console;
                config.label = category;
                transports.push(new (winston.transports.Console)(config));
            } else if (transportsConfig[i] === 'graylog2') {
                if (!graylog2Transport) {
                    var config = logConfig.graylog2;
                    config.graylogHostname = process.env.NAME || require('os').hostname();
                    if (config.graylogHostname === 'Scraper Client') {
                        // add ip as surfix
                        config.graylogHostname = 'Client-' + osUtils.ipAddress();
                    }
                    graylog2Transport = new Graylog2(config);
                }
                transports.push(graylog2Transport);
            }
        }
        
        // return new logger instance
        logger = new (winston.Logger)({
          transports: transports
        });
    }

    return logger;
};

module.exports = LOG;