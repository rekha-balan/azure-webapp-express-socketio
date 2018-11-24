'use strict';

const fs     = require('fs');
const events = require('events');
const util   = require('util');

const azure_storage = require('azure-storage');

// This utility class contains functions for invoking Azure Queue Storage.
// Chris Joakim, 2017/05/13

class AzuStorageQueueUtil extends events.EventEmitter {

    constructor() {
        // These environment variables are implicitly used:
        // AZURE_STORAGE_ACCOUNT
        // AZURE_STORAGE_ACCESS_KEY
        super();
        this.queue_svc = azure_storage.createQueueService();
    }

    create_queue(qname) {
        this.queue_svc.createQueueIfNotExists(qname, (err) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageQueueUtil:create_queue';
            evt_obj['qname'] = qname;
            evt_obj['error'] = err;
            this.emit('done', evt_obj);
        });
    }

    delete_queue(qname) {
        this.queue_svc.deleteQueue(qname, (err) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageQueueUtil:delete_queue';
            evt_obj['qname'] = qname;
            evt_obj['error'] = err;
            this.emit('done', evt_obj);
        });
    }
    
    create_message(qname, data) {
        this.queue_svc.createMessage(qname, data, (err)  => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageQueueUtil:create_message';
            evt_obj['qname'] = qname;
            evt_obj['data'] = data;
            evt_obj['error'] = err;
            this.emit('done', evt_obj);
        });
    }

    read_messages(qname, count) {
        var opts = {};
        opts['numOfMessages'] = count;
        this.queue_svc.getMessages(qname, opts, (err, msgs) => {
            var evt_obj = {};
            evt_obj['type']  = 'AzuStorageQueueUtil:read_messages';
            evt_obj['qname'] = qname;
            evt_obj['opts']  = opts;
            evt_obj['msgs']  = msgs;
            evt_obj['error'] = err;
            this.emit('done', evt_obj);
        });
    }

    queue_service_properties() {
        var opts = {};
        this.queue_svc.getServiceProperties(opts, (err, result, resp) => {
            var evt_obj = {};
            evt_obj['type']   = 'AzuStorageQueueUtil:queue_service_properties';
            evt_obj['result'] = result;
            evt_obj['resp']   = resp;
            evt_obj['error']  = err;
            this.emit('done', evt_obj);
        });
    }

    queue_metadata(qname) {
        var opts = {};
        this.queue_svc.getQueueMetadata(qname, opts, (err, result, resp) => {
            var evt_obj = {};
            evt_obj['type']   = 'AzuStorageQueueUtil:queue_metadata';
            evt_obj['result'] = result;
            evt_obj['resp']   = resp;
            evt_obj['error']  = err;
            this.emit('done', evt_obj);
        });
    }
}

module.exports.AzuStorageQueueUtil = AzuStorageQueueUtil;
