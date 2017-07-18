/**
 * Created by dzhang on 2/9/17.
 */
const express = require('express');
const router = new express.Router();
const util = require('../utilities').util;

router.use(util.authenticate);

router.use('/', require('./user'));

module.exports = router;
