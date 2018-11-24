#!/bin/bash

# Bash script to open a Redis CLI pointing to Azure Redis.
# Chris Joakim, 2018/11/24

# Sample Redis CLI Commands:
# > ping
# > set name chris
# > get name
# > incr counter
# > get counter
# > RPUSH queue1 "hello"
# > LPOP queue1
# > exit
#
# See https://redis.io/topics/rediscli

redis-cli -h $AZURE_REDISCACHE_HOST -p 6379 -a $AZURE_REDISCACHE_KEY

# Where the above environment variables have values like this:
# AZURE_REDISCACHE_HOST=cjoakimredis.redis.cache.windows.net
# AZURE_REDISCACHE_KEY=4v.....=
