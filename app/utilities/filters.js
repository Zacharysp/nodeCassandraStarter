/**
 * Created by dzhang on 2/6/17.
 */

"use strict";

/**
 * cross domain
 * @param req
 * @param res
 * @param next
 */
exports.cors = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
    res.header('Access-Control-Allow-Credentials', true);

    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
};

/**
 * url not found error
 * @param req
 * @param res
 * @param next
 */
exports.notFound = function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    err.code = 302;
    next(err);
};

/**
 * log unknown uncatched error to console when development env
 * @param err
 * @param req
 * @param res
 * @param next
 */
exports.handleUnknownError = function (err, req, res, next) {
    if (process.env.NODE_ENV == 'development') {
        res.status(err.status || 500).send({
            status: {
                code: err.code || 201,
                msg: err.message,
                stack: err.stack
            }
        });
    } else {
        var publicMessage = err.status == 404 ? err.message : 'server error';
        res.status(err.status || 500).send({
            status: {
                code: err.code || 201,
                msg: publicMessage
            }
        });
    }
};
