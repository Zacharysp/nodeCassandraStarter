/**
 * Created by dzhang on 2/27/17.
 */
"use strict";
var router = require('express').Router();
var util = require('../utilities').util;

var User = require('../../app/models/user');
var user = new User();

router.get('/', function (req, res) {
    //using callback
    user.findById(req.authInfo.userId, function(err, result){
        if (err) return util.handleFailResponse(res)(err);
        util.handleSuccessResponse(res)(result);
    })
});

router.get('/promise', function (req, res) {
    //using promise
    user.findById(req.authInfo.userId).then(function(result){
        util.handleSuccessResponse(res)(result);
    }).catch(function(err){
        logger.error(err);
        util.handleFailResponse(res)(err);
    });
});

module.exports = router;