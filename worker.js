'use strict';

// 
// Chris Joakim, 2018/11/24

const fs  = require('fs');
const azu = require('./lib/azu');

class Main {

    constructor() {
        this.in_qname = undefined;
        this.out_qname = undefined;
        this.reader_svcbus_util = undefined;
        this.writer_svcbus_util = undefined;
    }

    execute() {
        //console.log(process.argv);

        if (process.argv.length < 3) {
            console.log('error: too few command-line args provided.');
            this.display_command_line_options();
            process.exit();
        }
        else {
            var funct = process.argv[2];

            switch (funct) {

                case 'backend_daemon':
                    var in_queue  = process.argv[3] || 'inbound';
                    var out_queue = process.argv[4] || 'outbound'
                    this.backend_daemon(in_queue, out_queue);
                    break;

                case 'webapp_worker':
                    var in_queue  = process.argv[3];
                    console.log(in_queue);
                    this.webapp_worker(in_queue);
                    break;

                default:
                    console.log('error: unknown function - ' + funct);
                    this.display_command_line_options();
            }
        }
    }

    display_command_line_options() {
        console.log('command-line options:')
        console.log('  node worker.js backend_daemon inbound outbound');
        console.log('  node worker.js webapp_worker outbound');
        console.log('  node worker.js webapp_worker inbound  (for no back-end processing)');
    }

    backend_daemon(in_queue, out_queue) {
        this.in_qname = in_queue;
        this.out_qname = out_queue;

        this.reader_svcbus_util = this.create_service_bus_util(this.in_qname);
        this.writer_svcbus_util = this.create_service_bus_util(this.out_qname);

        // The "back end" process simulates Java on-prem processing.
        // TODO - implement later; webapp_worker() reading from first queue should suffice.
    }

    webapp_worker(in_queue) {
        this.in_qname = in_queue;

        this.reader_svcbus_util = this.create_service_bus_util(this.in_qname);
        this.reader_svcbus_util.on('done', (evt_obj) => {
            console.log(JSON.stringify(evt_obj, null, 2));
            this.webapp_worker_read_next_message();
        });
        this.webapp_worker_read_next_message();
    }

    webapp_worker_read_next_message() {
        this.reader_svcbus_util.read_message_from_queue(this.in_queue, {});
    }

    send_sb_msg(qname, sessid) {
        console.log('send_sb_msg: ' + qname + ' ' + sessid);
        var opts = {};
        opts['queue_name'] = qname;
        opts['key_name']   = process.env.AZURE_SERVICEBUS_KEY_NAME;
        opts['key_value']  = process.env.AZURE_SERVICEBUS_ACCESS_KEY;
        console.log(opts);
        var sbu = new azu.AzuSvcBusUtil(opts);

        var message = {};
        var body = {};
        body['text'] = 'test message';
        body['date'] = (new Date()).toString();
        message.body = JSON.stringify(body);

        if (sessid !== 'none') {
            message.brokerProperties = {};
            message.brokerProperties['SessionId'] = sessid;
            message.brokerProperties['ReplyToSessionId'] = sessid;
        }

        sbu.on('done', (evt_obj) => {
            console.log(JSON.stringify(evt_obj, null, 2));
        });

        console.log('sending msg: ' + JSON.stringify(message, null, 2));
        sbu.send_message_to_queue(message, qname);
    }

    read_sb_msg(qname, sessid) {
        console.log('read_sb_msg: ' + qname + ' ' + sessid);
        var opts = {};
        opts['queue_name'] = qname;
        opts['key_name']   = process.env.AZURE_SERVICEBUS_KEY_NAME;
        opts['key_value']  = process.env.AZURE_SERVICEBUS_ACCESS_KEY;
        console.log(opts);
        var sbu = new azu.AzuSvcBusUtil(opts);

        sbu.on('done', (evt_obj) => {
            console.log(JSON.stringify(evt_obj, null, 2));
        });

        if (sessid !== 'none') {
            // ???
            // message.brokerProperties = {};
            // message.brokerProperties['SessionId'] = sessid;
            // message.brokerProperties['ReplyToSessionId'] = sessid;
        }

        sbu.read_message_from_queue(qname, {});
    }

    create_service_bus_util(qname) {
        console.log('create_service_bus_util: ' + qname);
        var opts = {};
        opts['queue_name'] = qname;
        opts['key_name']   = process.env.AZURE_SERVICEBUS_KEY_NAME;
        opts['key_value']  = process.env.AZURE_SERVICEBUS_ACCESS_KEY;
        return new azu.AzuSvcBusUtil(opts);
    }
}

new Main().execute();
