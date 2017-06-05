/**
 * Created by dzhang on 2/17/17.
 */
const winston = require('winston');
const path = require('path');
const PROJECT_ROOT = path.join(__dirname, '..');

let logger = new winston.Logger();

logger.add(winston.transports.Console, {
    prettyPrint: true,
    colorize: true,
    timestamp: true
});

logger.cli();

/**
 * Parses and returns info about the call stack at the given index.
 */
const getStackInfo = (stackIndex) => {
    // get call stack, and analyze it
    // get all file, method, and line numbers
    let stacklist = (new Error()).stack.split('\n').slice(3);

    // stack trace format:
    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    let stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
    let stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

    let s = stacklist[stackIndex] || stacklist[0];
    let sp = stackReg.exec(s) || stackReg2.exec(s);

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(PROJECT_ROOT, sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join('\n')
        }
    }
};

/**
 * Attempts to add file and line number info to the given log arguments.
 */
const formatLogArguments = (args) => {
    if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'uat') {
        args = Array.prototype.slice.call(args);

        let stackInfo = getStackInfo(1);

        if (stackInfo) {
            // get file path relative to project root
            let calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')';

            if (typeof (args[0]) === 'string') {
                args[0] = calleeStr + ' ' + args[0]
            } else {
                args.unshift(calleeStr)
            }
        }
    }
    return args
};

module.exports = {
    info() {
        logger.info.apply(logger, formatLogArguments(arguments))
    },
    warn() {
        logger.warn.apply(logger, formatLogArguments(arguments))
    },
    error() {
        logger.error.apply(logger, formatLogArguments(arguments))
    },
    dev() {
        if(process.env.NODE_ENV == 'development'){
            logger.data.apply(logger, formatLogArguments(arguments))
        }
    }
};

