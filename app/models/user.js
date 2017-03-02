/**
 * Created by dzhang on 2/28/17.
 */
"use strict";
var client = require('./../utilities').dbClient;

function User() {
}
module.exports = User;
/**
 * find user by user_id
 * @param user_id
 * @param callback
 */
User.prototype.findById = function (user_id, callback) {
    var query = "SELECT * FROM user_info where user_id = ?;";
    client.execute(query, [user_id], callback);
};