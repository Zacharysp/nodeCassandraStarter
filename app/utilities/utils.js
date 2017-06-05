/**
 * Created by dzhang on 2/6/17.
 */
"use strict";

global.logger = require('./logger');

const http = require('http');
const https = require('https');
const config = require('config');
const authConfig = config.has('authConfig') ? config.get('authConfig') : {};

const ServerError = require('./error').ServerError;

const Promise = require('bluebird');
const Joi = require('joi');
const joiValidate = Promise.promisify(Joi.validate);

/**
 * handle fail response
 * @param res
 * @returns {Function}
 */
exports.handleFailResponse = (res) => {
    return (err) => {
        if (err.name == null) {
            err = new ServerError();
        }
        logger.error(err);
        switch (err.name) {
            //handle validation error response
            case 'ValidationError':
                res.status(400).send(handleResponse(301, displayJoiError(err)));
                break;
            //handle database error response
            case 'UnauthorizedError':
                res.status(401).send(handleResponse(err.code, err.message));
                break;
            case 'DBError':
            case 'ServerError':
                if (process.env.NODE_ENV == 'development') {
                    res.status(500).send(handleResponse(err.code, err.message));
                } else {
                    res.status(500).send(handleResponse(err.code, err.publicMessage));
                }
                break;
            //handle not found error response
            default:
                res.status(400).send(handleResponse(err.code, err.message));
        }
    }
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
        }
        else res.send(handleResponse(0, 'success', result));
    };
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
    return joiValidate(validateObj, schemaObj, options)
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
    }
};

/**
 * construct joi error message to one line
 * @param err
 * @returns {string}
 */
const displayJoiError = (err) => {
    let msg = "";
    err.details.forEach(function(data){
        msg += data.message;
        msg += ', '
    });
    return msg;
};

