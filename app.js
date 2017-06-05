/**
 * Created by dzhang on 2/6/17.
 */
"use strict";

const express = require('express');
const router = express.Router();
const util = require('./app/utilities');
const app = express();


router.use(require('./app/routes'));

/**
 * display static html at root
 */
// var path = require('path');
// app.use(express.static(path.join(__dirname, 'public')));

util.build.start(app, router);

module.exports = app;