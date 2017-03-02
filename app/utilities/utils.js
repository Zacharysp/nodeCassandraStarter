/**
 * Created by dzhang on 2/6/17.
 */
"use strict";

global.logger = require('./logger');

var http = require('http');
var https = require('https');
var config = require('config');
var authConfig = config.has('authConfig') ? config.get('authConfig') : {};

var ServerError = require('./error').ServerError;

var Promise = require('bluebird');
var Joi = require('joi');
var joiValidate = Promise.promisify(Joi.validate);
/**
 * handle fail response
 * @param res
 * @returns {Function}
 */
exports.handleFailResponse = function (res){
    return function(err) {
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
            //handle bad request error response
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
exports.handleSuccessResponse = function (res) {
    return function (result) {
        res.send(handleResponse(0, 'success', result));
    };
};

/**
 * handle response with data returned
 * @param code
 * @param msg
 * @param data
 * @returns {{data: *, status: {code: *, msg: *}}}
 */
function handleResponse(code, msg, data) {
    return {
        data: data,
        status: {
            code: code,
            msg: msg
        }
    }
}

/**
 * construct joi error message to one line
 * @param err
 * @returns {string}
 */
function displayJoiError (err){
    var msg = "";
    err.details.forEach(function(data){
        msg += data.message;
        msg += ', '
    });
    return msg;
}

exports.validatePromise = function (validateObj, schemaObj, options) {
    /**
     * Joi validation
     */
    if (!options) options = {};
    options.abortEarly = false;
    return joiValidate(validateObj, schemaObj, options)
};

//authenticate bearer token with auth server
exports.authenticate = function (req, res, next) {
    if (!req.headers.authorization) {
        var err = new Error('Authorization header should be provided');
        res.status(400);
        res.send({
            message: err.message,
            error: err
        });
    }else {
        var postData = JSON.stringify(req.body);
        var options = {
            host: process.env.AUTH_HOST || authConfig.host,
            port: process.env.AUTH_PORT || authConfig.port,
            path: authConfig.path,
            method: "POST",
            headers: {
                authorization: req.headers.authorization,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData)
            },
            rejectUnauthorized: false,
            agent: false
        };
        // Auth with https server
        // if (process.env.NODE_ENV == 'production') {
        //     authReq = https.request(options, authCallback(next, req, res));
        // } else {
        var authReq = http.request(options, authCallback(next, req, res));

        authReq.end(postData);

        authReq.on('error', function (e) {
            logger.error('error validating token ', e);
            var serverError = new ServerError();
            serverError.stack = e.stack;
            next(serverError);
        });
    }
};

function authCallback(next, req, res) {
    return function (response) {
        if (response.statusCode === 200) {
            response.on('data', function (chunk) {
                var result = JSON.parse(chunk).data;
                logger.dev(result, 'response from auth api');
                req.authInfo = {
                    userId: result.userId,
                    expires: result.expires
                };
                next();
            });
        }else {
            for (var i in response.headers) {
                if (response.headers.hasOwnProperty(i)) {
                    res.set(i, response.headers[i]);
                }
            }
            res.status(response.statusCode);
            response.on('data', function (chunk) {
                res.write(chunk);
            });
            response.on('end', function () {
                res.end();
            });
        }
    }
}