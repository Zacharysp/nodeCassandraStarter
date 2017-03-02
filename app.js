/**
 * Created by dzhang on 2/6/17.
 */
"use strict";

var express = require('express');
var router = express.Router();
var util = require('./app/utilities');
var app = express();


router.use(require('./app/routes'));

/**
 * display static html at root
 */
// var path = require('path');
// app.use(express.static(path.join(__dirname, 'public')));

util.build.start(app, router);

module.exports = app;




