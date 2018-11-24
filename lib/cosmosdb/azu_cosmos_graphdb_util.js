'use strict';

const events  = require('events');
const util    = require('util');
const Gremlin = require('gremlin');

// This utility class contains functions for invoking Azure CosmosDB/GraphDB.
// NOTE: This class is NOT yet ready for use; pending changes to the gremlin npm library.
// TODO: implement the this.client connection when the gremlin npm lib is enhanced/replaced.
// Chris Joakim, 2017/05/13

class AzuCosmosGraphDbUtil extends events.EventEmitter {

    constructor(opts={}) {
        super();

        var acct = process.env.AZURE_COSMOSDB_GRAPHDB_ACCT;
        var host = process.env.AZURE_COSMOSDB_GRAPHDB_GREMLIN_HOST;
        var db   = process.env.AZURE_COSMOSDB_GRAPHDB_DBNAME;
        var coll = process.env.AZURE_COSMOSDB_GRAPHDB_COLLNAME;
        var user = '/dbs/' + db + '/colls/' + coll;

        this.set_option(opts, 'host',     host);
        this.set_option(opts, 'port',     443);
        this.set_option(opts, 'session',  false);
        this.set_option(opts, 'ssl',      true);
        this.set_option(opts, 'user',     user);
        this.set_option(opts, 'password', process.env.AZURE_COSMOSDB_GRAPHDB_KEY);
        this.opts = opts;

        // gremlin lib has a pending pull request for SSL and SASL
        // see: https://github.com/Azure-Samples/azure-cosmos-db-graph-nodejs-getting-started

        // this.client = Gremlin.createClient(opts['port'], opts['host'], opts);

        // this.client = Gremlin.createClient(
        //     443, 
        //     config.endpoint, 
        //     { 
        //         "session": false, 
        //         "ssl": true, 
        //         "user": `/dbs/${config.database}/colls/${config.collection}`,
        //         "password": config.primaryKey
        //     });
    }

    set_option(opts, key, default_value) {
        if (opts.hasOwnProperty(key)) {
            // already set
        }
        else {
            opts[key] = default_value;
        }
    }

}

module.exports.AzuCosmosGraphDbUtil = AzuCosmosGraphDbUtil;
