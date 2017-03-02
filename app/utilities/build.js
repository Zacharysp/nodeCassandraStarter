/**
 * Created by dzhang on 2/6/17.
 */

"use strict";
var bodyParser = require('body-parser');
var filters = require('./filters');
var cluster = require('cluster');
var helmet = require('helmet');

var http = require('http');
var https = require('https');

var config = require('config');
var serverConfig = config.get('serverConfig');
var cpuCount = require('os').cpus().length;

var fs = require('fs');
var constants = require('constants');

var morgan = require('morgan');
var chalk = require('chalk');

morgan.token('colormethodurlstatus', function (req, res) {
    function headersSent (res) {
        return typeof res.headersSent !== 'boolean'
            ? Boolean(res._header)
            : res.headersSent
    }
    var method = chalk.blue(req.method);
    var url = req.originalUrl || req.url;
    var status = headersSent(res) ? String(res.statusCode) : undefined;
    var statusStr = status >= 500 ? chalk.red(status)
        : status >= 400 ? chalk.yellow(status)
            : status >= 300 ? chalk.cyan(status)
                : status >= 200 ? chalk.green(status)
                    : status;
    return method + ' ' + url + ' ' + statusStr;
});

function init(app) {
    app.use(helmet());
    app.use(morgan(':date[iso] - :colormethodurlstatus :response-time ms - :res[content-length]'));
    app.use(bodyParser.json({limit: '5mb'}));
    app.use(bodyParser.urlencoded({extended: true}));
    app.disable('etag');

    app.use(filters.cors);
}

exports.start = function (app, router) {
    if (process.env.NODE_ENV == 'test') {
        startApp(app, router);
    }else if (cluster.isMaster) {
        // using cluster mode, also can remove this part
        // Create a worker for each CPU
        for (var i = 0; i < cpuCount; i += 1) {
            cluster.fork();
        }

        // Listen for dying workers
        cluster.on('exit', function () {
            cluster.fork();
        });
    } else {
        startApp(app, router);
    }
};

function startApp(app, router) {
    init(app);

    app.use(router);
    app.use(filters.notFound);
    app.use(filters.handleUnknownError);
    /**
     * Create HTTP server.
     */
    var port;
    var server;

    /**
     * Get port from environment and store in Express.
     */
    port = normalizePort(process.env.PORT || serverConfig.port);
    // Create Https server
    // if(process.env.NODE_ENV == 'production'){
    //     logger.info('Starting https server...');
    //     server = https.createServer({
    //         secureProtocol: 'SSLv23_method',
    //         secureOptions: constants.SSL_OP_NO_SSLv3,
    //         key: fs.readFileSync(serverConfig.sslKey),
    //         cert: fs.readFileSync(serverConfig.sslCert)
    //     }, app);
    // }else{

    logger.info('Starting http server...');
    server = http.createServer(app);
    app.set('port', port);

    /**:
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Normalize a port into a number, string, or false.
     */
    function normalizePort(val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                logger.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */
    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        logger.info("Listening on " + bind);
    }
}




