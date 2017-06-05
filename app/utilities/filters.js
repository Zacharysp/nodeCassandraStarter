/**
 * Created by dzhang on 2/6/17.
 */


"use strict";

/**
 * url not found error
 * @param req
 * @param res
 * @param next
 */
exports.notFound = (req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    err.code = 404;
    next(err);
};

/**
 * log unknown uncatched error to console when development env
 * @param err
 * @param req
 * @param res
 */
exports.handleUnknownError = (err, req, res) => {
    logger.error(err);
    if (process.env.NODE_ENV == 'development') {
        res.status(err.status || 500).send({
            status: {
                code: err.code || 201,
                msg: err.message,
                stack: err.stack
            }
        });
    } else {
        let publicMessage = err.status == 404 ? err.message : 'server error';
        res.status(err.status || 500).send({
            status: {
                code: err.code || 201,
                msg: publicMessage
            }
        });
    }
};
