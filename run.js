'use strict';

// Webjob for this application.
// Chris Joakim, 2018/11/25

var azu = require('./lib/azu');

class Main {

    constructor() {
        this.reader_svcbus_util = undefined;
        this.writer_svcbus_util = undefined;
        this.cache = undefined;
    }

    execute() {
        this.webapp_worker('outbound');
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
