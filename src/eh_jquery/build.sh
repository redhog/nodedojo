cd "$(dirname $0)/static/amd"

wget http://code.jquery.com/jquery-1.8.0.min.js
mv jquery-1.8.0.min.js jquery.js
sed -i -e 's+define("jquery",+define(+g' jquery.js
