#!/bin/sh

# modify webpack config to have user's FedID as an environment variable
# available to Vue.js, using the "FEDID" environment variable that should be
# passed to the container at runtime
sed -i 's/DUMMY_FEDID/'"'$FEDID'"'/g' /var/cache/nginx/config/www/webpack.config.js

# set ACTIVATE_CAS_AUTH in webpack config
if [ -z "{$ACTIVATE_CAS_AUTH+x}" ]; then
    echo "ACTIVATE_CAS_AUTH is not set, assume 'False' for dev"
    sed -i 's/DUMMY_ACTIVATE_CAS_AUTH/'"'False'"'/g' /var/cache/nginx/config/www/webpack.config.js
else
    echo "ACTIVATE_CAS_AUTH is set to: $ACTIVATE_CAS_AUTH"
    sed -i 's/DUMMY_ACTIVATE_CAS_AUTH/'"'$ACTIVATE_CAS_AUTH'"'/g' /var/cache/nginx/config/www/webpack.config.js
fi

# set CAS_SERVER in webpack config (for authentication, if desired in
# development)
if [ -z "{$CAS_SERVER+x}" ]; then
    echo "CAS_SERVER is not set, assume CAS auth is off in dev mode, so set to an empty string"
    sed -i 's/DUMMY_CAS_SERVER/''/g' /var/cache/nginx/config/www/webpack.config.js
else
    echo "CAS_SERVER is set to: $CAS_SERVER"
    sed -i 's~DUMMY_CAS_SERVER~'"'$CAS_SERVER'"'~g' /var/cache/nginx/config/www/webpack.config.js
fi

# set SERVICE in webpack config (for authentication, if desired in development)
if [ -z "{$SERVICE+x}" ]; then
    echo "SERVICE is not set, assume CAS auth is off in dev mode, so set to an empty string"
else
    echo "SERVICE env var is set to: $SERVICE"
    sed -i 's~DUMMY_SERVICE~'"'$SERVICE'"'~g' /var/cache/nginx/config/www/webpack.config.js
fi

# set ACTIVATE_WEBSOCKET in webpack config
if [ -z "{$ACTIVATE_WEBSOCKET+x}" ]; then
    echo "ACTIVATE_WEBSOCKET env var is not set, assume False for development"
    sed -i 's/DUMMY_ACTIVATE_WEBSOCKET/'"'False'"'/g' /var/cache/nginx/config/www/webpack.config.js
else
    echo "ACTIVATE_WEBSOCKET is set to: $ACTIVATE_WEBSOCKET"
    sed -i 's/DUMMY_ACTIVATE_WEBSOCKET/'"'$ACTIVATE_WEBSOCKET'"'/g' /var/cache/nginx/config/www/webpack.config.js
fi

# set WEBSOCKET_SERVER in webpack config
if [ -z "{$WEBSOCKET_SERVER+x}" ]; then
    echo "WEBSOCKET_SERVER env var is not set, assume an empty string for its value, and this will cause socket.io-client to default to the same as the domain of the machine that Hebi is running on"
    sed -i 's/DUMMY_WEBSOCKET_SERVER/''/g' /var/cache/nginx/config/www/webpack.config.js
else
    echo "WEBSOCKET_SERVER is set to: $WEBSOCKET_SERVER"
    sed -i 's~DUMMY_WEBSOCKET_SERVER~'"'$WEBSOCKET_SERVER'"'~g' /var/cache/nginx/config/www/webpack.config.js
fi

# build code
cd /var/cache/nginx/config/www
npm run build

# start nginx server
echo "Starting Nginx"
nginx -g 'daemon off;'
