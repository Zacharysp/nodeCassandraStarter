/**
 * Created by dzhang on 6/20/17.
 */

global.logger = require('./logger');

const Promise = require('bluebird');
const Joi = require('joi');
const joiValidate = Promise.promisify(Joi.validate);
const Errors = require('./error');

/**
 * handle fail response
 * @param res
 * @returns {Function}
 */

exports.handleFailResponse = (res) => {
    return (err) => {
        if (err.name === undefined) {
            err = new Errors.ServerError();
        }
        logger.error(err);
        switch (err.name) {
            // handle no data error, will return a 200 success response but with 302 code
            case 'NoDataError':
                res.status(200).send(handleResponse(err.code, err.message));
                break;
            // handle validation error response
            case 'ValidationError':
                res.status(400).send(handleResponse(301, displayJoiError(err)));
                break;
            // handle database error response
            case 'UnauthorizedError':
                res.status(401).send(handleResponse(err.code, err.message));
                break;
            case 'DBError':
            case 'ServerError':
                let errorMessage = process.env.NODE_ENV === 'development'? err.message : err.publicMessage;
                res.status(500).send(handleResponse(err.code, errorMessage || err.message));
                break;
            // handle not found error response
            default:
                res.status(400).send(handleResponse(err.code, err.message));
        }
    };
};

/**
 * handle success response
 * @param res
 * @returns {Function}
 */
exports.handleSuccessResponse = (res) => {
    return (result, otherType) => {
        if (otherType) {
            res.writeHead(200, {
                'Content-Type': otherType,
                'Content-Length': result.length
            });
            res.end(result);
        } else {
            res.send(handleResponse(0, 'success', result));
        }
    };
};

/**
 * handle no data response
 * @param res
 */
exports.handleNoDataResponse = (res) => {
    res.send(handleResponse(301, 'no data'));
};

/**
 * validate body with joi, return promise
 * @param validateObj
 * @param schemaObj
 * @param options
 * @returns {*}
 */
exports.validatePromise = (validateObj, schemaObj, options) => {
    /**
     * Joi validation
     */
    if (!options) options = {};
    options.allowUnknown = true;
    options.abortEarly = false;
    return joiValidate(validateObj, schemaObj, options);
};

/**
 * handle response with data returned
 * @param code
 * @param msg
 * @param data
 * @returns {{data: *, status: {code: *, msg: *}}}
 */
const handleResponse = (code, msg, data) => {
    return {
        data: data,
        status: {
            code: code,
            msg: msg
        }
    };
};

/**
 * construct joi error message to one line
 * @param err
 * @returns {string}
 */
const displayJoiError = (err) => {
    let msg = '';
    err.details.forEach(function(data) {
        msg += data.message;
        msg += ', ';
    });
    return msg;
};

