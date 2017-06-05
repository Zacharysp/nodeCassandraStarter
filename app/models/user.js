/**
 * Created by dzhang on 2/28/17.
 */
"use strict";
let client = require('./../utilities').dbClient;

/**
 * find user by user_id
 * @param user_id
 * @param callback
 */
module.exports.findById = (user_id, callback) => {
    let query = "SELECT * FROM user_info where user_id = ?;";
    client.execute(query, [user_id], callback);
};