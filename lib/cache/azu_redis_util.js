'use strict';

const events = require('events');
const util   = require('util');
const redis  = require("redis");

// This utility class contains functions for invoking Azure RedisCache Storage.
// Chris Joakim, 2017/05/10
//
// ./node_modules/mocha/bin/mocha test/cache/test_azu_redis_util.js

class AzuRedisUtil extends events.EventEmitter {

    constructor() {
        super();
        var ns  = process.env.AZURE_REDISCACHE_NAMESPACE; 
        var key = process.env.AZURE_REDISCACHE_KEY;
        var server = ns + '.redis.cache.windows.net';
        var creds  = { auth_pass: key, tls: {servername: server}}
        this.client = redis.createClient(6380, server, creds);
    }

    set(key, val) {
        this.client.set(key, val, (err, reply) => {
            var evt_obj = {};
            evt_obj['type']  = 'AzuRedisUtil:set';
            evt_obj['key']   = key;
            evt_obj['val']   = val;
            evt_obj['error'] = err;
            evt_obj['reply'] = reply;
            this.emit('done', evt_obj);
        });
    }

    get(key, val) {
        this.client.get(key, (err, reply) => {
            var evt_obj = {};
            evt_obj['type']  = 'AzuRedisUtil:get';
            evt_obj['key']   = key;
            evt_obj['error'] = err;
            evt_obj['reply'] = reply;
            this.emit('done', evt_obj);
        });
    }

    quit() {
        return this.client.quit();
    }
}

module.exports.AzuRedisUtil = AzuRedisUtil;
