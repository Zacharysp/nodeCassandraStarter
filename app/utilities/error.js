/**
 * Created by dzhang on 2/13/17.
 */

"use strict";
var util = require("util");

var definedErrors = [
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
        className: 'BadRequest',
        message: 'bad request',
        code: '301'
    }
];

for (var i = 0; i < definedErrors.length; i++) {
    var className = definedErrors[i].className;

    var fn = initError(definedErrors[i]);
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