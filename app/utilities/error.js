/**
 * Created by dzhang on 2/13/17.
 */

"use strict";
let util = require("util");

/*
 Code	Message	            Description
 0	    success	            Success.
 101	unauthorized	    Unauthorized
 201	server error	    General Server error
 202	database error	    General database error.
 401	bad request	        A malformed syntax, missing a mandatory argument.
 */

let definedErrors = [
    {
        className: 'UnauthorizedError',
        message: 'unauthorized',
        code: '101'
    },{
        className: 'ServerError',
        message: 'server error',
        publicMessage: 'server error',
        code: '201'
    },{
        className: 'DataBaseError',
        message: 'database error',
        publicMessage: 'database error',
        code: '202'
    },{
        className: 'BadRequest',
        message: 'bad request',
        code: '401'
    }
];

//export custom errors
for (let i = 0; i < definedErrors.length; i++) {
    let className = definedErrors[i].className;
    let fn = initError(definedErrors[i]);
    util.inherits(fn, Error);
    module.exports[className] = fn;
}

function initError(error) {
    return function fn() {
        this.message = error.message;
        this.name = error.className;
        this.code = error.code;
        Error.captureStackTrace(this, fn);
    }
}

