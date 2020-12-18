#!/bin/sh

# modify webpack config to have user's FedID as an environment variable
# available to Vue.js, using the "FEDID" environment variable that should be
# passed to the container at runtime
sed -i 's/DUMMY_FEDID/'"'$FEDID'"'/g' /config/www/webpack.config.js

# build code
npm run build

# start nginx server
echo "Starting Nginx"
nginx -g 'daemon off;'
