/**
 * Created by dzhang on 2/6/17.
 */
"use strict";
var config = require('config');
var cql = require('cassandra-driver');
var dbConfig = config.get('dbConfig');

var Promise = require("bluebird");

var options = {};
options.contactPoints = process.env.CASSANDRA_URL && process.env.CASSANDRA_URL.split(',') || dbConfig.contactPoint;
options.authProvider = new cql.auth.PlainTextAuthProvider(
    process.env.CASSANDRA_USERNAME || dbConfig.username,
    process.env.CASSANDRA_PASSWORD || dbConfig.password
);
options.keyspace = process.env.CASSANDRA_KEYSPACE || dbConfig.keyspace;

/**
 * create singleton cassandra database connection
 */
var client = new cql.Client(options);

client.connect(function (err) {
    if (!err) {
        logger.info("Connection to Cassandra is ready.");
    }
});

/**
 * convert err to DBError with public message or return in production
 * @param err
 * @returns {*}
 */
var dbError = function (err) {
    if (err == null) {
        err = new Error();
        Error.captureStackTrace(err);
    }
    logger.error(err);
    err.name = 'DBError';
    err.code = '202';
    err.publicMessage = 'database error';
    return err
};

module.exports.execute = function (query, items, callback) {
    if (callback) {
        client.execute(query, items, function (err, result) {
            dbResultCB(err, result, callback);
        });
    } else {
        return new Promise(function (resolve, reject) {
            client.execute(query, items, function (err, result) {
                if (err) reject(dbError(err));
                else {
                    if (result != null && result.rows.length > 0) {
                        resolve(result.rows);
                    }
                    else resolve();
                }
            });
        })
    }
};

function dbResultCB(err, result, callback) {
    if (err) callback(dbError(err));
    else {
        if (result != null && result.rows.length > 0) {
            callback(null, result.rows);
        }
        else callback();
    }
}

