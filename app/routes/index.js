/**
 * Created by dzhang on 2/9/17.
 */
"use strict";
var router = require('express').Router();
var util = require('../utilities').util;

router.use(util.authenticate);

router.use('/', require('./user'));

module.exports = router;
