FROM nginxinc/nginx-unprivileged:1.20-alpine

# build args for copying the appropriate files for dev or prod image; default
# to dev files if not passed when building the image
ARG NGINX_CONF=./config/nginx/site-confs/dev
ARG WEBPACK_CONFIG=./config/www/webpack.dev.js
ARG ENTRYPOINT_SCRIPT=./entrypoint-dev.sh

# for installing node
USER root

RUN cd / && \
    apk add --no-cache libstdc++ && \
    wget https://unofficial-builds.nodejs.org/download/release/v12.8.1/node-v12.8.1-linux-x64-musl.tar.xz && \
    apk add --no-cache tar xz && \
    tar xf node-v12.8.1-linux-x64-musl.tar.xz && \
    rm node-v12.8.1-linux-x64-musl.tar.xz

ENV PATH="${PATH}:/node-v12.8.1-linux-x64-musl/bin"

WORKDIR /var/cache/nginx/config/www
COPY ./config/www/package*.json ./
RUN npm install

# copy hebi code; .dockerignore file doesn't seem to be seen by podman when
# building the image, so manually specify all the relevant files and dirs for
# now
COPY ${WEBPACK_CONFIG} ./webpack.config.js
COPY ./config/www/postcss.config.js .
COPY ./config/www/index.html .
COPY ./config/www/login.html .
COPY ./config/www/plugins_original.html .
COPY ./config/www/processing_original.html .
COPY ./config/www/plugins.html .
COPY ./config/www/processing.html .
COPY ./config/www/plugins_old_vue.html .
COPY ./config/www/processing_old_vue.html .
COPY ./config/www/css ./css
COPY ./config/www/src ./src

# allow nginx user to build code in the app dir when the entrypoint.sh script
# is executed upon the container starting up
RUN chmod -R 777 /var/cache/nginx/config

# copy nginx config
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

# copy startup script
COPY ${ENTRYPOINT_SCRIPT} /entrypoint.sh

# switch back to unprivileged nginx user
USER nginx

CMD ["/entrypoint.sh"]
