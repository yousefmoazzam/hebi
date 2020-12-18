FROM nginx:1.19.4-alpine

RUN cd / && \
    apk add --no-cache libstdc++ && \
    wget https://unofficial-builds.nodejs.org/download/release/v12.8.1/node-v12.8.1-linux-x64-musl.tar.xz && \
    apk add --no-cache tar && \
    tar xf node-v12.8.1-linux-x64-musl.tar.xz && \
    rm node-v12.8.1-linux-x64-musl.tar.xz

ENV PATH="${PATH}:/node-v12.8.1-linux-x64-musl/bin"

WORKDIR /config/www/
COPY ./config/www/package*.json ./
RUN npm install

# copy hebi code; .dockerignore file doesn't seem to be seen by podman when
# building the image, so manually specify all the relevant files and dirs for
# now
COPY ./config/www/webpack.config.js .
COPY ./config/www/postcss.config.js .
COPY ./config/www/index.html .
COPY ./config/www/plugins_original.html .
COPY ./config/www/processing_original.html .
COPY ./config/www/plugins.html .
COPY ./config/www/processing.html .
COPY ./config/www/plugins_old_vue.html .
COPY ./config/www/processing_old_vue.html .
COPY ./config/www/css ./css
COPY ./config/www/src ./src

# copy nginx config
COPY ./config/nginx/site-confs/default /etc/nginx/conf.d/default.conf

# copy startup script
COPY ./entrypoint.sh /entrypoint.sh

CMD ["/entrypoint.sh"]
