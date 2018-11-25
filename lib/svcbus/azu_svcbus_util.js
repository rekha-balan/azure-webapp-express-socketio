'use strict';

var events = require('events');
var util   = require('util');
var azure  = require('azure-sb');

// This utility class contains functions for invoking Azure Service Bus.
// Chris Joakim, Microsoft, 2018/11/25

class AzuSvcBusUtil extends events.EventEmitter {

  constructor(opts) {
    super();
    this.namespace   = process.env.AZURE_SERVICEBUS_NAMESPACE;
    this.queue_name  = process.env.AZURE_SERVICEBUS_QUEUE;
    this.key_name    = process.env.AZURE_SERVICEBUS_KEY_NAME;
    this.key_value   = process.env.AZURE_SERVICEBUS_ACCESS_KEY;
    this.default_read_opts = { isPeekLock: false, timeoutIntervalInS: 5 };

    // Allow overrides in unit tests
    if (opts.hasOwnProperty('queue_name')) {
        this.queue_name = opts['queue_name'];
    }
    if (opts.hasOwnProperty('key_name')) {
        this.key_name = opts['key_name'];
    }
    if (opts.hasOwnProperty('key_value')) {
        this.key_value = opts['key_value'];
    }
    this.opts = opts;

    // Build the connection string manually, then connect.
    this.conn_string = 'Endpoint=sb://' + this.namespace + '.servicebus.windows.net/';
    this.conn_string = this.conn_string + ';SharedAccessKeyName=' + this.key_name;
    this.conn_string = this.conn_string + ';SharedAccessKey=' + this.key_value;
    this.service = azure.createServiceBusService(this.conn_string);
  }

  list_queues() {
    var opts = {};
    this.service.listQueues(opts, (error, list) => {
      var evt_obj = {};
      evt_obj['type']  = 'AzuSvcBusUtil:list_queues';
      evt_obj['error'] = error;
      evt_obj['list']  = list;
      evt_obj['epoch'] = new Date().getTime();
      this.emit('done', evt_obj);
    });
  }

  get_queue_info(override_qname) {
    var q = this.get_queue_name(override_qname);
    this.service.getQueue(q, (error, queue) => {
      var evt_obj = {};
      evt_obj['type']  = 'AzuSvcBusUtil:get_queue_info';
      evt_obj['error'] = error;
      evt_obj['queue'] = queue;
      evt_obj['epoch'] = new Date().getTime();
      this.emit('done', evt_obj);
    });
  }

  send_message_to_queue(msg, override_qname) {
    // msg is an Object with 
    var q = this.get_queue_name(override_qname);
    this.service.sendQueueMessage(q, msg, (error) => {
      var evt_obj = {};
      evt_obj['type']    = 'AzuSvcBusUtil:send_message_to_queue';
      evt_obj['queue']   = q;
      evt_obj['message'] = msg;
      evt_obj['error']   = error;
      evt_obj['epoch']   = new Date().getTime();
      this.emit('done', evt_obj);
    });
  }
  // See file servicebusservice.js in the npm library, method 'sendQueueMessage':
  // * @param {string}             queuePath                                           A string object that represents the name of the queue to which the message will be sent.
  // * @param {object|string}      message                                             A message object that represents the message to send.
  // * @param {string}             [message.body]                                      The message's text.
  // * @param {object}             [message.customProperties]                          The message's custom properties.
  // * @param {string}             [message.brokerProperties.CorrelationId]            The message's correlation identifier.
  // * @param {string}             [message.brokerProperties.SessionId]                The session identifier.
  // * @param {string}             [message.brokerProperties.MessageId]                The message's identifier.
  // * @param {string}             [message.brokerProperties.Label]                    The message's label.
  // * @param {string}             [message.brokerProperties.ReplyTo]                  The message's reply to.
  // * @param {string}             [message.brokerProperties.TimeToLive]               The message's time to live.
  // * @param {string}             [message.brokerProperties.To]                       The message's to.
  // * @param {string}             [message.brokerProperties.ScheduledEnqueueTimeUtc]  The message's scheduled enqueue time in UTC.
  // * @param {string}             [message.brokerProperties.ReplyToSessionId]         The message's reply to session identifier.
  // * @param {Function(error, response)} callback                                     `error` will contain information
  // *   

  read_message_from_queue(override_qname, opts) {
    var q = this.get_queue_name(override_qname);
    var read_opts = this.default_read_opts;
    if (typeof opts !== 'undefined' && opts) {
      read_opts = opts;
    }
    this.service.receiveQueueMessage(q, read_opts, (error, msg) => {
      var evt_obj = {};
      evt_obj['type']    = 'AzuSvcBusUtil:read_message_from_queue';
      evt_obj['queue']   = q;
      evt_obj['message'] = msg;
      evt_obj['error']   = error;
      evt_obj['epoch']   = new Date().getTime();
      this.emit('done', evt_obj);
    });
  }

  get_queue_name(override_qname) {
    if (typeof override_qname !== 'undefined' && override_qname) {
      if (override_qname.length > 1) {
        return override_qname;
      }
    }
    return this.queue_name;
  }
}

module.exports.AzuSvcBusUtil = AzuSvcBusUtil;
