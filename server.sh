#!/bin/bash

JSENGINE=node
REQUIREJS=js/lib/requirejs/r.js
REQUIREDIR=$(dirname "$REQUIREJS")

$JSENGINE $REQUIREJS js/my/_base.js
