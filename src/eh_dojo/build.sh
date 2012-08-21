cd "$(dirname $0)/static/amd"

wget http://download.dojotoolkit.org/release-1.8.0/dojo-release-1.8.0-src.tar.gz
tar -xvzf dojo-release-1.8.0-src.tar.gz > /dev/null
mv dojo-release-1.8.0-src/* .
rm -rf dojo-release-1.8.0-src dojo-release-1.8.0-src.tar.gz

patch -p2 < ../../dojo-requirejs.patch 
