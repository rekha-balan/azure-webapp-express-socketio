#!/bin/bash

# Create the webjob.zip file for deployment.
# Note: the zip file must be between 1 and 52,468,800 bytes.
# Chris Joakim, 2018/11/25

ant -f create_webjob_zip.xml

echo 'listing contents of webjob.zip:'
jar tvf webjob.zip

echo 'listing webjob files:'
ls -al | grep webjob.zip

echo 'done'
