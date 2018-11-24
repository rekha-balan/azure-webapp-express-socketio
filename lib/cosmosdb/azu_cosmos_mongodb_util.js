'use strict';

const events = require('events');
const util   = require('util');

const MongoClient = require('mongodb').MongoClient;

// This utility class contains functions for invoking Azure CosmosDB/MongoDB.
// Chris Joakim, 2017/05/13

class AzuCosmosMongoDbUtil extends events.EventEmitter {

    constructor(override_conn_str) {
        super();
        this.dbname   = process.env.AZURE_COSMOSDB_MONGODB_DBNAME;
        this.conn_str = process.env.AZURE_COSMOSDB_MONGODB_CONN_STRING;

        if (override_conn_str) {
            this.conn_str = override_conn_str;  
        }
        this.error  = null;
        this.client = null;
        this.connected = false;
        var start_epoch = (new Date).getTime();

        MongoClient.connect(this.conn_str, (err, db) => {
            var finish_epoch = (new Date).getTime();
            if (db) {
                this.client = db;
                this.connected = true;
            }
            else {
                this.error = err;
            }
            var evt_obj = {};
            evt_obj['type'] = 'AzuCosmosMongoDbUtil:constructor';
            evt_obj['dbname'] = this.dbname;
            evt_obj['connected'] = this.connected;
            evt_obj['err']       = this.error;
            evt_obj['start_epoch']  = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    close() {
        if (this.client) {
            this.connected = false;
            this.client.close();
        }
    }

}

module.exports.AzuCosmosMongoDbUtil = AzuCosmosMongoDbUtil;
