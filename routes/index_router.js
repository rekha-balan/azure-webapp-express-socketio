// Chris Joakim, Microsoft, 2018/10/08

const express = require('express');
const router  = express.Router();
const request = require('request');
const events  = require('events');
const util    = require('util');

const build_timestamp_obj = require("../build_timestamp.json");

router.get('/', function(req, res) {
    console.log('index_router.js /');
    res.render('index', { current_date: new Date().toString(), message: 'Hello there!' })
  // var resp_obj = {};
  // resp_obj['current_date'] = new Date().toString();
  // resp_obj['n'] = 1;
  // res.render('index', resp_obj);
});

module.exports = router;
