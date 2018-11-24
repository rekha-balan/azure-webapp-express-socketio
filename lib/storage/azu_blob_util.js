'use strict';

const fs     = require('fs');
const events = require('events');
const util   = require('util');

const azure_storage = require('azure-storage');

// This utility class contains functions for invoking Azure Blob Storage.
// Chris Joakim, 2017/05/13

class AzuStorageBlobUtil extends events.EventEmitter {

    constructor() {
        // These environment variables are implicitly used:
        // AZURE_STORAGE_ACCOUNT
        // AZURE_STORAGE_ACCESS_KEY
        super();
        this.blob_svc = azure_storage.createBlobService();
    }

    create_container(cname) {
        var props = {publicAccessLevel: 'blob'};
        this.blob_svc.createContainerIfNotExists(cname, props, (err, result, response) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageBlobUtil:create_container';
            evt_obj['cname'] = cname;
            evt_obj['error'] = err;
            evt_obj['result'] = result;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }

    delete_container(cname) {
        var opts = {};
        this.blob_svc.deleteContainer(cname, opts, (err, response) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageBlobUtil:delete_container';
            evt_obj['cname'] = cname;
            evt_obj['error'] = err;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }

    list(cname) {
        this.blob_svc.listBlobsSegmented(cname, null, (err, result, response) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageBlobUtil:list';
            evt_obj['cname'] = cname;
            evt_obj['error'] = err;
            evt_obj['result'] = result;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }

    upload_from_file(cname, bname, fname) {
        this.blob_svc.createBlockBlobFromLocalFile(cname, bname, fname, (err, result, response) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageBlobUtil:upload_from_file';
            evt_obj['cname'] = cname;
            evt_obj['bname'] = bname;
            evt_obj['fname'] = fname;
            evt_obj['error'] = err;
            evt_obj['result'] = result;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }

    download_to_file(cname, bname, fname) {
        this.blob_svc.getBlobToStream(cname, bname, fs.createWriteStream(fname), (err, result, response) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageBlobUtil:download_to_file';
            evt_obj['cname'] = cname;
            evt_obj['bname'] = bname;
            evt_obj['fname'] = fname;
            evt_obj['error'] = err;
            evt_obj['result'] = result;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }

    delete_blob(cname, bname) {
        this.blob_svc.deleteBlob(cname, bname, (err, response) => {
            var evt_obj = {};
            evt_obj['type'] = 'AzuStorageBlobUtil:delete_blob';
            evt_obj['cname'] = cname;
            evt_obj['bname'] = bname;
            evt_obj['error'] = err;
            evt_obj['response'] = response;
            this.emit('done', evt_obj);
        });
    }
}

module.exports.AzuStorageBlobUtil = AzuStorageBlobUtil;
