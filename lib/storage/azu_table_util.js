'use strict';

const fs     = require('fs');
const events = require('events');
const util   = require('util');

const azure_storage = require('azure-storage');

// This utility class contains functions for invoking Azure Table Storage.
// Chris Joakim, 2017/05/13

class AzuStorageTableUtil extends events.EventEmitter {

    constructor() {
        // These environment variables are implicitly used:
        // AZURE_STORAGE_ACCOUNT
        // AZURE_STORAGE_ACCESS_KEY
        super();
        this.table_svc = azure_storage.createTableService();
        var tablename = null;
        var zip_list  = [];
        var egen      = null;
    }

    create_table(tname) {
        this.table_svc.createTableIfNotExists(tname, (err, result, response) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageTableUtil:create_table';
            evt_obj['tname'] = tname;
            evt_obj['error'] = err;
            evt_obj['result'] = result;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }

    delete_table(tname) {
        this.table_svc.deleteTable(tname, (err, result, response) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageTableUtil:delete_table';
            evt_obj['tname'] = tname;
            evt_obj['error'] = err;
            evt_obj['result'] = result;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }

    insert_entity(tname, entity) {
        var self = this;
        var valid_entity = false;

        if (entity) {
            if (entity['PartitionKey']) {
                if (entity['RowKey']) { 
                    valid_entity = true;   
                }  
            }
        }

        if (valid_entity) {
            this.table_svc.insertEntity(tname, entity, (err, result, response) => {
                var evt_obj = {};
                evt_obj['type']  = 'AzuStorageTableUtil:insert_entity';
                evt_obj['tname'] = tname;
                evt_obj['error'] = err;
                evt_obj['result'] = result;
                evt_obj['response'] = response;
                self.emit('done', evt_obj);
            });
        }
        else {
            var evt_obj = {};
            evt_obj['type']  = 'AzuStorageTableUtil:insert_entity';
            evt_obj['error'] = 'The given entity object is null or lacking a PartitionKey and/or RowKey.';
            self.emit('done', evt_obj); 
        }

    }

    retrieve_entity_by_keys(tname, pkey, rkey) {
        var self = this;
        this.table_svc.retrieveEntity(tname, pkey, rkey, (err, result, response) => {
            var evt_obj = {};
            evt_obj['type']  = 'AzuStorageTableUtil:retrieve_entity_by_keys';
            evt_obj['tname'] = tname;
            evt_obj['pkey']  = pkey;
            evt_obj['rkey']  = rkey;
            evt_obj['error'] = err;
            evt_obj['result'] = result;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }

    delete_entity_by_keys(tname, pkey, rkey) {
        var self = this;
        var spec = {};
        spec['PartitionKey'] = pkey;
        spec['RowKey'] = rkey;

        this.table_svc.deleteEntity(tname, spec, (err, response) => {
            var evt_obj = {};
            evt_obj['type']  = 'AzuStorageTableUtil:delete_entity_by_keys';
            evt_obj['tname'] = tname;
            evt_obj['pkey']  = pkey;
            evt_obj['rkey']  = rkey;
            evt_obj['error'] = err;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }
}

module.exports.AzuStorageTableUtil = AzuStorageTableUtil;
