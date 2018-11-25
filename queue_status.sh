#!/bin/bash

# Check the status and depth of the two queues.
# Chris Joakim, 2018/11/25

q1=inbound
q2=outbound

echo 'checking queue '$q1
node worker.js queue_info $q1 | grep -E 'Status|Active|QueueName'

echo 'checking queue '$q2
node worker.js queue_info $q2 | grep -E 'Status|Active|QueueName'

echo 'done'