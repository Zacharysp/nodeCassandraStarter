/**
 * Created by dzhang on 6/5/17.
 */
"use strict";
const util = require('../utilities/index').util;
const errors = require('../utilities/index').errors;
const config = require('config');

const userModel = require('../models/user');

module.exports.callback = (req, res) => {
    //using callback
    userModel.findById(req.authInfo.userId, function (err, result) {
        if (err) return util.handleFailResponse(res)(err);
        util.handleSuccessResponse(res)(result);
    })
};

module.exports.promise = (req, res) => {
    //using promise
    user.findById(req.authInfo.userId).then(function (result) {
        util.handleSuccessResponse(res)(result);
    }).catch(function (err) {
        logger.error(err);
        util.handleFailResponse(res)(err);
    });
};