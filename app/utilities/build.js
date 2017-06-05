/**
 * Created by dzhang on 2/6/17.
 */

"use strict";
const bodyParser = require('body-parser');
const filters = require('./filters');
const cluster = require('cluster');
const helmet = require('helmet');
const cors = require('cors');

const http = require('http');
const https = require('https');

const config = require('config');
const serverConfig = config.get('serverConfig');
const cpuCount = require('os').cpus().length;

const fs = require('fs');
const constants = require('constants');

//api request colorful logging on console
const morgan = require('morgan');
const chalk = require('chalk');

morgan.token('colormethodurlstatus', (req, res) => {
    function headersSent (res) {
    return typeof res.headersSent !== 'boolean'
        ? Boolean(res._header)
        : res.headersSent
}
let method = chalk.blue(req.method);
let url = req.originalUrl || req.url;
let status = headersSent(res) ? String(res.statusCode) : undefined;
let statusStr = status >= 500 ? chalk.red(status)
    : status >= 400 ? chalk.yellow(status)
        : status >= 300 ? chalk.cyan(status)
            : status >= 200 ? chalk.green(status)
                : status;
return method + ' ' + url + ' ' + statusStr;
});

const init = (app) => {
    //Helmet secure apps by setting letious HTTP headers. ref: https://helmetjs.github.io
    app.use(helmet());
    //enable cors for all requests
    app.use(cors());
    //api request colorful logging on console
    app.use(morgan(':date[iso] - :colormethodurlstatus :response-time ms - :res[content-length]'));
    //5 mb content limit
    app.use(bodyParser.json({limit: '5mb'}));
    //should remove etag
    app.disable('etag');
};

exports.start = (app, router) => {
    if (process.env.NODE_ENV == 'test') {
        startApp(app, router);
    }else if (cluster.isMaster) {
        // Create a worker for each CPU
        for (let i = 0; i < cpuCount; i += 1) {
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

const startApp = (app, router) => {
    init(app);

    app.use(router);
    app.use(filters.notFound);
    app.use(filters.handleUnknownError);
    /**
     * Create HTTP server.
     */
    let port;
    let server;

    /**
     * Get port from environment and store in Express.
     */
    port = normalizePort(process.env.PORT || serverConfig.port);
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
    // }
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
        let port = parseInt(val, 10);

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

        let bind = typeof port === 'string'
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
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        logger.info("Listening on " + bind);
    }
};








