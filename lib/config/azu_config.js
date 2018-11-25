'use strict';

var fs     = require('fs');
var events = require('events');
var util   = require('util');

// This class is used to obtain both azu-js and azure configuration values.
// Chris Joakim, 2018/11/25
//
// ./node_modules/mocha/bin/mocha test/config/test_azu_config.js

class AzuConfig extends events.EventEmitter {

    constructor() {
        super();
        this.pkg_json = require('../../package.json');
    }

    library_author() {
        return 'Chris Joakim';
    }

    library_name() {
        return this.pkg_json['name'];
    }

    library_version() {
        return this.pkg_json['version'];
    }

    environment_variable_names() {
        // This method simply documents the environment variables that are used in azu-js.
        var list = [];
        list.push('AZURE_COSMOSDB_SQLDB_DBNAME');
        list.push('AZURE_COSMOSDB_SQLDB_URI');
        list.push('AZURE_COSMOSDB_SQLDB_KEY');
        list.push('AZURE_COSMOSDB_SQLDB_PREF_LOC');

        list.push('AZURE_COSMOSDB_MONGODB_DBNAME');
        list.push('AZURE_COSMOSDB_MONGODB_CONN_STRING');

        list.push('AZURE_EVENTHUB_NAMESPACE');
        list.push('AZURE_EVENTHUB_HUBNAME');
        list.push('AZURE_EVENTHUB_POLICY');
        list.push('AZURE_EVENTHUB_KEY');
        list.push('AZURE_EVENTHUB_TEST_HUBNAME');
        list.push('AZURE_EVENTHUB_TEST_POLICY');
        list.push('AZURE_EVENTHUB_TEST_KEY');

        list.push('AZURE_REDISCACHE_NAMESPACE');
        list.push('AZURE_REDISCACHE_KEY');

        list.push('AZURE_SERVICEBUS_NAMESPACE');
        list.push('AZURE_SERVICEBUS_QUEUE');
        list.push('AZURE_SERVICEBUS_KEY_NAME');
        list.push('AZURE_SERVICEBUS_ACCESS_KEY');
        list.push('AZURE_SERVICEBUS_TEST_QUEUE');
        list.push('AZURE_SERVICEBUS_TEST_KEY_NAME');
        list.push('AZURE_SERVICEBUS_TEST_ACCESS_KEY');

        list.push('AZURE_STORAGE_ACCOUNT');
        list.push('AZURE_STORAGE_ACCESS_KEY');
        return list;
    }
}


module.exports.AzuConfig = AzuConfig;