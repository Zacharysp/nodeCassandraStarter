/**
 * Created by dzhang on 2/6/17.
 */
"use strict";
const config = require('config');
const cql = require('cassandra-driver');
const dbConfig = config.get('dbConfig');
const Promise = require('bluebird');

let options = {};
options.contactPoints = process.env.CASSANDRA_URL && process.env.CASSANDRA_URL.split(',') || dbConfig.contactPoint;
options.authProvider = new cql.auth.PlainTextAuthProvider(
    process.env.CASSANDRA_USERNAME || dbConfig.username,
    process.env.CASSANDRA_PASSWORD || dbConfig.password
);
options.keyspace = process.env.CASSANDRA_KEYSPACE || dbConfig.keyspace;

/**
 * create singleton cassandra database connection
 */
let client = new cql.Client(options);

client.connect((err) => {
    if (!err) {
        logger.info("Connection to Cassandra is ready.");
    }
});

/**
 * convert err to DBError with public message or return in production
 * @param err
 * @returns {*}
 */
let dbError = (err) => {
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

module.exports.execute = (query, items, callback) => {
    if (callback) {
        client.execute(query, items, {prepare: true}, (err, result) => {
            dbResultCB(err, result, callback);
        });
    } else {
        return new Promise((resolve, reject) => {
            client.execute(query, items, {prepare: true}, (err, result) => {
                if (err) reject(dbError(err));
                else {
                    if (result != null && result.rows != null && result.rows.length > 0) {
                        resolve(result.rows);
                    }
                    else resolve();
                }
            });
        })
    }
};

module.exports.batch = (queries, callback) => {
    if (callback) {
        client.batch(queries, {prepare: true}, (err) => {
            if (err) callback(dbError(err));
            callback();
        });
    } else {
        return new Promise((resolve, reject) => {
            client.batch(queries, {prepare: true}, (err) => {
                if (err) reject(dbError(err));
                resolve();
            });
        })
    }
};

module.exports.eachRow = (query, items, fetchSize, pageState, callback) => {
    const options = {
        prepare: true,
        fetchSize: fetchSize
    };
    if (pageState) options.pageState = pageState;
    if (callback) {
        client.eachRow(query, items, options, (n, row) => {
            // Row callback.
            logger.info(n, row)
        }, (err, result) => {
            dbResultCB(err, result, callback);
        });
    } else {
        return new Promise((resolve, reject) => {
            client.eachRow(query, items, options, (n, row) => {
                // Row callback.
                logger.info(n, row)
            }, (err, result) => {
                if (err) reject(dbError(err));
                resolve(result);
            });
        })
    }
};

function dbResultCB(err, result, callback) {
    if (err) callback(dbError(err));
    else {
        if (result != null && result.rows != null && result.rows.length > 0) {
            callback(null, result.rows);
        }
        else callback();
    }
}

