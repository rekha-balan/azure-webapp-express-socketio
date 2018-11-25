#!/bin/bash

# Azure WebApp Worker process bash script.
# Chris Joakim, 2018/11/25

node worker.js webapp_worker outbound > tmp/worker.log

# See https://coderwall.com/p/el3fbg/split-window-with-iterm-2
# Cmd+Shift+D splits the iTerm2 window vertically
