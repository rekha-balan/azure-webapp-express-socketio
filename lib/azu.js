'use strict';

// This file aggregates and exports the various modules and classes in this directory.
// Chris Joakim, 2018/11/21

const config       = require('./config/azu_config');
const redis_util   = require('./cache/azu_redis_util');
const SqlDb_util   = require('./cosmosdb/azu_cosmos_SqlDb_util');
const graph_util   = require('./cosmosdb/azu_cosmos_graphdb_util');
const mongodb_util = require('./cosmosdb/azu_cosmos_mongodb_util');
const evthub_util  = require('./evthub/azu_evthub_util');
const svcbus_util  = require('./svcbus/azu_svcbus_util');
const blob_util    = require('./storage/azu_blob_util');
const queue_util   = require('./storage/azu_queue_util');
const table_util   = require('./storage/azu_table_util');

module.exports.AzuConfig            = config.AzuConfig;
module.exports.AzuRedisUtil         = redis_util.AzuRedisUtil;
module.exports.AzuCosmosSqlDbUtil   = SqlDb_util.AzuCosmosSqlDbUtil;
module.exports.AzuCosmosGraphDbUtil = graph_util.AzuCosmosGraphDbUtil;
module.exports.AzuCosmosMongoDbUtil = mongodb_util.AzuCosmosMongoDbUtil;
module.exports.AzuEvtHubUtil        = evthub_util.AzuEvtHubUtil;
module.exports.AzuSvcBusUtil        = svcbus_util.AzuSvcBusUtil;
module.exports.AzuStorageBlobUtil   = blob_util.AzuStorageBlobUtil;
module.exports.AzuStorageQueueUtil  = queue_util.AzuStorageQueueUtil;
module.exports.AzuStorageTableUtil  = table_util.AzuStorageTableUtil;
