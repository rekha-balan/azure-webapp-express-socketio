'use strict';

// Batch and Daemon processes for this application.
// Chris Joakim, 2018/11/25

const azu = require('./lib/azu');

class Main {

    constructor() {
        this.reader_svcbus_util = undefined;
        this.writer_svcbus_util = undefined;
        this.cache = undefined;
    }

    execute() {

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
                    var out_queue = process.argv[4] || 'outbound';
                    this.backend_daemon(in_queue, out_queue);
                    break;

                case 'webapp_worker':
                    var in_queue  = process.argv[3];
                    this.webapp_worker(in_queue);
                    break;

                case 'send_test_messages':
                    var out_queue = process.argv[3] || 'outbound';
                    var count = Number(process.argv[4] || '10');
                    this.send_test_messages(out_queue, count);
                    break;

                case 'queue_info':
                    var queue = process.argv[3] || 'outbound';
                    this.queue_info(queue);
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
        console.log('  node worker.js send_test_messages outbound 10');
        console.log('  node worker.js queue_info outbound');
    }

    backend_daemon(in_queue, out_queue) {
        // The "back end" process simulates Java on-prem processing.
        // TODO - implement later; webapp_worker() reading from first queue should suffice.
    }

    webapp_worker(in_queue) {
        console.log('start of webapp_worker on input queue: ' + in_queue);
        this.cache = new azu.AzuRedisUtil();
        this.cache.on('done', (evt_obj) => {
            console.log(JSON.stringify(evt_obj, null, 2));
        });
        var read_opts = { isPeekLock: false, timeoutIntervalInS: 5 };
        this.reader_svcbus_util = this.create_service_bus_util(in_queue);
        this.reader_svcbus_util.on('done', (evt_obj) => {
            console.log('evt_obj: ' + JSON.stringify(evt_obj, null, 2));
            if (evt_obj['message']) {
                // {"auth_user_id":"miles","socket_id":"QHkZZRZUVF_yy4Y5AAAA","date":"Sat Nov 24 2018 17:14:08 GMT-0500 (EST)","text":"gggg"}
                var body = JSON.parse(evt_obj['message']['body']);
                var auth_user_id = body['auth_user_id'];
                var socket_id = body['socket_id'];
                console.log('setting redis key ' + socket_id + ' -> ' + body);
                this.cache.set(socket_id, JSON.stringify(body));

                // {"auth_user_id":"elsa","socket_id":"Ydhk8m7AXlvns3L_AAAA","date":"Sat Nov 24 2018 17:32:47 GMT-0500 (EST)","text":"ggg"}
                // node_redis: Deprecated: The SET command contains a "undefined" argument.
                // This is converted to a "undefined" string now and will return an error from v.3.0 on.
                // Please handle this in your code to make sure everything works as you intended it to.
            }
            this.webapp_worker_read_next_message(in_queue, read_opts);
        });
        this.webapp_worker_read_next_message(in_queue, read_opts);
    }

    webapp_worker_read_next_message(in_queue, read_opts) {
        this.reader_svcbus_util.read_message_from_queue(in_queue, read_opts);
    }

    send_test_messages(out_queue, count) {
        var sb_util = this.create_service_bus_util(out_queue);
        sb_util.on('done', (evt_obj) => {
            console.log(JSON.stringify(evt_obj, null, 2));
        });

        for (var i = 0; i < count; i++) {
            var n = i + 1;
            var message = {};
            var body = {};
            body['auth_user_id'] = 'none';
            body['socket_id'] = '0';
            body['text'] = 'test message ' + n + ' from worker.js';
            body['date'] = (new Date()).toString();
            body['seq']  = n;
            message.body = JSON.stringify(body);
            sb_util.send_message_to_queue(message);
        }
    }

    queue_info(queue) {
        var sb_util = this.create_service_bus_util(queue);
        sb_util.on('done', (evt_obj) => {
            console.log(JSON.stringify(evt_obj, null, 2));
        });
        sb_util.get_queue_info(queue);
    }

    // send_sb_msg(qname, sessid) {
    //     console.log('send_sb_msg: ' + qname + ' ' + sessid);
    //     var opts = {};
    //     opts['queue_name'] = qname;
    //     opts['key_name']   = process.env.AZURE_SERVICEBUS_KEY_NAME;
    //     opts['key_value']  = process.env.AZURE_SERVICEBUS_ACCESS_KEY;
    //     console.log(opts);
    //     var sbu = new azu.AzuSvcBusUtil(opts);

    //     var message = {};
    //     var body = {};
    //     body['text'] = 'test message';
    //     body['date'] = (new Date()).toString();
    //     message.body = JSON.stringify(body);

    //     if (sessid !== 'none') {
    //         message.brokerProperties = {};
    //         message.brokerProperties['SessionId'] = sessid;
    //         message.brokerProperties['ReplyToSessionId'] = sessid;
    //     }

    //     sbu.on('done', (evt_obj) => {
    //         console.log(JSON.stringify(evt_obj, null, 2));
    //     });

    //     console.log('sending msg: ' + JSON.stringify(message, null, 2));
    //     sbu.send_message_to_queue(message, qname);
    // }

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
