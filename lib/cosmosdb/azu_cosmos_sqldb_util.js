'use strict';

const events = require('events');
const util   = require('util');

const DocumentDBClient = require('documentdb').DocumentClient;
const DocumentBase = require('documentdb').DocumentBase;

// This utility class contains functions for invoking Azure CosmosDB/SQL.
// Chris Joakim, 2018/11/21

class AzuCosmosSqlDbUtil extends events.EventEmitter {

    constructor(override_pref_locs) {
        super();
        this.dbname   = process.env.AZURE_COSMOSDB_SQLDB_DBNAME;
        var uri       = process.env.AZURE_COSMOSDB_SQLDB_URI;
        var key       = process.env.AZURE_COSMOSDB_SQLDB_KEY;
        var pref_locs = process.env.AZURE_COSMOSDB_SQLDB_PREF_LOC;
        
        if (typeof override_pref_locs !== 'undefined' && override_pref_locs) {
            pref_locs = override_pref_locs;
        } 

        this.locations = this.preferred_locations(pref_locs);
        if (this.locations.length > 0) {
            var connectionPolicy = new DocumentBase.ConnectionPolicy();
            connectionPolicy.PreferredLocations = this.locations;
            connectionPolicy.WritableLocations  = this.locations;
            connectionPolicy.EnableEndpointDiscovery = true;
            this.client = new DocumentDBClient(uri, { masterKey: key }, connectionPolicy);
        }
        else {
            this.client = new DocumentDBClient(uri, { masterKey: key });
        }
    }

    first_region() {
        if (this.locations.length > 0) {
            return this.locations[0];
        }
        else {
            return undefined;
        }
    }

    get_database_account() {
        var start_epoch = (new Date).getTime();
        this.client.getDatabaseAccount((err, db_acct, headers) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type']    = 'AzuCosmosSqlDbUtil:get_database_account';
            evt_obj['err']     = err;
            evt_obj['db_acct'] = db_acct;
            evt_obj['headers'] = headers;
            evt_obj['start_epoch']  = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    get_read_endpoint(endpoint_url) {
        var start_epoch = (new Date).getTime();
        this.client.getReadEndpoint((result) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type']   = 'AzuCosmosSqlDbUtil:get_read_endpoint';
            evt_obj['result'] = result;
            evt_obj['start_epoch']  = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    get_write_endpoint(endpoint_url) {
        var start_epoch = (new Date).getTime();
        this.client.getWriteEndpoint((result) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type']   = 'AzuCosmosSqlDbUtil:get_write_endpoint';
            evt_obj['result'] = result;
            evt_obj['start_epoch']  = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    list_databases() {
        var start_epoch = (new Date).getTime();
        this.client.readDatabases().toArray((err, dbs) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type'] = 'AzuCosmosSqlDbUtil:list_databases';
            evt_obj['err']  = err;
            evt_obj['dbs']  = dbs;
            evt_obj['start_epoch']  = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    create_collection(dbname, cname) {
        var dblink = 'dbs/' + dbname;
        var collspec = { id: cname };
        var start_epoch = (new Date).getTime();
        this.client.createCollection(dblink, collspec, (err, created) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type']    = 'AzuCosmosSqlDbUtil:create_collection';
            evt_obj['dbname']  = dbname;
            evt_obj['cname']   = cname;
            evt_obj['created'] = created;
            evt_obj['error']   = err;
            evt_obj['start_epoch']  = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    delete_collection(dbname, cname) {
        var colllink = 'dbs/' + dbname + '/colls/' + cname;
        var start_epoch = (new Date).getTime();
        this.client.deleteCollection(colllink, (err) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type']    = 'AzuCosmosSqlDbUtil:delete_collection';
            evt_obj['dbname']  = dbname;
            evt_obj['cname']   = cname;
            evt_obj['error']   = err;
            evt_obj['start_epoch']  = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    list_collections(dbname) {
        var dblink = 'dbs/' + dbname;
        var start_epoch = (new Date).getTime();
        this.client.readCollections(dblink).toArray((err, collections) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type'] = 'AzuCosmosSqlDbUtil:list_collections';
            evt_obj['err']  = err;
            evt_obj['dbname'] = dbname;
            evt_obj['collections']  = collections;
            evt_obj['start_epoch']  = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    create_document(dbname, cname, doc) {
        var colllink = 'dbs/' + dbname + '/colls/' + cname;
        var start_epoch = (new Date).getTime();
        this.client.createDocument(colllink, doc, (err, new_doc) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type']   = 'AzuCosmosSqlDbUtil:create_document';
            evt_obj['dbname'] = dbname;
            evt_obj['cname']  = cname;
            evt_obj['doc']    = new_doc;
            evt_obj['error']  = err;
            evt_obj['start_epoch'] = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    query_documents(coll_link, query_spec) {
        var start_epoch = (new Date).getTime();
        this.client.queryDocuments(coll_link, query_spec).toArray((err, results) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type'] = 'AzuCosmosSqlDbUtil:query_documents';
            evt_obj['coll_link'] = coll_link;
            evt_obj['query_spec'] = query_spec;
            evt_obj['err']     = err;
            evt_obj['results'] = results;
            evt_obj['start_epoch'] = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    delete_document(dbname, cname, doc_id, options) {
        var doclink = 'dbs/' + dbname + '/colls/' + cname + '/docs/' + doc_id;
        var start_epoch = (new Date).getTime();
        this.client.deleteDocument(doclink, options, (err) => {
            var finish_epoch = (new Date).getTime();
            var evt_obj = {};
            evt_obj['type']    = 'AzuCosmosSqlDbUtil:delete_document';
            evt_obj['dbname']  = dbname;
            evt_obj['cname']   = cname;
            evt_obj['doc_id']  = doc_id;
            evt_obj['doclink'] = doclink;
            evt_obj['error']   = err;
            evt_obj['start_epoch'] = start_epoch;
            evt_obj['finish_epoch'] = finish_epoch;
            evt_obj['elapsed_time'] = finish_epoch - start_epoch;
            this.emit('done', evt_obj);
        });
    }

    // private functions below

    preferred_locations(comma_delim_locations) {

        if (typeof comma_delim_locations !== 'undefined' && comma_delim_locations) {
            return comma_delim_locations.split(',');
        }
        else {
            return [];
        }
    }
}

module.exports.AzuCosmosSqlDbUtil = AzuCosmosSqlDbUtil;
