/**
 * Created by dzhang on 2/28/17.
 */

let client = require('./../utilities').dbClient;

/**
 * find user by user_id
 * @param userId
 * @param callback
 */
module.exports.findById = (userId, callback) => {
    let query = 'SELECT * FROM user_info where user_id = ?;';
    client.execute(query, [userId], callback);
};
