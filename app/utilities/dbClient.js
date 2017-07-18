/**
 * Created by dzhang on 6/20/17.
 */

const config = require('config');
const cql = require('cassandra-driver');
const dbConfig = config.get('dbConfig');
const Promise = require('bluebird');
const NoDataError = require('./error').NoDataError;

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
        logger.info('Connection to Cassandra is ready.');
    }
});

/**
 * convert err to DBError with public message or return in production
 * @param err
 * @returns {*}
 */
let dbError = (err) => {
    if (err === null || err === undefined) {
        err = new Error();
        Error.captureStackTrace(err);
    }
    logger.error(err);
    err.name = 'DBError';
    err.code = '202';
    err.publicMessage = 'database error';
    return err;
};

/**
 * single select
 * @param query
 * @param items
 * @param callback
 */
module.exports.select = (query, items, callback) => {
    if (callback) {
        client.execute(query, items, {prepare: true}, (err, result) => {
            dbResultCB(err, result, false, callback);
        });
    } else {
        return executePromise(query, items, false);
    }
};

/**
 * single update
 * @param query
 * @param items
 * @param callback
 */
module.exports.update = (query, items, callback) => {
    if (callback) {
        client.execute(query, items, {prepare: true}, (err, result) => {
            dbResultCB(err, result, true, callback);
        });
    } else {
        return executePromise(query, items, true);
    }
};

/**
 * batch update
 * @param queries
 * @param callback
 */
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
        });
    }
};

/**
 * query result one row at a time
 * @param query
 * @param items
 * @param fetchSize
 * @param pageState
 * @param callback
 */
module.exports.eachRow = (query, items, fetchSize, pageState, callback) => {
    const options = {
        prepare: true,
        fetchSize: fetchSize
    };
    if (pageState) options.pageState = pageState;
    if (callback) {
        client.eachRow(query, items, options, (n, row) => {
            // Row callback.
        }, (err, result) => {
            dbResultCB(err, result, false, callback);
        });
    } else {
        return new Promise((resolve, reject) => {
            client.eachRow(query, items, options, (n, row) => {
                // Row callback.
            }, (err, result) => {
                if (err) reject(dbError(err));
                resolve(result);
            });
        });
    }
};

/**
 * handle call back result
 * @param err
 * @param result
 * @param isUpdate
 * @param callback
 */
function dbResultCB(err, result, isUpdate, callback) {
    switch (true) {
        case err !== null:
            callback(dbError(err));
            break;
        case isUpdate:
            callback();
            break;
        case result.rowLength > 0:
            callback(null, result.rows);
            break;
        default:
            callback(new NoDataError());
    }
}

/**
 * execute query and return promise result
 * @param query
 * @param items
 * @param isUpdate
 */
let executePromise = (query, items, isUpdate) => {
    return new Promise((resolve, reject) => {
        client.execute(query, items, {prepare: true}, (err, result) => {
            switch (true) {
                case err !== null:
                    reject(dbError(err));
                    break;
                case isUpdate:
                    resolve();
                    break;
                case result.rowLength > 0:
                    resolve(result.rows);
                    break;
                default:
                    reject(new NoDataError());
            }
        });
    });
};
