'use strict';

var events = require('events');
var util     = require('util');

var EventHubClient = require('azure-event-hubs').Client;

// This utility class contains functions for invoking Azure EventHubs.
// Chris Joakim, 2017/05/13

class AzuEvtHubUtil extends events.EventEmitter {

    constructor(opts={}) {
        super();
        this.namespace = process.env.AZURE_EVENTHUB_NAMESPACE; 
        this.hubname   = process.env.AZURE_EVENTHUB_HUBNAME; 
        this.key_name  = process.env.AZURE_EVENTHUB_POLICY; 
        this.key_value = process.env.AZURE_EVENTHUB_KEY;
        
        // Allow overrides in unit tests
        if (opts.hasOwnProperty('hubname')) {
            this.hubname = opts['hubname'];
        }
        if (opts.hasOwnProperty('policy')) {
            this.key_name = opts['policy'];
        }
        if (opts.hasOwnProperty('key')) {
            this.key_value = opts['key'];
        }

        // Build the connection string manually:
        this.conn_string = 'Endpoint=sb://' + this.namespace + '.servicebus.windows.net/';
        this.conn_string = this.conn_string + ';SharedAccessKeyName=' + this.key_name;
        this.conn_string = this.conn_string + ';SharedAccessKey=' + this.key_value;

        // if (opts.hasOwnProperty('constructor_verbose')) {
        //     console.log('AzuEvtHubUtil constructor namespace:   ' + this.namespace);
        //     console.log('AzuEvtHubUtil constructor hubname:     ' + this.hubname);
        //     console.log('AzuEvtHubUtil constructor key_name:    ' + this.key_name);
        //     console.log('AzuEvtHubUtil constructor key_value:   ' + this.key_value.substring(0, 10) + '...');
        //     console.log('AzuEvtHubUtil constructor conn_string: ' + this.conn_string.substring(0, 130) + '...');
        // }

        this.client    = EventHubClient.fromConnectionString(this.conn_string, this.hubname);
        this.opts      = opts;
        this.conn_type = null;
        this.sender    = null;
        this.receiver  = null;
    }

    connect(conn_type) {
        this.conn_type = conn_type;

        var evt_obj = {};
        evt_obj['type'] = 'AzuEvtHubUtil:connect';
        evt_obj['conn_type'] = this.conn_type;

        if (this.conn_type === 'sender') {
            this.client.createSender().then((tx) => {
                this.sender = tx;
                this.emit('connect', evt_obj);
            });
        }
        // if (this.conn_type === 'receiver') {
        //     this.client.createReceiver('$Default', '0').then((tx) => {
        //         this.receiver = tx;
        //         this.emit('connect', evt_obj);
        //     });
        // }
    }

    send_message(msg) {
        var evt_obj = {};
        evt_obj['type'] = 'AzuEvtHubUtil:send_message';
        evt_obj['msg']  = msg;
        evt_obj['sent'] = false;

        if (this.sender) {
            var p = this.sender.send(msg);
            evt_obj['sent'] = true;
        }
        this.emit('send_message', evt_obj);
    }

}

module.exports.AzuEvtHubUtil = AzuEvtHubUtil;
