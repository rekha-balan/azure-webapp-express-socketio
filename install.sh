#!/bin/bash

# Install, then prune, npm libraries.
# Chris Joakim, 2018/11/25

rm -rf node_modules/

npm install

find . | grep node_modules/ > node_modules_files.txt

node prune_node_modules.js

find . | grep node_modules/ > node_modules_files_pruned.txt

./create_webjob_zip.sh

echo 'done'
