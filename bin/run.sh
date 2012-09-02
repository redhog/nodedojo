#!/bin/sh

#Move to the folder where ep-lite is installed
cd `dirname $0`

#Was this script started in the bin folder? if yes move out
if [ -d "../bin" ]; then
  cd "../"
fi

#Move to the node folder and start
echo "start..."
node node_modules/requirejs/bin/r.js ./node_modules/eh_plugin/static/amd/stage1.js $*
