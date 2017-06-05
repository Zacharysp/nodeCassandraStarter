/**
 * Created by dzhang on 2/27/17.
 */
"use strict";
const router = require('express').Router();
const userCtrl = require('../controllers/findUser');


router.get('/', userCtrl.callback);

router.get('/promise', userCtrl.promise);

module.exports = router;